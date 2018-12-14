const rq = require("request-promise");
const qs = require("qs");
const util = require("util");

async function requestAPI(requestType , hostname , port , path , body , headers , extraOptions){
    var options = {};
    switch (requestType) {
        case "POST":
            options["method"] = "POST";
            options["url"] = 'http://'+hostname+":"+port+path;
            options["body"] = body;
            options["json"] = true;

            break;
    
        case "GET":
        
            var params = qs.stringify(body);
           
            options["method"] = "GET";
            options["url"] =params? 'http://'+hostname+":"+port+path+"?"+params : 'http://'+hostname+":"+port+path;
            // options["json"] = true;
            // options["encoding"] = null;

            break;

        case "PUT":
            options["method"] = "PUT";
            options["url"] = 'http://'+hostname+":"+port+path;
            options["body"] = body;
            options["json"] = true;

            break;

        case "DELETE":
        
            options["method"] = "DELETE";
            options["url"] = 'http://'+hostname+":"+port+path;
            options["body"] = body;
            options["json"] = true;

            break;

        default:
            break;
    }

    if(headers){
        options["headers"] = headers;
    }

    if(extraOptions){
        for (const key in extraOptions) {
            options[key] = extraOptions[key];
        }
    }

    // console.log("options:"+util.inspect(options));
    return rq(options)
    .then(function (response) {
        // console.log("请求返回信息："+response);
        console.log("请求成功，获取到返回");
        return response;
    })
    .catch(function (err) {
        // Delete failed...
        console.log(requestType+"请求失败，失败信息："+err);
        return -1;
    });

}

module.exports.requestAPI=requestAPI;