const cFun = require('../utils/commonFunc');
const crypto = require('crypto-js');

module.exports = function verifySign(req, res, next) {
    if (req.body == null || req.body.head == null || cFun.isNullOrEmpty(req.body.head.sign)) {
        return res.json(cFun.responseStatus(-1, '签名无效'));
    }

    var sign = req.body.head.sign;
    delete req.body.head.sign;

    console.log(crypto.MD5(JSON.stringify(req.body) + getKey(req.body.head.platform)).toString());

    if (sign != crypto.MD5(JSON.stringify(req.body) + getKey(req.body.head.platform)).toString()) {
        return res.json(cFun.responseStatus(-1, '签名无效'));
    }

    next();
}

var getKey = function (platform) {
    if (cFun.isNullOrEmpty(platform)) {
        return 'dIvRmSlmDEgWI*NP';
    }

    if (platform == 'zhsq-tianlin') {
        return 'O!xwu%Y$zmuiLrs7';
    }

    return 'FbIOoB3nSnpRyq*F';
}

var objKeySort= function (obj) {//排序的函数
    var newkey = Object.keys(obj).sort();
　　//先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
    var newObj = {};//创建一个新的对象，用于存放排好序的键值对
    for (var i = 0; i < newkey.length; i++) {//遍历newkey数组
        newObj[newkey[i]] = obj[newkey[i]];//向新创建的对象中按照排好的顺序依次增加键值对
    }
    return newObj;//返回排好序的新对象
}