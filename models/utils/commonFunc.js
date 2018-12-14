/**
 * 类的克隆
 * @param {*} obj 
 */
module.exports.clone = function clone(obj) {
    if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
        return obj;

    if (obj instanceof Date)
        var temp = new obj.constructor(); //or new Date(obj);
    else
        var temp = obj.constructor();

    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj['isActiveClone'] = null;
            temp[key] = clone(obj[key]);
            delete obj['isActiveClone'];
        }
    }

    return temp;
}

/**
 * 生成guid 小写
 */
module.exports.guid = function guid() {
    const uuidv1 = require('uuid/v1');

    return uuidv1().replace(/-/g, "");
}

/**
 * 获取Unix 事件戳
 * @param {*} date 
 */
module.exports.timestamp = function (date) {
    if (date == null) {
        return Date.parse(new Date()) / 1000;
    }

    if (typeof date == "string") {
        return Date.parse(new Date(Date.parse(date.replace(/-/g, "/")))) / 1000;
    }

    return Date.parse(date) / 1000;
}

/**
 * 组装返回responseStatus
 * @param {*} code 
 * @param {*} message 
 */
var responseStatus = function (code, message, resBody) {

    if (code == null) {
        code = 0;
    }

    if (message == null) {
        message = "";
    }

    var res = {
        responseStatus: {
            resultCode: code,
            resultMessage: message
        }
    }

    if (resBody == null) {
        return res;
    }

    return mergeJson(res, resBody);

}
module.exports.responseStatus = responseStatus;

/**
 * 验证request 请求是否为空
 * @param {*} head 
 */
var headEmpty = function (head) {
    if (head == null ||
        head.token == null || head.token == "" ||
        head.timestamp == null || head.timestamp.toString() == "" ||
        head.platform == null || head.platform == "") {
        return true;
    }
    return false;
}
module.exports.headEmpty = headEmpty;

/**
 * 合并两个json
 * @param {json} json1 
 * @param {json} json2 
 */
var mergeJson = function (json1, json2, json3, json4, json5, json6) {

    var resultJson = {};
    for (const attr in json1) {
        resultJson[attr] = json1[attr];
    }
    if (json2 != null) {
        for (const attr in json2) {
            resultJson[attr] = json2[attr];
        }
    }
    if (json3 != null) {
        for (const attr in json3) {
            resultJson[attr] = json3[attr];
        }
    }
    if (json4 != null) {
        for (const attr in json4) {
            resultJson[attr] = json4[attr];
        }
    }
    if (json5 != null) {
        for (const attr in json5) {
            resultJson[attr] = json5[attr];
        }
    }
    if (json6 != null) {
        for (const attr in json6) {
            resultJson[attr] = json6[attr];
        }
    }

    return resultJson;
}
module.exports.mergeJson = mergeJson;

/**
 * 获取访问者的ip
 * @param {Request} req 
 */
var getClientIp = function (req) {
    // return req.headers['x-forwarded-for'] ||
    //     req.connection.remoteAddress ||
    //     req.socket.remoteAddress ||
    //     req.connection.socket.remoteAddress;

    return req.ip;
}
module.exports.getClientIp = getClientIp;

/**
 * 
 * @param {*} req 
 */
var checkIp = function (ruleIp, ip) {

    return true;
}
module.exports.checkIp = checkIp;

/**
 * 时间格式转换
 * @param {*} time 
 * @param {String} format 
 */
var formatDateTime = function (time, format) {

    if (time == null) {
        var t = new Date();
    } else {
        var t = new Date(time);
    }

    var tf = function (i) {
        return (i < 10 ? '0' : '') + i
    };

    if (format == null || format == "") {
        format = "yyyy-MM-dd HH:mm:ss";
    }

    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
        switch (a) {
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    })
};
module.exports.formatDateTime = formatDateTime;

const awaitHandlerFactory = middleware => {
    return async (req, res, next) => {
        try {
            await middleware(req, res, next);
        } catch (err) {
            next(err);
            return res.json(responseStatus(-1, err.stack));
        }
    };
};
module.exports.awaitHandlerFactory = awaitHandlerFactory;

