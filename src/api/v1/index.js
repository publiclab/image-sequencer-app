const router = require('express').Router(),
    sequencer = require('image-sequencer');


router.post("/process", (req, res) => {

    /*  Import the image into sequencer, possibly from the url
        Next step is to import the sequence given as the string
        then we generate the ouput and return as data URI or
        upload it imgur and return the url of the image.
    */
    const img = req.body.url,
        sequence = req.body.sequence,
        upload = req.body.upload === 'true';
    process(img, sequence, (out) => {
        res.status(200).send({ data: out });
    });

});

router.get("/process", (req, res) => {

    req.query.urls = JSON.parse(req.query.urls)
    console.log(req.query)
    const imgs = req.query.urls,
        sequence = req.query.sequence,
        upload = req.query.upload === 'true';

    let i = 0
    let cb = (out) => {
        imgs[i] = out;
        if (i < imgs.length - 1) {
            console.log(i);
            i++;
            process(imgs[i], sequence, cb);
        } else {

            /* Here we want combine the images */

            var html = `<html>`
            for (let img of imgs) {
                html += `<img src= "${img}">`
            }
            html += `</html>`
            res.send(html);
        }
    }
    process(imgs[0], sequence, cb)

})


router.use("/", (req, res) => {
    res.sendStatus(404);
});

function process(img, sequence, cb) {

    const sequencerInstance = sequencer({ ui: false });
    sequencerInstance.loadImages(img, () => {
        sequencerInstance.importString(sequence);
        sequencerInstance.run(cb);
    });
}

module.exports = router;
