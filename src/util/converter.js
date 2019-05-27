module.exports = function convert(arr) {
    let rv = []
    let minX, maxX, minY, maxY, width = 0, height = 0;
    for (let obj of arr) {
        width += obj.width;
        height += obj.height;
        for (let node of obj["nodes"]) {
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
    while (width * height * 4 > Math.pow(2, 26)) {
        width /= 2;
        height /= 2;
    }
    let lMins = [];
    for (let obj of arr) {
        let vals = { input: obj.src }
        let flag = false, coords = []
        for (let node of obj["nodes"]) {
            flag = true;
            coords.push({ x: Math.round((node.lon - minX) * width / (maxX - minX)), y: Math.round((node.lat - minY) * height / (maxY - minY)) });
        }
        if (flag) {
            vals.steps = `webgl-distort{${encodeURIComponent(`nw:${coords[0].x}%2C${coords[0].y}|ne:${coords[1].x}%2C${coords[1].y}|se:${coords[2].x}%2C${coords[2].y}|sw:${coords[3].x}%2C${coords[3].y}`)}}`
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
        }
    }
    let obj = { id: 1, input: rv[0].input }
    let str = rv[0].steps + `,canvas-resize{width:${width}|height:${height}|x:${lMins[0].x}|y:${lMins[0].y}}`;
    for (let i in rv) {
        if (i == 0) continue;
        str += `,import-image{url:${rv[i].input}},${rv[i].steps},overlay{x:${lMins[i].x}|y:${lMins[i].y}}`
    }
    obj.steps = str;
    return [obj];
}