var isProvinceCode = function (code) {
    if (code != null && code != '' && code.length == 3) {
        return true;
    }
    return false;
}

var isDistrictCode = function (code) {
    if (code != null && code != '' && code.length == 6) {
        return true;
    }
    return false;
}

var isStreetCode = function (code) {
    if (code != null && code != '' && code.length == 9) {
        return true;
    }
    return false;
}
module.exports.isStreetCode = isStreetCode;

var isCommitteeCode = function (code) {
    if (code != null && code != '' && code.length == 12) {
        return true;
    }
    return false;
}
module.exports.isCommitteeCode = isCommitteeCode;

var isVillageCode = function (code) {
    if (code != null && code != '' && code.length > 12) {
        return true;
    }
    return false;
}
module.exports.isVillageCode = isVillageCode;

/**
 * json try parse
 * @param {*} str 
 */
var jsonTryParse = function (str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}
module.exports.jsonTryParse = jsonTryParse;

/**
 * 获取人年龄
 * @param {*} age 
 */
var getAge = function (birthday) {
    try {
        return parseInt((new Date() - new Date(birthday)) / (1000 * 60 * 60 * 24 * 365));

    } catch (error) {
        return 0;
    }
}
module.exports.getAge = getAge;

/**
 * 进出类型转中文
 * @param {*} type 
 */
var inoutTypeChinese = function (type) {
    switch (type) {
        case 0:
            return '进';
        case 1:
            return '出';
        case 2:
            return '可进可出';
        default:
            return '进'
    }
};
module.exports.inoutTypeChinese = inoutTypeChinese;

/**
 * 时间+秒
 * @param {*} dt 
 * @param {*} addSecond 
 */
var addSeconds = function (dt, addSecond) {
    var newDt = new Date(dt);

    newDt.setSeconds(newDt.getSeconds() + addSecond);
    return newDt;
}
module.exports.addSeconds = addSeconds;

/**
 * 第一个或默认空
 * @param {*} arrs 
 */
var firstOrDefault = function (arrs) {

    try {
        if (arrs == null || arrs.length == 0) {
            return null;
        }

        return arrs[0];
    } catch (error) {
        return null;
    }

    return null;
}
module.exports.firstOrDefault = firstOrDefault;

/**
 * 去除字符串空格
 * @param {*} str 
 */
var removeSpace = function (str) {
    if (str == null) {
        return str;
    }

    return str.replace(/\s+/g, "");
}
module.exports.removeSpace = removeSpace;

/**
 * 数组是否存在
 * @param {*} arrs 
 * @param {*} ob 
 */
var exist = function (arrs, ob) {
    if (arrs == null || arrs.length == 0) {
        return false;
    }

    if (arrs.filter(x => x == ob).length > 0) {
        return true;
    }

    return false;
}
module.exports.exist = exist;

/**
 * 数组去重合并
 * @param {*} arr1 
 * @param {*} arr2 
 */
var union = function (arr1, arr2) {
    //不要直接使用var arr = arr1，这样arr只是arr1的一个引用，两者的修改会互相影响  
    var arr = arr1.concat();
    //或者使用slice()复制，var arr = arr1.slice(0)  
    for (var i = 0; i < arr2.length; i++) {
        arr.indexOf(arr2[i]) === -1 ? arr.push(arr2[i]) : 0;
    }
    return arr;
}
module.exports.union = union;

var getTypeName = function (dictionaryTypes, type) {
    if (dictionaryTypes == null || dictionaryTypes.length == 0) {
        return '';
    }

    var dics = dictionaryTypes.filter(x => removeSpace(x.name) == removeSpace(type));
    if (dics == null || dics.length == 0) {
        return '';
    }

    return dics[0].typeName;
}
module.exports.getTypeName = getTypeName;

/**
 * 
 * @param {*} str 
 */
