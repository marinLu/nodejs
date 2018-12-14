const cFun = require('../utils/commonFunc');

var isCamera = function (type) {
    if (type == null || type == '' || typeof (type) != 'string') {
        return false;
    }

    if (type == 'camera' || type.indexOf('camera_') != -1) {
        return true;
    }
}

var isAccess = function (type) {
    if (type == null || type == '' || typeof (type) != 'string') {
        return false;
    }

    if (type == 'access' || type.indexOf('accesss_') != -1) {
        return true;
    }
}

var getCameraDeviceType = function (type) {
    type = cFun.removeSpace(type);
    switch (type) {
        case '0':
            return 'camera';
        case '2':
            return 'camera_face';
        case '4':
            return 'camera_car';
        case '8':
            return 'camera_accessFace';

        default:
            return 'camera';
    }
}

var getCameraDeviceTypeName = function (type) {
    type = cFun.removeSpace(type);
    switch (type) {
        case '0':
            return '摄像机';
        case '2':
            return '微卡摄像机';
        case '4':
            return '卡口摄像机';
        case '8':
            return '人脸摄像机';

        default:
            return '摄像机';
    }
}

/**
 * 
 * 开门小视频 组合方式：
 *  ip:8004/Video/GetM3u8Url?CameraNo={Media_Monitor:Id}&StartTime={P_OpenedLogs:OpenedTime} -15 &EndTime={P_OpenedLogs:OpenedTime} +15
 * 
 */
var buildSmallVideoUrl = function (baseUrl, mediaMonitorId, openTime) {

    if (cFun.isNullOrEmpty(baseUrl) || cFun.isNullOrEmpty(mediaMonitorId)) {
        return '';
    }

    return baseUrl + '?' + 'CameraNo=' + mediaMonitorId + '&' +
        'StartTime=' + (openTime - 15) + '&' + 'EndTime=' + (openTime + 15);
}

var devicesOrder = function (devices, orders) {
    var deviceOrders = [];
    for (let i = 0; i < orders.length; i++) {
        let order = orders[i];
        deviceOrders = deviceOrders.concat(devices.filter(x => cFun.removeSpace(x.type) == cFun.removeSpace(order)))
    }

    var otherDevices = devices.filter(x => deviceOrders.filter(y => y.deviceID == x.deviceID).length == 0);

    return deviceOrders.concat(otherDevices);
}

module.exports = {
    isCamera,
    getCameraDeviceType,
    buildSmallVideoUrl,
    getCameraDeviceTypeName,
    devicesOrder,
    isAccess
}