var express = require('express');
var router = express.Router();
module.exports = router;


const webConfig = require('./webConfig')
router.post("/getWebGlobalConfig", webConfig.getWebGlobalConfig);


const worker = require('./worker');
router.post("/getMarquee", worker.getMarquee);
router.post("/getDutyWorkers", worker.getDutyWorkers);