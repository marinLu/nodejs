const cFun = require("../../utils/commonFunc");
const config = require("../../config")
const uuid = require("uuid")

module.exports = cFun.awaitHandlerFactory(async(req, res , next)=>{
    
    var reqBody = req.body;
    console.log(JSON.stringify(reqBody));

    if(!reqBody || !reqBody.cameraIP){
        return res.json(cFun.responseStatus(-1 , "请求中缺少cameraIP"));
    }

    if(!reqBody.doorCapture || !reqBody.doorCapture || !reqBody.captureType){
        return res.json(cFun.responseStatus(-2 , "缺少人脸图片或图片获取方式"))
    }

    if(!reqBody.channel){
        return res.json(cFun.responseStatus(-3 , "缺少人脸网关ID"))
    }

    if(!reqBody.faceData || reqBody.faceData.count == 0){
        return res.json(cFun.responseStatus(-4 , "缺少人脸数据"))
    }

    var faceImageBase64 = reqBody.faceData[0].faceCapture;  //小图base64
    var picture_url = reqBody.doorCapture;      //大图url
    var cameraIP = reqBody.cameraIP;        //摄像机IP
    
    var pictureTime = reqBody.timeStamp * 1000;
    
    var smallPicturePath = config().minioConfig.faceBucket + "/" + dateFormat.getDate(pictureTime)+"/" + uuid.v4() + ".jpg";
    var bigPicturePath = config().minioConfig.faceBucket + "/" + dateFormat.getDate(pictureTime)+"/" + uuid.v4() + ".jpg";
    
    /*
    picture_url需要切割
    var responseData_big = await sendRequest.requestAPI("GET" , dahuaConfig().host , dahuaConfig().getPicture.port , picture_path , null , null , {encoding : null});
    
    if(responseData_small == -1 || responseData_big == -1){
        return res.json(cFun.responseStatus(-3 , "请求大华接口，获取图片失败"));
    }
    */

    /*将图片上传到minio中
    sendToMinio.put("blueplus" , smallPicturePath , responseData_small);
    sendToMinio.put("blueplus" , bigPicturePath , responseData_big);
    */

    var hostPath = cameraIP.split(":");
    console.log("select * from f_gateway where host = '"+hostPath[0]+"' and port = '"+hostPath[1]+"'");
    var faces = await e_faceDal.query("select * from f_gateway where host = '"+hostPath[0]+"' and port = '"+hostPath[1]+"'");
    console.log(faces);
    if(faces == null || faces.length == 0){
        return res.json(cFun.responseStatus(-4 , "该camera_id没有查出对应的人脸摄像头，camera_id:"+camera_id));
    }

    var faceLog = await e_face_logDal.getByFaceID(faces[0].faceID);
    
    var faceLogEntity = new e_face_logEntity();
    faceLogEntity.faceLogID = cFun.guid();
    faceLogEntity.faceID = faces[0].faceID;
    faceLogEntity.credentialNo =  reqBody.similar_faces ? reqBody.similar_faces[0].person_id : 0;
    faceLogEntity.credentialType =  reqBody.similar_faces ? (reqBody.similar_faces[0].person_id ? 1 : 0) : 0;
    faceLogEntity.snapUUid = reqBody.similar_faces ?  reqBody.similar_faces[0].face_image_id : null;
    faceLogEntity.faceSimilarity = reqBody.similar_faces ?  (reqBody.similar_faces[0].similarity ? parseInt(reqBody.similar_faces[0].similarity) : null) : null;
    faceLogEntity.faceCaptureTime = new Date(pictureTime);
    faceLogEntity.glass = reqBody.rec_glasses;
    faceLogEntity.sex = reqBody.rec_gender;
    faceLogEntity.faceUrl = "http://"+config().minioConfig.host + ":" + config().minioConfig.port +"/blueplus/"+smallPicturePath;
    faceLogEntity.bkgUrl =  "http://"+config().minioConfig.host + ":" + config().minioConfig.port +"/blueplus/"+bigPicturePath;
    
    if(!faceLog || faceLog.length == 0){
        e_face_logDal.insert(faceLogEntity);

    }else{
        e_face_logDal.update(faceLogEntity);
    }

    return res.json(cFun.responseStatus(0 , "success"))
})