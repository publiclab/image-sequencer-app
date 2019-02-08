const express = require('express'),
    bp = require('body-parser');

const app = express(),
    port = process.env.port || 4000,
    api = require('./api');

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));


// Mount the API router
app.use('/api', api);


app.listen(port, () => console.log(`Server started on port ${port}`));