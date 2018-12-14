const cFun = require("../../../utils/commonFunc");

var openVideo = cFun.awaitHandlerFactory(async (req, res, next) => {
    

    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.openVideo = openVideo;