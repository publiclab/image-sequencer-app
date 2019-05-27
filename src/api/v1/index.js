const router = require('express').Router(),
    sequencer = require('image-sequencer');


// router.post("/process", (req, res) => {

//     /*  Import the image into sequencer, possibly from the url
//         Next step is to import the sequence given as the string
//         then we generate the ouput and return as data URI or
//         upload it imgur and return the url of the image.
//     */
//     const imgs = req.body.images,
//         upload = req.body.upload === 'true';
//     process(img, sequence, (out) => {
//         res.status(200).send({ data: out });
//     });

// });

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

})


router.use("/", (req, res) => {
    res.sendStatus(404);
});

function process(img, sequence, cb) {

    const sequencerInstance = sequencer({ ui: true });
    sequencerInstance.loadNewModule('overlay', require('image-sequencer-app-overlay'))
    sequencerInstance.loadImages(img, () => {
        sequencerInstance.importString(sequence);
        sequencerInstance.run(cb);
    });
}

module.exports = router;
