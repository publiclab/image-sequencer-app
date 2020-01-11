const maxConcurrency = 10;

const sequencer = require('image-sequencer'),
    fs = require('fs');
const { Storage } = require('@google-cloud/storage'), path = require('path');
const gCloud = new Storage();
const argv = require('yargs').argv;
const mapknitterBucket = gCloud.bucket('mapknitter-is');

var imgs = JSON.parse(argv.imgs),
    pid = argv.pid,
    jsonPath = path.join(__dirname, `../../../../temp/${pid}.json`);

var uploadOptions = {
    destination: mapknitterBucket.file(`${pid}.json`),
    resumable: false
};

function process_function(img, sequence, rv, imgs, num, cb) {

    console.log("Current Concurrency: " + process_functionCount);

    if (typeof img === 'number') img = rv[img];
    for (let key of Object.keys(rv)) {
        sequence = sequence.replace(`output>${key}`, encodeURIComponent(rv[key]));
    }
    const sequencerInstance = sequencer({ ui: true });
    sequencerInstance.loadImages(img, () => {
        sequencerInstance.loadNewModule('overlay', require('image-sequencer-app-overlay'));
        sequencerInstance.loadNewModule('trim', require('image-sequencer-trim'));
        sequencerInstance.loadNewModule('resize', require('image-sequencer-app-resize'));
        sequencerInstance.importString(sequence);
        sequencerInstance.run((out) => {
            rv[imgs[num].id] = out;
            cb(out);
        });
    });
}

var i = 0, rv = {}, process_functionCount = 0;

let cb = (out) => {
    process_functionCount--;
    if (i < imgs.length && process_functionCount < maxConcurrency) {
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
            } else if (process_functionCount < maxConcurrency) {
                i++;
                if (i == imgs.length)
                    changeStatus("compositing");
                process_functionCount++;
                process_function(imgs[j].input, imgs[j].steps, rv, imgs, j, cb);
            }
        }
    } else {
        changeStatus("uploading");
        console.log("Done processing for " + pid);
        var html = `<html>`
        html += `<img width="100%" src= "${out}">`
        html += `</html>`
        fs.writeFileSync(path.join(__dirname, `../../../../temp/export${pid}.html`), html);
        mapknitterBucket.upload(path.join(__dirname, `../../../../temp/export${pid}.html`), {
            gzip: true
        }).then(() => {
            mapknitterBucket
                .file(`export${pid}.html`)
                .makePublic();
            fs.unlinkSync(path.join(__dirname, `../../../../temp/export${pid}.html`));
            mapknitterBucket.file(`export${pid}.html`)
                .getMetadata()
                .then((data) => changeStatus("uploaded", data[0].mediaLink));
        });
    }
}

changeStatus("warping");
for (let j = i; j < imgs.length; j++) {
    if (imgs[j].depends.length == 0 && process_functionCount < maxConcurrency) {
        i++;
        process_functionCount++;
        process_function(imgs[j].input, imgs[j].steps, rv, imgs, i - 1, cb);
    } else {
        break;
    }
}

function changeStatus(newStatus, exportLink) {
    let statusJson = JSON.parse(fs.readFileSync(jsonPath));
    statusJson.status = newStatus;
    if (exportLink)
        statusJson.jpg = exportLink;
    console.log(statusJson);
    fs.writeFile(jsonPath, JSON.stringify(statusJson), () => {
        mapknitterBucket.upload(jsonPath, uploadOptions);
        if (exportLink)
            fs.unlink(jsonPath, () => {
                console.log("Successfully removed local files!");
            });
    });
}