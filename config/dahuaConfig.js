module.exports = function () {
    if (process.env.NODE_ENV == 'product') {
        return productConfig;
    } else {
        return devConfig;
    }
}

//开发配置
var devConfig = {
    host : "10.18.0.110",
    login : {
        port : 11180,
        url : "/face/v1/framework/user/login"
    },
    notify : {
        port : 9900,
        url : "/face/v1/framework/face_video/subscription"
    },
    getPicture : {
        port : 7300,
        url : "/storage/v1/image?uri_base64="
    }
}

//生产配置
var productConfig = {
    host : "10.18.0.110",
    login : {
        port : 11180,
        url : "/face/v1/framework/user/login"
    },
    notify : {
        port : 9900,
        url : "/face/v1/framework/face_video/subscription"
    },
    getPicture : {
        port : 7300,
        url : "/storage/v1/image?uri_base64="
    }
}