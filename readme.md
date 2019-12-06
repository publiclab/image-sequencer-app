# Mapknitter-Exporter-js
A simple app based on the Image sequencer project to run mapknitter exports in the cloud.

npm: [https://npmjs.com/package/image-sequencer](https://npmjs.com/image-sequencer)

github: [Image Sequencer](https://github.com/publiclab/image-sequencer)

[![Build Status](https://travis-ci.org/publiclab/image-sequencer-app.svg?branch=main)](https://travis-ci.org/publiclab/image-sequencer-app)

## Usage

v2: (Concurrent processing, fast)

Basic endpoint: `/api/v2/export/?url=http://example.com/warpables.json&scale=<integer>`

Setting `upload=true` will also upload the output to Google Cloud storage, and return a URL to a persistent JSON status file, also at Google Cloud storage, which will be updated progressively to reflect export progress.

A POST request can be sent enclosing a JSON collection of image URLs and coordinates, as follows:

```js
var json = [{"nodes":[
                {"lat":"41.8200378187","lon":"-71.4034409085"},
                {"lat":"41.8199873593","lon":"-71.4030021564"},
                {"lat":"41.8196229772","lon":"-71.4029728831"},
                {"lat":"41.8198214546","lon":"-71.4034614433"}
            ],
            "cm_per_pixel":23.0934,
            "src":"https://s3.amazonaws.com/grassrootsmapping/warpables/312455/test.png"},
            {"nodes":[
                {"lat":"41.819898342","lon":"-71.4035387139"},
                {"lat":"41.819898342","lon":"-71.4028493862"},
                {"lat":"41.8195005594","lon":"-71.4028493862"},
                {"lat":"41.8195005594","lon":"-71.4035387139"}
            ],
            "cm_per_pixel":35.8578,
            "src":"https://s3.amazonaws.com/grassrootsmapping/warpables/320983/test.png"}
        ];

// now we submit the request to the v2 export endpoint:
$.post("http://34.74.118.242/api/v2/export/", {
  scale: 30,
  upload: true,
  collection: json
}).done(function(response) {
  console.log('response');
});
```

### Scale

Scale is expressed in `centimeters per pixel`

### URL

The URL should return JSON in this format: http://mapknitter.org/maps/ceres--2/warpables.json

### Demo

Try it out here!

http://34.74.118.242/api/v2/export/?url=http://mapknitter.org/maps/ceres--2/warpables.json&scale=30

Alternatively the json files can also sent as body of a post request on the same path.

Compare the above example request to an equivalent one completed via the Ruby/GDAL/ImageMagick-based `mapknitter-exporter`: 

http://export.mapknitter.org/export?url=https://mapknitter.org/maps/ceres--2/warpables.json&scale=30

(see https://github.com/publiclab/mapknitter-exporter/)

And compare the outputs:

Ruby: 3816x2231 - https://mapknitter-exports-warps.storage.googleapis.com/1569446002/1569446002.jpg

IS: 3440x2544 - https://publiclab.org/system/images/photos/000/035/438/original/download.jpeg

## Routes
```js
// GET : /api/v2/process/?
    steps: [
        {
            input: <URL> // Url for the image to be processed
            OR
            input: <id of the a previous step>
            steps: <String> // Stringified Image sequencer string
            depends: <Array of ids this depends on>
        },
        {

        }
    ],
    upload: <Boolean> // Tells the server to upload the final image to the cloud

```
```js
// GET : /api/v2/convert/?
    url : <URL> // Url for the josn file.

```

## Response
An html page with the Image embedded in it. The upload option is not working as of now.
