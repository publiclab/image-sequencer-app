const router = require('express').Router(),
    api_v1 = require('./v1');


router.use('/v1', api_v1);


module.exports = router;