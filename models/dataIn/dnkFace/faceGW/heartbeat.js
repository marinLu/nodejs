const cFun = require("../../../utils/commonFunc");

var heartbeat = cFun.awaitHandlerFactory(async (req, res, next) => {
    

    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.heartbeat = heartbeat;