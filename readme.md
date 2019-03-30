[![Build Status](https://travis-ci.org/publiclab/image-sequencer-app.svg?branch=main)](https://travis-ci.org/publiclab/image-sequencer-app)

# This is the Image Sequencer API based on express.js

## Request Structure:
```js
// POST : /api/v1/process
{
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
    upload: <Boolean> // Tells the server to upload the final image
    redirect: <Boolean> //Tells the server whether to return as json or to redirect
}
```

## Response Structure
```js
{
    data: <URI> // the dataURI of the final output
}

```
