const proj = require('proj4')

module.exports = function convert(arr, scale) {
    let rv = []
    let id = 1;
    scale = 100.0/scale; // convert from cm/px (the MapKnitter resolution standard) to px/meter, which we're using here

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
    let finalMaxLon = 0, finalMaxLat = 0;
    for (let obj of arr) {
        let vals = { id: id, input: obj.src, depends: [] }
        let flag = false, coords = []
        id++;

        if (obj.nodes.length > 0) {
            // reorder from 0, 2, 1, 3 to 3, 1, 2, 0
            // let nodes = [
            //     obj["nodes"][3],
            //     obj["nodes"][2],
            //     obj["nodes"][1],
            //     obj["nodes"][0]
            // ];
            let nodes = [
                obj["nodes"][0],
                obj["nodes"][1],
                obj["nodes"][2],
                obj["nodes"][3],
            ];
            let [minX, minY] = proj('WGS84', 'EPSG:900913', [minLon, maxY]);

            // collect coordinates relative to minLon, minLat origin
            for (let node of nodes) {
                let coord = proj('WGS84', 'EPSG:900913', [node.lon, node.lat]);
                coords.push({
                    x: Math.round((coord[0] - minX) * scale),
                    y: Math.round((coord[1] - minY) * scale) * -1
                });
            }
            vals.steps = `webgl-distort{${encodeURIComponent(`nw:${coords[0].x}%2C${coords[0].y}|ne:${coords[1].x}%2C${coords[1].y}|se:${coords[2].x}%2C${coords[2].y}|sw:${coords[3].x}%2C${coords[3].y}`)}}`

            dependsArray.push(vals.id);
            let lminLon, lminLat, lmaxLon, lmaxLat;
            for (let o of coords) {
                if (lminLon === undefined || lminLon > o.x) {
                    lminLon = o.x;
                }
                if (lminLat === undefined || lminLat > o.y) {
                    lminLat = o.y;
                }
                if (lmaxLon === undefined || lmaxLon < o.x) {
                    lmaxLon = o.x;
                }
                if (lmaxLat === undefined || lmaxLat < o.y) {
                    lmaxLat = o.y;
                }
            }
            if (lmaxLat > finalMaxLat) finalMaxLat = lmaxLat;
            if (lmaxLon > finalMaxLon) finalMaxLon = lmaxLon;

            vals.steps += `,trim{}`
            vals.steps += `,resize{${encodeURIComponent(`w:${lmaxLon - lminLon}|h:${lmaxLat - lminLat}`)}}`

            lMins.push({ x: lminLon, y: lminLat });
            console.log(coords)
            rv.push(vals);
        }
        else {
            id--;
        }
    }

    console.log(`Final Dimensions: ${finalMaxLon} X ${finalMaxLat}`)

    let vals = { id: id, input: rv[0].id, depends: dependsArray };
    vals.steps = `canvas-resize{width:${finalMaxLon}|height:${finalMaxLat}|x:${0}|y:${0}}`;
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