var isNullOrEmpty = function (str) {
    if (str == null || str == '') {
        return true;
    }

    if (typeof str == 'string' && str.constructor == String) {
        if (removeSpace(str) == '') {
            return true;
        }
    }

    return false;
}
module.exports.isNullOrEmpty = isNullOrEmpty;

/**
 * 数组转小写
 * @param {*} strs 
 */
var toLowers = function (strs) {
    for (let i = 0; i < strs.length; i++) {
        if (!isNullOrEmpty(strs[i])) {
            if (typeof strs[i] != 'string') {
                strs[i] = strs[i].toString().toLowerCase();
            } else {
                strs[i] = strs[i].toLowerCase();
            }
        }
    }

    return strs;
}
module.exports.toLowers = toLowers;


/**
 * 掩码身份证号码
 * @param {*} credentialNo 
 * @param {*} isReveal 是否展示
 */
var maskCredentialNo = function (credentialNo, isReveal) {
    if (isReveal) {
        return credentialNo;
    }

    if (isNullOrEmpty(credentialNo)) {
        return credentialNo;
    }

    if (credentialNo.length != 18) {
        return credentialNo;
    }

    return credentialNo.substr(0, 3) + '***********' + credentialNo.substr(14, 4);
}
module.exports.maskCredentialNo = maskCredentialNo;

/**
 * 掩码手机号吗
 * @param {*} phoneNo 
 * @param {*} isReveal 是否展示
 */
var maskPhoneNo = function (phoneNo, isReveal) {
    if (isReveal) {
        return phoneNo;
    }

    if (isNullOrEmpty(phoneNo)) {
        return phoneNo;
    }

    if (phoneNo.length != 11) {
        return phoneNo;
    }

    return phoneNo.substr(0, 3) + '****' + phoneNo.substr(7, 4);
}
module.exports.maskPhoneNo = maskPhoneNo;

/**
 * 人员姓名掩码
 * @param {*} peopleName 
 * @param {*} isReveal 是否展示
 */
var maskPeopleName = function (peopleName, isReveal) {
    if (isReveal) {
        return peopleName;
    }

    if (isNullOrEmpty(peopleName)) {
        return peopleName;
    }


    return peopleName.substr(0, 1) + '*' + peopleName.substr(2, peopleName.length - 2);
}
module.exports.maskPeopleName = maskPeopleName;

var timestampToDate = function (timestamp) {
    var newDate = new Date();
    newDate.setTime(Number(timestamp) * 1000);
    return newDate;
}
module.exports.timestampToDate = timestampToDate;


var timeDifference = function (startTime, endTime, diffType) {
    //将xxxx-xx-xx的时间格式，转换为 xxxx的格式 
    startTime = startTime.replace(/\-/g, "/");
    endTime = endTime.replace(/\-/g, "/");
    //将计算间隔类性字符转换为小写
    diffType = diffType.toLowerCase();
    var sTime = new Date(startTime); //开始时间
    var eTime = new Date(endTime); //结束时间
    //作为除数的数字
    var divNum = 1;
    switch (diffType) {
        case "misecond":
            divNum = 1;
            break;
        case "second":
            divNum = 1000;
            break;
        case "minute":
            divNum = 1000 * 60;
            break;
        case "hour":
            divNum = 1000 * 3600;
            break;
        case "day":
            divNum = 1000 * 3600 * 24;
            break;
        default:
            break;
    }
    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
}


module.exports.timeDifference = timeDifference;

/**
 * 获取字符串中的中文
 * @param {*} strValue 
 */
function getChinese(strValue) {
    if (strValue != null && strValue != "") {
        var reg = /[\u4e00-\u9fa5]/g;
        return strValue.match(reg);
    } else
        return "";
}
module.exports.getChinese = getChinese;

/**
 * 去除字符串中的中文
 * @param {*} strValue 
 */
function removeChinese(strValue) {
    if (strValue != null && strValue != "") {
        var reg = /[\u4e00-\u9fa5]/g;
        return strValue.replace(reg, "");
    } else
        return "";
}
module.exports.removeChinese = removeChinese;