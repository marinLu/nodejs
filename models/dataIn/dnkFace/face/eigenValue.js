const cFun = require("../../../utils/commonFunc");
const faceGWDal = require("../../../dals/f_face_gatewayDal");
const peopleDal = require("../../../dals/p_peopleDal");
const middleServerDal = require("../../../dals/f_middle_serverDal");
// const faceDownLogDal = require("../../../dals/f_face_downLog")
const sendRequest = require("../../../utils/sendRequest");
const childProcess = require("child_process");
const fs = require("fs");

/**
 * 接口接收参数：
 *  req.Body = {
 *      peopleID,headPicName,buildingIDAndDownLog:[{buildingID,DownLogID}]
 *  }
 */
var addOrModify = cFun.awaitHandlerFactory(async (req, res, next) => {

    var reqBody = req.body;

    var peopleID = reqBody.peopleID;        //被操作的faceID
    var headPicName = reqBody.headPicName;  //下发的人脸图片
    var buildingIDAndDownLog = reqBody.buildingIDAndDownLog;    //指定的楼栋号

    //找到对应的people记录
    var people = await peopleDal.getByPeopleID(peopleID);
    if (!people) {
        return res.json(cFun.responseStatus(-1, "未找到对应的人员信息"))
    }
    var peopleID = people.peopleID;    //被操作的peopleID

    //存储base64到图片文件路径
    var srcPicPath = __dirname + "/../faceEntityGenerate/picSource/" + peopleID + ".jpg";
    fs.writeFileSync(srcPicPath, headPicName, { flag: "w" });

    var toolPath = __dirname + "/../faceEntityGenerate/generateTool"  //生成特征值的工具目录
    var desPicPath = __dirname + "/../faceEntityGenerate/destFile/" + peopleID + ".jpg";      //存储生成头像的图片资源路径
    var desFeaPath = __dirname + "/../faceEntityGenerate/destFile/" + peopleID + ".fea";    //存储生成fea特征值资源路径

    //进入到生成特征值目录
    childProcess.exec(`cd ${toolPath}`, function (err, stdout, stderr) {
        if (err) {
            console.log("进入到提取特征值目录失败");
            return res.json(cFun.responseStatus(-1, "提取特征值失败"));
        }

        //执行shell文件生成特征值和头像
        childProcess.execFile("./face.sh", ["./data", srcPath, desPicPath, desFeaPath], async function (err, stdout, stderr) {
            if (err) {
                console.log("提取特征值失败")
                return res.json(cFun.responseStatus(-1, "提取特征值失败"));
            }
            // console.log("执行face.sh完毕，获取到特征值");

            res.json(cFun.responseStatus(0, "success"));

            var fileData = fs.readFileSync(desFeaPath, "binary");

            sendAddPicBody.faceContent = fileData;

            for (const itme of buildingIDAndDownLog) {
                //通过楼栋ID找到人脸网关ID
                var faceGW = await faceGWDal.getByBuildingID(itme.buildingID);
                if (!faceGW) {
                    continue
                }

                var sendAddPicBody = {
                    faceID: people.faceID,
                    faceContent: fileData,
                    credentialType: people.credentialType || 0,
                    credentialNo: people.credentialNo || "",
                    channels: [{ ip: faceGW.ip, port: faceGW.port }]
                }

                //找到人脸网关对应的物联网关
                var middleServer = await middleServerDal.getByID(faceGW.middleServerID);
                if (!middleServer) {
                    return res.json(-6, "未找到物联网关");
                }

                var returenResponse = await sendRequest.requestAPI("POST", middleServer.ip, middleServer.port, "/face/pic/add", sendAddPicBody);
                // var faceDownLog = await faceDownLogDal.getByDownLogID(item.downLogID);

                if (returenResponse == -1 || (returenResponse.responseStatus && returenResponse.responseStatus.resultCode != 200)) {  //人脸特征值添加时失败
                    
                    // faceDownLog.status = 2;
                    // faceDownLogDal.insert(faceDownLog);

                } else if (returenResponse.responseStatus.resultCode == 200) {     //人脸特征值添加、更改成功

                    // faceDownLog.status = 1;
                    // faceDownLogDal.insert(faceDownLog);

                } else if(!returenResponse){        //可能基于网络状况，下发失败。或者长时间未响应的padding状态
                    // faceDownLog.status = 0;
                    // faceDownLogDal.insert(faceDownLog);
                }
            }
            childProcess.exec("rm ../desFile/*", function (err, stdout, stderr) {
                if (err) {
                    console.log("删除生成的人脸图片、特征值失败");
                }
            })

            childProcess.exec("rm ../picSource/*", function (err, stdout, stderr) {
                if (err) {
                    console.log("删除源人脸图片失败");
                }
            })
        });
    })

});
module.exports.addOrModify = addOrModify;