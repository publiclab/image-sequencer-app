# Mapknitter-Exporter-js
A simple app based on the Image sequencer project to run mapknitter exports in the cloud.

npm: [https://npmjs.com/package/image-sequencer](https://npmjs.com/image-sequencer)

github: [Image Sequencer](https://github.com/publiclab/image-sequencer)

[![Build Status](https://travis-ci.org/publiclab/image-sequencer-app.svg?branch=main)](https://travis-ci.org/publiclab/image-sequencer-app)

## Usage
v1: (Linear Processing)(slow)

`/api/v1/export/?url=wrapables.json`

v2: (Concurrent Processing)(fast)

`/api/v2/export/?url=wrapables.json&scale=integer`
Test URL: http://34.74.118.242/api/v2/export/?url=http://mapknitter.org/maps/ceres--2/warpables.json&scale=3

Alternatively the json files can also sent as body of a post request on the same path.

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
