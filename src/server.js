const app = require('./index.js'),
    port = process.env.port || 4000;
require('events').EventEmitter.prototype.setMaxListeners(100);
app.listen(port, () => console.log(`Server started on port ${port}`));