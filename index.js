const express = require('express'),
    sequencer = require('image-sequencer')({ ui: false }),
    bp = require('body-parser');

const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.post("/", (req, res) => {

    /*  Import the image into sequencer, possibly from the url
        Next step is to import the sequence given as the string
        then we generate the ouput and return as data URI or
        upload it imgur and return the url of the image.
    */

    const img = req.body.url,
        sequence = req.body.sequence;
    sequencer.loadImages(img, () => {
        sequencer.importString(sequence);
        sequencer.run(out => {
            res.send({ data: out });
        });
    });
});

app.listen(4000, () => console.log("Server started on port 4000"));