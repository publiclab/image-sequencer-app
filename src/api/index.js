const router = require('express').Router(),
    api_v1 = require('./v1'),
    api_v2 = require('./v2');


router.use('/v1', api_v1);
router.use('/v2', api_v2);


module.exports = router;