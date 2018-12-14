var express = require('express');
var router = express.Router();
module.exports = router;

var device = require('./device');
router.post("/getDeviceList", device.getDeviceList);
router.post("/getDeviceListByPaging", device.getDeviceListByPaging);
router.post("/getDeviceCount", device.getDeviceCount);
router.post("/getDeviceInfo", device.getDeviceInfo);
// router.post("/updateDevice", device.updateDevice);//更改摄像头状态
router.post("/addDevice", device.addDevice); // 添加设备 需要做三种插入设备插入 门禁插入 摄像机插入
router.post("/updateDeviceInfo", device.updateDeviceInfo) // 更新设备信息
router.post("/delDevice", device.delDevice) // 删除设备
router.post("/changeDeviceDisable", device.changeDeviceDisable); // 更新设备开启关闭状态
router.post("/getDeviceDetialByType", device.getDeviceDetialByType); // 通过类型获取设备详细信息
router.post("/getCameraInOut", device.getCameraInOut); // 获取camera进出设备
router.post("/deviceNameExist", device.deviceNameExist); // 判断设备名称是否已经存在

var access = require('./access');
router.post("/getAccessInfo", access.getAccessInfo);
router.post("/getAccessLogs", access.getAccessLogs);
router.post("/getAccessStatic", access.getAccessStatic);
//
router.post("/changeAccessState", access.changeAccessState); // 门禁锁开关

var deviceOps = require('./deviceOps');
router.post("/getDeviceOpsList", deviceOps.getDeviceOpsList);

var face = require('./face');
router.post("/getFaceLogs", face.getFaceLogs);
router.post("/getFaceCameras", face.getFaceCameras);
router.post("/getFaceCapturePictures", face.getFaceCapturePictures);
router.post("/getFaceStatic", face.getFaceStatic);


var car = require('./car');
router.post("/getParkingInfo", car.getParkingInfo);
router.post("/getCarLogs", car.getCarLogs);
router.post("/getCarStatic", car.getCarStatic);
router.post("/getPeopleCar", car.getPeopleCar);

router.post("/localCar/:modify",car.modifyCar);