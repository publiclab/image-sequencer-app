const router = require('express').Router(),
    sequencer = require('image-sequencer');


router.get("/process", (req, res) => {

    let body;
    if (Object.keys(req.body).length === 0) {
        body = req.query;
        body.steps = JSON.parse(body.steps)
    }
    else
        body = req.body;


    let imgs = body.steps,
        upload = body.upload === 'true';

    process(imgs[0].input, imgs[0].steps, function(data) {
        var html = `<html>`
        html += `<img src= "${data}">`
        html += `</html>`
        res.send(html);
    });

});

router.get("/convert", (req, res) => {
    require("axios").get(req.query.url).then(function(data) {
        res.send(req.protocol + '://' + req.get('host') + req.baseUrl + "/process" + `/?steps=${JSON.stringify(require('./util/converter')(data.data))}`);
    });
});
router.use('/export', (req, res) => {
    let url = req.query.url || req.body;
    require("axios").get(url).then(function(data) {
        res.redirect(req.protocol + '://' + req.get('host') + "/api/v1/process" + `/?steps=${JSON.stringify(require('./util/converter')(data.data))}`);
    });
});


router.use("/", (req, res) => {
    res.sendStatus(404);
});

function process(img, sequence, cb) {

    const sequencerInstance = sequencer({ ui: false });
    sequencerInstance.loadNewModule('overlay', require('image-sequencer-app-overlay'))
    sequencerInstance.loadImages(img, () => {
        sequencerInstance.importString(sequence);
        sequencerInstance.run(cb);
    });
}

module.exports = router;
