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
        upload = req.body.upload === 'true',
        redirect = req.body.redirect === 'true';
    sequencer.loadImages(img, () => {
        sequencer.importString(sequence);
        sequencer.run(out => {
            res.status(200);
            redirect ? res.redirect(out) : res.send({ data: out });
        });
    });
});


router.use("/", (req, res) => {
    res.sendStatus(404);
});

module.exports = router;
