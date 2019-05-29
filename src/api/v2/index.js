const app = require('express').Router(),
    sequencer = require('image-sequencer');

app.use('/convert', (req, res) => {
    require("axios").get(req.query.url || req.body).then(function(data) {
        res.send(req.protocol + '://' + req.get('host') + "api/v2/process" + `/?steps=${JSON.stringify(require('./util/converter-multiSequencer')(data.data))}`);
    });
});

app.use('/export', (req, res) => {
    let url = req.query.url || req.body;
    require("axios").get(url).then(function(data) {
        res.redirect(req.protocol + '://' + req.get('host') + "/api/v2/process" + `/?steps=${JSON.stringify(require('./util/converter-multiSequencer')(data.data))}`);
    });
});

app.get("/process", (req, res) => {

    let body = req.query;
    body.steps = JSON.parse(body.steps);


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

    var i = 0, rv = {};

    let cb = (out) => {
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
                } else {
                    i++;
                    process(imgs[j].input, imgs[j].steps, rv, imgs, j, cb);
                }
            }
        } else {
            var html = `<html>`
            html += `<img src= "${out}">`
            html += `</html>`
            res.send(html);
        }
    }
    for (let j = i; j < imgs.length; j++) {
        if (imgs[j].depends.length == 0) {
            i++;
            process(imgs[j].input, imgs[j].steps, rv, imgs, i - 1, cb);
        } else {
            break;
        }
    }
});


app.use("/", (req, res) => {
    res.sendStatus(404);
});

function process(img, sequence, rv, imgs, num, cb) {

    if (typeof img === 'number') img = rv[img];
    for (let key of Object.keys(rv)) {
        sequence = sequence.replace(`output>${key}`, encodeURIComponent(rv[key]));
    }
    const sequencerInstance = sequencer({ ui: false });
    sequencerInstance.loadImages(img, () => {
        sequencerInstance.loadNewModule('overlay', require('image-sequencer-app-overlay'));
        sequencerInstance.importString(sequence);
        sequencerInstance.run((out) => {
            rv[imgs[num].id] = out;
            cb(out);
        });
    });
}

module.exports = app;