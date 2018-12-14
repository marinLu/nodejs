const cFun = require("../../utils/commonFunc");
const villageDal = require("../../dals/b_villageDal");
const faceTopicDal = require("../../dals/f_face_topic");

var getVillageTopic = cFun.awaitHandlerFactory(async (req, res, next) => {

    var reqBody = req.body;
    if(!reqBody || !reqBody.loginName){
        return res.json(cFun.responseStatus(-1 , "缺少loginName"));
    }

    
    var faceTopics = await faceTopicDal.getByloginName(reqBody.loginName);
    if(!faceTopics || faceTopics.length == 0 || !faceTopics[0].topicName || faceTopics[0].topicName == "") {
        return res.json(cFun.responseStatus(-1 , "缺少faceTopics"));
    }
    


    return res.json(cFun.responseStatus(0 , "success" , {faceTopics}))
});
module.exports.getVillageTopic = getVillageTopic;
