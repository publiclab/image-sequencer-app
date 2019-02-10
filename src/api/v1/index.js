const router = require('express').Router(),
    sequencer = require('image-sequencer')({ ui: false });


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

    console.log(req.query)
    const img = req.query.url,
        sequence = req.query.sequence,
        upload = req.query.upload === 'true';
    process(img, sequence, (out) => {
        res.send(`<html>
                    <img src= "${out}">
                    </html>`);
    })
})


router.use("/", (req, res) => {
    res.sendStatus(404);
});

function process(img, sequence, cb) {

    sequencer.loadImages(img, () => {
        sequencer.importString(sequence);
        sequencer.run(cb);
    });
}

module.exports = router;
