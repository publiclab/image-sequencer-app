# Mapknitter-Exporter-js
A simple app based on the Image sequencer project to run mapknitter exports in the cloud.

npm: [https://npmjs.com/package/image-sequencer](https://npmjs.com/image-sequencer)

github: [Image Sequencer](https://github.com/publiclab/image-sequencer)

[![Build Status](https://travis-ci.org/publiclab/image-sequencer-app.svg?branch=main)](https://travis-ci.org/publiclab/image-sequencer-app)

## Usage

v1: (Linear Processing)(slow, deprecated)

`/api/v1/export/?url=wrapables.json`

v2: (Concurrent Processing)(fast)

`/api/v2/export/?url=wrapables.json&scale=integer`

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
