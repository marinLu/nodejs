var express = require('express');
var router = express.Router();
module.exports = router;
const worker = require('./worker');
router.post('/getPageWorkerAll', worker.getPageWorkerAll);
router.post('/delsWorker', worker.delsWorker);
router.post('/updateAddWorker', worker.updateAddWorker);
router.post('/getRosterByWorkerID', worker.getRosterByWorkerID);