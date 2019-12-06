const app = require('express').Router(),
    pid = require('md5')(Date.now()) + "-" + Math.round(Math.random() * 100000);

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
    console.log("REQUEST",req.query)
    let scale = req.query.scale
    // supplying a URL for a remote images JSON file:
    if (req.query.url) {
      var url = req.query.url || req.body;
      console.log("Export endpoint hit for url " + url);
      require("axios").get(url).then(redirectToProcess);
    } else { // supplying JSON for images directly:
      redirectToProcess({data: req.query.collection});
    }
    function redirectToProcess(data) {
      if (req.query.url) console.log("Export endpoint redirected to process for url " + url);
      else console.log("Processing enclosed JSON: " + req.query.collection)
      res.redirect(req.protocol + '://' + req.get('host') + "/api/v2/process" + `/?upload=${req.query.upload}&scale=${scale}&steps=${JSON.stringify(require('./util/converter-multiSequencer')(data.data, parseFloat(scale)))}`);
    }

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
    require('child_process').fork(require('path').join(__dirname, './util/process-multisequencer.js'), ['--imgs=' + JSON.stringify(imgs), '--pid=' + pid]);

    res.status(200).send(`Your Image is exporting, to load Image please visit, ${req.protocol + '://' + req.get('host') + "/api/v2/status/?pid=" + pid}`);

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

module.exports = app;
