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
    imgs.sort((a, b) => a.id - b.id); // sort the input on id

    let includedSteps = {}, // stores the steps which are included in the graph
        independentSteps = [];
    //build the graph
    var g = [];
    for (let img of imgs) {
        if (img.hasOwnProperty("depends")) {
            includedSteps[img.id] = true;
            for (let Did of img.depends) {
                includedSteps[Did] = true;
                g.push([Did, img.id]);
            }
        }
    }
    for (let img of imgs) {
        if (!includedSteps[img.id])
            independentSteps.push(img);
    }

    imgs = require('toposort')(g).map((id) => imgs[id - 1]); //topologically sort imgs
    imgs.push(...independentSteps);
    // console.log(imgs)

    let i = 0, rv = {};

    let cb = (out) => {
        rv[imgs[i].id] = out;
        if (i < imgs.length - 1) {
            console.log(imgs[i].id);
            i++;
            if (typeof imgs[i].input === 'number') imgs[i].input = rv[imgs[i].input];
            process(imgs[i].input, imgs[i].steps, cb);
        } else {



            /* Here we want combine the images */

            var html = `<html>`
            for (let img of Object.values(rv)) {
                html += `<img src= "${img}">`
            }
            html += `</html>`
            res.send(html);
        }
    }
    if (typeof imgs[0].input === 'number') imgs[0].input = rv[img[0].input];

    process(imgs[0].input, imgs[0].steps, cb);

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
