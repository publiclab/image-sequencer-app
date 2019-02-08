const app = require('./index.js'),
    port = process.env.port || 4000;
app.listen(port, () => console.log(`Server started on port ${port}`));