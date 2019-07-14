module.exports = function convert(arr,scale) {
    let rv = []
    let id = 1;
    let minX, maxX, minY, maxY;
    for (let obj of arr) {
        for (let node of obj["nodes"]) {
            node.lat = parseFloat(node.lat);
            node.lon = parseFloat(node.lon);
            if (!minX || minX > node.lon) {
                minX = node.lon;
            }
            if (!minY || minY > node.lat) {
                minY = node.lat;
            }
            if (!maxX || maxX < node.lon) {
                maxX = node.lon;
            }
            if (!maxY || maxY < node.lat) {
                maxY = node.lat;
            }
        }
    }

    let dependsArray = [];
    let lMins = [];
    for (let obj of arr) {
        let vals = { id: id, input: obj.src, depends: [] }
        let flag = false, coords = []
        id++;
        for (let node of obj["nodes"]) {
            flag = true;
            coords.push({ x: Math.round((node.lon - minX) * Math.cos(node.lat * Math.PI / 180) * 111 * 1000 * scale / (maxX - minX)), y: Math.round((node.lat - minY) * 1000 * 111 * scale / (maxY - minY)) });
        }
        console.log(coords)
        if (flag) {
            vals.steps = `webgl-distort{${encodeURIComponent(`nw:${coords[0].x}%2C${coords[0].y}|ne:${coords[1].x}%2C${coords[1].y}|se:${coords[2].x}%2C${coords[2].y}|sw:${coords[3].x}%2C${coords[3].y}`)}}`
            dependsArray.push(vals.id);
            let lminX, lminY;
            for (let o of coords) {
                if (lminX === undefined || lminX > o.x) {
                    lminX = o.x;
                }
                if (lminY === undefined || lminY > o.y) {
                    lminY = o.y;
                }
            }
            lMins.push({ x: lminX, y: lminY });
            rv.push(vals);
        } else {
            id--;
        }
    }
    let vals = { id: id, input: rv[0].id, depends: dependsArray };
    vals.steps = `canvas-resize{width:${1000}|height:${1000}|x:${lMins[0].x}|y:${lMins[0].y}}`;
    for (let i in rv) {
        if (i == 0) continue;
        vals.steps += `,import-image{url:output>${rv[i].id}},overlay{x:${lMins[i].x}|y:${lMins[i].y}}`;
    }
    rv.push(vals)
    return rv;
}

// require("axios").get("https://mapknitter.org/maps/ceres--2/warpables.json").then(function(data) {
//     console.log(`https://us-central1-public-lab.cloudfunctions.net/is-function-edge/?steps=${JSON.stringify(convert(data.data))}`);
// })
