const app = require('express').Router(),
    sequencer = require('image-sequencer'),
    fs = require('fs'),
    pid = require('process').pid + "" + Math.round(Math.random() * 1000);
const { Storage } = require('@google-cloud/storage'), path = require('path');
const gCloud = new Storage();

const mapknitterBucket = gCloud.bucket('mapknitter-is');
app.use('/convert', (req, res) => {
    console.log("Converter endpoint hit for url" + req.query.url);
    require("axios").get(req.query.url || req.body).then(function(data) {
        res.send(req.protocol + '://' + req.get('host') + "api/v2/process" + `/?steps=${JSON.stringify(require('./util/converter-multiSequencer')(data.data))}`);
        console.log("Response sent from converter endpoint for url" + req.query.url);
    });
});

app.use('/export', (req, res) => {
    let url = req.query.url || req.body;
    let scale = req.query.scale
    console.log("Export endpoint hit for url " + url);
    require("axios").get(url).then(function(data) {
        res.redirect(req.protocol + '://' + req.get('host') + "/api/v2/process" + `/?upload=${req.query.upload}&scale=${scale}&steps=${JSON.stringify(require('./util/converter-multiSequencer')(data.data, parseFloat(scale)))}`);
        console.log("Export endpoint redirected to process for url " + url);
    });
});

app.get("/process", (req, res) => {

    let body = req.query;
    body.steps = JSON.parse(body.steps);

    console.log("Processing started with id " + pid + "\nThe following are the steps:\n" + JSON.stringify(body.steps));
    console.log(`Using Scale: ${body.scale}`)

    let imgs = body.steps,
        upload = body.upload === 'true';
    imgs.sort((a, b) => a.id - b.id); // sort the input on id

    //build the graph
    var g = [];
    for (let img of imgs) {
        if (img.hasOwnProperty("depends")) {
            for (let Did of img.depends) {
                g.push([Did, img.id]);
            }
        }
    }


    let sortedImgs = require('toposort')(g).map((id) => imgs[id - 1]); //topologically sort imgs
    if (sortedImgs.length == 0) {
        sortedImgs.push[imgs.length - 1]; // For the case with only 1 step
    }
    imgs = sortedImgs;

    var i = 0, rv = {}, processCount = 0;

    let cb = (out) => {
        processCount--;
        if (i < imgs.length) {
            for (let j = i; j < imgs.length; j++) {
                let flag = true;
                for (let num of imgs[j].depends) {
                    if (!Object.keys(rv).includes(num + '')) {
                        flag = false;
                        break;
                    }
                }
                if (flag == false) {
                    break;
                } else if (processCount < 5) {
                    i++;
                    processCount++;
                    process(imgs[j].input, imgs[j].steps, rv, imgs, j, cb);
                }
            }
        } else {
            console.log("Done processing for " + pid);
            var html = `<html>`
            html += `<img width="100%" src= "${out}">`
            html += `</html>`
            if (upload) {
                fs.writeFileSync(path.join(__dirname, `../../../temp/export${pid}.html`), html);
                mapknitterBucket.upload(path.join(__dirname, `../../../temp/export${pid}.html`), {
                    gzip: true
                }).then(() => {
                    mapknitterBucket
                        .file(`export${pid}.html`)
                        .makePublic();
                    fs.unlinkSync(path.join(__dirname, `../../../temp/export${pid}.html`));
                });
            } else {
                res.send(html);
            }
        }
    }
    for (let j = i; j < imgs.length; j++) {
        if (imgs[j].depends.length == 0) {
            i++;
            process(imgs[j].input, imgs[j].steps, rv, imgs, i - 1, cb);
        } else {
            if (upload)
                res.status(200).send(`Your Image is exporting, to load Image please visit, ${req.protocol + '://' + req.get('host') + "/api/v2/status/?pid=" + pid}`);
            break;
        }
    }
});

app.get("/status", (req, res) => {
    mapknitterBucket.getFiles().then((files) => {
        let index = files[0].map(el => el.metadata.name).indexOf(`export${req.query.pid}.html`);
        if (index != -1)
            res.redirect(files[0][index].metadata.mediaLink);
        else
            res.send("Still working on it");
    });
});


app.use("/", (req, res) => {
    res.sendStatus(404);
});

function process(img, sequence, rv, imgs, num, cb) {

    if (typeof img === 'number') img = rv[img];
    for (let key of Object.keys(rv)) {
        sequence = sequence.replace(`output>${key}`, encodeURIComponent(rv[key]));
    }
    const sequencerInstance = sequencer({ ui: true });
    sequencerInstance.loadImages(img, () => {
        sequencerInstance.loadNewModule('overlay', require('image-sequencer-app-overlay'));
        sequencerInstance.loadNewModule('resize', require('image-sequencer-app-resize'));
        sequencerInstance.importString(sequence);
        sequencerInstance.run((out) => {
            rv[imgs[num].id] = out;
            cb(out);
        });
    });
}

module.exports = app;
