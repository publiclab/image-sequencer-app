const proj = require('proj4')

module.exports = function convert(arr, scale) {
    let rv = []
    let id = 1;

    // find min/max coordinates
    let minLon, maxX, minLat, maxY;
    for (let obj of arr) {
        obj.width = parseInt(obj.width)
        obj.height = parseInt(obj.height)
        for (let node of obj["nodes"]) {
            node.lat = parseFloat(node.lat);
            node.lon = parseFloat(node.lon);
            if (!minLon || minLon > node.lon) {
                minLon = node.lon;
            }
            if (!minLat || minLat > node.lat) {
                minLat = node.lat;
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

        if (obj.nodes.length > 0) {
            // reorder from 0, 2, 1, 3 to 3, 1, 2, 0
            let nodes = [
                obj["nodes"][3],
                obj["nodes"][2],
                obj["nodes"][1],
                obj["nodes"][0]
            ];
            let [minX, minY] = proj('WGS84','EPSG:900913', [minLon, minLat]);

            // collect coordinates relative to minLon, minLat origin
            for (let node of nodes) {
                flag = true;
                let coord = proj('WGS84','EPSG:900913', [node.lon, node.lat]);
                coords.push({
                    x: Math.round((coord[0] - minX) * scale),
                    y: Math.round((coord[1] - minY) * scale) * -1
                });
            }
            if (flag) {
                vals.steps = `webgl-distort{${encodeURIComponent(`nw:${coords[0].x}%2C${coords[0].y}|ne:${coords[1].x}%2C${coords[1].y}|se:${coords[2].x}%2C${coords[2].y}|sw:${coords[3].x}%2C${coords[3].y}`)}}`
 
                dependsArray.push(vals.id);
                let lminLon, lminLat;
                for (let o of coords) {
                    if (lminLon === undefined || lminLon > o.x) {
                        lminLon = o.x;
                    }
                    if (lminLat === undefined || lminLat > o.y) {
                        lminLat = o.y;
                    }
                }
                lMins.push({ x: lminLon, y: lminLat });
                rv.push(vals);
            } else {
                id--;
            }
        }
    }

    let vals = { id: id, input: rv[0].id, depends: dependsArray };
    vals.steps = `canvas-resize{width:${1000}|height:${1000}|x:${0}|y:${0}}`;
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
