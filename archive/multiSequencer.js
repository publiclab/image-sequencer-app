const app = require('express')(),
    sequencer = require('image-sequencer');
const bp = require('body-parser');
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

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

app.get("/process", (req, res) => {

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
    // console.log(imgs[num].id)
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

app.listen(8000, () => {
    console.log("MultiSequencer server started at port 8000");
})