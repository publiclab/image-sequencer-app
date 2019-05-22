function convert(arr) {
    let rv = []
    let id = 1;
    for (let obj of arr) {
        let minX, maxX, minY, maxY;
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
        let vals = { id: id, input: obj.src }
        let flag = false, coords = []
        id++;
        for (let node of obj["nodes"]) {
            flag = true;
            coords.push({ x: Math.round((node.lon - minX) * obj.width / (maxX - minX)), y: Math.round((node.lat - minY) * obj.height / (maxY - minY)) });
        }
        console.log(coords)
        if (flag) {
            vals.steps = `webgl-distort{${encodeURIComponent(`nw:${coords[2].x}%2C${coords[2].y}|ne:${coords[3].x}%2C${coords[3].y}|se:${coords[0].x}%2C${coords[0].y}|sw:${coords[1].x}%2C${coords[1].y}`)}}`
            rv.push(vals);
        }
    }

    return rv;
}

require("axios").get("https://mapknitter.org/maps/pvdtest/warpables.json").then(function(data) {
    console.log(data.data[0].nodes)
    console.log(convert(data.data))
})
