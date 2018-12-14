const crypto = require("crypto-js");
const dahuaConfig = require("../../../config/dahuaConfig");
const config = require("../../config");
const sendRequest = require("../../utils/sendRequest");
const cFun = require("../../utils/commonFunc");
const sendToMinio = require("../../utils/sendToMinio");
const dateFormat = require("../../utils/dateFormat");
const e_faceDal = require("../../dals/e_faceDal");
const e_face_logDal = require("../../dals/e_face_logDal");
const e_deviceLog = require("../../dals/e_deviceDal");
const s_resource = require("../../dals/s_resourceDal");
const e_face_logEntity = require("../../entitys/e_face_logEntity");
const uuid = require("uuid");
const sendMQ = require("../../utils/sendMQ");


var dahuaCallback = cFun.awaitHandlerFactory(async (req,res,next)=>{
    var reqBody =JSON.parse(Object.keys(req.body)[0]);
    console.log(reqBody);
    if(!reqBody || reqBody.camera_id == null || reqBody.camera_id == ""){
        return res.json(cFun.responseStatus(-1 , "请求中缺少camera_id"));
    }

    if(!reqBody.face_image_uri || !reqBody.picture_uri || !reqBody.picture_url){
        return res.json(cFun.responseStatus(-2 , "缺少人脸图片"))
    }

    var face_image_uri = reqBody.face_image_uri;
    var picture_uri = reqBody.picture_uri;
    var camera_id = reqBody.camera_id;

    //将uri进行base64编码，用于请求大华接口
    var enc_face_image = new Buffer(face_image_uri).toString("base64");
    var enc_picture_uri = new Buffer(picture_uri).toString("base64");
    
    var face_image_path = dahuaConfig().getPicture.url + enc_face_image;
    var picture_path = dahuaConfig().getPicture.url + enc_picture_uri;
    
    var pictureTime = reqBody.timestamp * 1000;
    
    var smallPicturePath = config().minioConfig.faceBucket + "/" + dateFormat.getDate(pictureTime)+"/" + uuid.v4() + ".jpg";
    var bigPicturePath = config().minioConfig.faceBucket + "/" + dateFormat.getDate(pictureTime)+"/" + uuid.v4() + ".jpg";
    
    //请求大华接口，并获取图片信息
    var responseData_small = await sendRequest.requestAPI("GET" , dahuaConfig().host , dahuaConfig().getPicture.port , face_image_path  ,null, null , {encoding : null});
    var responseData_big = await sendRequest.requestAPI("GET" , dahuaConfig().host , dahuaConfig().getPicture.port , picture_path , null , null , {encoding : null});
    
    if(responseData_small == -1 || responseData_big == -1){
        return res.json(cFun.responseStatus(-3 , "请求大华接口，获取图片失败"));
    }

    //将图片上传到minio中
    sendToMinio.put("blueplus" , smallPicturePath , responseData_small);
    sendToMinio.put("blueplus" , bigPicturePath , responseData_big);

    var faces = await e_faceDal.query("select * from e_face where thirdCameraID = '"+camera_id+"'");
    if(faces == null || faces.length == 0){
        return res.json(cFun.responseStatus(-4 , "该camera_id没有查出对应的人脸摄像头，camera_id:"+camera_id));
    }

    var cameras = await e_deviceLog.query("select * from e_device where deviceID = '"+faces[0].deviceID+"'");
    if(!cameras || cameras.length == 0){
        return res.json(cFun.responseStatus(-5 , "e_device中没找到camera记录信息"))
    }

    var resources = await s_resource.query("select * from s_resource where businessType = 'peoplePic' and businessID = '"+cameras[0].villageID+"'");
    
    var faceLogEntity = new e_face_logEntity();
    faceLogEntity.faceLogID = cFun.guid();
    faceLogEntity.faceID = faces[0].faceID;
    faceLogEntity.credentialNo =  reqBody.similar_faces ? reqBody.similar_faces[0].person_id : "";
    faceLogEntity.credentialType =  reqBody.similar_faces ? (reqBody.similar_faces[0].person_id ? 1 : 0) : 0;
    faceLogEntity.snapUUid = reqBody.similar_faces ?  reqBody.similar_faces[0].face_image_id : null;
    faceLogEntity.faceSimilarity = reqBody.similar_faces ?  (reqBody.similar_faces[0].similarity ? parseInt(reqBody.similar_faces[0].similarity) : null) : null;
    faceLogEntity.faceCaptureTime = new Date(pictureTime);
    faceLogEntity.glass = reqBody.rec_glasses;
    faceLogEntity.sex = reqBody.rec_gender;
    faceLogEntity.faceUrl = (!resources || resources.length == 0) ? 
        "http://"+config().minioConfig.host + ":" + config().minioConfig.port +"/blueplus/"+smallPicturePath
        : resources[0].filePath + smallPicturePath;
    faceLogEntity.bkgUrl =  (!resources || resources.length == 0) ? 
        "http://"+config().minioConfig.host + ":" + config().minioConfig.port +"/blueplus/"+bigPicturePath
        : resources[0].filePath + bigPicturePath;
    
    e_face_logDal.insert(faceLogEntity);


    var resultsa = await e_face_logDal.query("select * from e_face_log where snapUUid = '"+faceLogEntity.snapUUid+"' order by insertTime asc");
    var lastCameraName;
    if(resultsa.length > 0){
        var lastCamera = await e_faceDal.query("select * from e_face where faceID = '"+resultsa[0].faceID+"'");
        if(lastCamera.length > 0){
            lastCameraName = lastCamera[0].channelNo;
        }
    }

    var data = {
        backgroundPic: faceLogEntity.bkgUrl,//大图片
        faceUrl: faceLogEntity.faceUrl,//小图片
        passTime: dateFormat.changeDateFullFormat(pictureTime),//时间 yyyy-MM-dd HH:mm:ss
        deviceId: faces[0].deviceID,
        similarity:faceLogEntity.faceSimilarity,
        Stranger: faceLogEntity.credentialType, //0 非 1 是
        villageID: cameras[0].villageID,
        coordinate:"84",
        
        Location:  cameras[0].name,
        
        Longitude: cameras[0].longitude,//baidu
        Latitude: cameras[0].latitude,
        
        lastLocation: lastCameraName,
        lastBackgroundPic: resultsa[0] ? resultsa[0].bkgUrl : undefined,//大图片
        lastFaceUrl: resultsa[0] ? resultsa[0].faceUrl : undefined,//小图片
        lastPassTime: resultsa[0] ? dateFormat.changeDateFullFormat(resultsa[0].faceCaptureTime) : undefined,//时间 yyyy-MM-dd HH:mm:ss
        
    };

    sendMQ('/web/event/map/faceLog' , data);

    return res.json(cFun.responseStatus(0 , "success"))
})
module.exports.dahuaCallback = dahuaCallback;

