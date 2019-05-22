function convert(arr) {
    let rv = []
    let id = 1;
    for (let obj of arr) {
        let minX, maxX, minY, maxY;
        for (let node of obj["nodes"]) {
            if (!minX || minX > node.lat) {
                minX = node.lat;
            }
            if (!minY || minY > node.lon) {
                minY = node.lon;
            }
            if (!maxX || maxX < node.lat) {
                maxX = node.lat;
            }
            if (!maxY || maxY < node.lon) {
                maxY = node.lon;
            }
        }
        let vals = { id: id, input: obj.src }
        let flag = false, coords = []
        id++;
        for (let node of obj["nodes"]) {
            flag = true;
            coords.push({ x: (node.lat - minX) * obj.width / (maxX - minX), y: (node.lon - minY) * obj.height / (maxY - minY) });
        }
        if (flag) {
            vals.steps = `webgl-distort{nw:${coords[3].x},${coords[3].y}|ne:${coords[0].x},${coords[0].y}|sw:${coords[1].x},${coords[1].y}|sw:${coords[2].x},${coords[2].y}}`
            rv.push(vals);
        }
    }

    return rv;
}

let a = [
    {
        cm_per_pixel: 24.771,
        created_at: "2019-04-30T20:40:21Z",
        deleted: false,
        height: 166,
        history: "",
        id: 312455,
        image_content_type: "image/png",
        image_file_name: "test.png",
        image_file_size: 103148,
        locked: false,
        map_id: 13238,
        nodes: [
            {
                author: "warren",
                body: null,
                color: "black",
                created_at: "2019-04-30T20:40:36Z",
                description: "",
                id: 2629578,
                lat: 41.8200720823,
                lon: -71.4033919887,
                map_id: 0,
                name: "",
                order: 0,
                updated_at: "2019-04-30T20:40:36Z",
                way_id: 0,
                way_order: 0
            },
            {
                author: "warren",
                body: null,
                color: "black",
                created_at: "2019-04-30T20:40:36Z",
                description: "",
                id: 2629579,
                lat: 41.8199361572,
                lon: -71.4029521064,
                map_id: 0,
                name: "",
                order: 0,
                updated_at: "2019-04-30T20:40:36Z",
                way_id: 0,
                way_order: 0
            },
            {
                author: "warren",
                body: null,
                color: "black",
                created_at: "2019-04-30T20:40:36Z",
                description: "",
                id: 2629580,
                lat: 41.8197102811,
                lon: -71.4030567126,
                map_id: 0,
                name: "",
                order: 0,
                updated_at: "2019-04-30T20:40:36Z",
                way_id: 0,
                way_order: 0
            },
            {
                author: "warren",
                body: null,
                color: "black",
                created_at: "2019-04-30T20:40:36Z",
                description: "",
                id: 2629581,
                lat: 41.8198082274,
                lon: -71.4035100059,
                map_id: 0,
                name: "",
                order: 0,
                updated_at: "2019-04-30T20:40:36Z",
                way_id: 0,
                way_order: 0
            }
        ],
        parent_id: null,
        thumbnail: null,
        updated_at: "2019-04-30T20:40:36Z",
        width: 214,
        src: "https://s3.amazonaws.com/grassrootsmapping/warpables/312455/test.png",
        srcmedium: "https://s3.amazonaws.com/grassrootsmapping/warpables/312455/test_medium.png"
    },
    {
        cm_per_pixel: 0,
        created_at: "2019-04-30T20:40:25Z",
        deleted: false,
        height: 166,
        history: "",
        id: 312456,
        image_content_type: "image/png",
        image_file_name: "test.png",
        image_file_size: 103148,
        locked: false,
        map_id: 13238,
        nodes: [],
        parent_id: null,
        thumbnail: null,
        updated_at: "2019-04-30T20:40:25Z",
        width: 214,
        src: "https://s3.amazonaws.com/grassrootsmapping/warpables/312456/test.png",
        srcmedium: "https://s3.amazonaws.com/grassrootsmapping/warpables/312456/test_medium.png"
    }
];

console.log(convert(a))