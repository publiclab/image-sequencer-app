# This is the Image Sequencer API based on express.js

## Request Structure:
```js
// POST : /api/v1/process
{
    url: <URL> // Url for the image to be processed
    sequence: <String> // Stringified Image sequencer string
    upload: <Boolean> // Tells the server to upload the final image
}
```

## Response Structure
```js
{
    data: <URI> // the dataURI of the final output
}

```
