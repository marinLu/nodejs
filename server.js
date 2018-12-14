// call the packages we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var responseTime = require('response-time');
var port = 5000;
var swStats = require('swagger-stats');
var config = require('./models/config');
global._ = require('lodash');

//设置时区（如果不设置，会导致Sequelize插入时间有问题）
process.env.TZ = 'Asia/Shanghai';

//post body json
app.use(bodyParser.json({ //limit - 设置请求的最大数据量
    limit: "10000kb"
}));
app.use(bodyParser.urlencoded({ //支持任何的数据类型
    extended: true
}));

//统计请求时间
app.use(responseTime());

//隐藏服务端信息
app.disable('x-powered-by');

app.use(swStats.getMiddleware({
    uriPath: '/api',
    onResponseFinish: function (req, res, rrr) {
        debug('onResponseFinish: %s', JSON.stringify(rrr));
    }
}));

//business model

var login = require('./models/user/index');
var authority = require('./models/authority/index');
var role = require('./models/role/index');
var device = require('./models/device/index');
var log = require('./models/log/index');
var home = require('./models/home/index');
var authorize = require('./models/user/authorize');
var department = require('./models/department/index');
var option = require('./models/option/index');
var area = require('./models/area/index');
var dataIn = require('./models/dataIn/index');
var event = require('./models/event/index');
var statistic = require('./models/statistic');
var dictionary = require('./models/dictionary/index');
var search = require('./models/search/index');
var people = require('./models/people/index');
var manage = require('./models/manage/index');
var worker = require('./models/worker/index');
var functions = require('./models/function/index');
var sensealarmmodel = require('./models/sensealarmmodel/index');
var peopleLabel = require('./models/people/index');

//app
var appIndex = require('./models/app/index');

//设置跨域访问 登录验证
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");

    next();
});

app.get('/healthCheck', function (req, res) {
    return res.send({
        timestamp: Date.now(),
    })
})

app.use('/api/user', login);
app.use('/api/authority', authorize, authority);
app.use('/api/role', authorize, role);
app.use('/api/device', authorize, device);
app.use('/api/log', authorize, log);
app.use('/api/home', authorize, home);
app.use('/api/department', authorize, department);
app.use('/api/option', authorize, option);
app.use('/api/area', authorize, area);
app.use('/api/datain', dataIn);
app.use('/api/event', authorize, event);
app.use('/api/statistic', authorize, statistic);
app.use('/api/dictionary', authorize, dictionary)
app.use('/api/search', authorize, search);
app.use('/api/people', authorize, people);
app.use('/api/manage', authorize, manage);
app.use('/api/worker', authorize, worker);
app.use('/api/function', authorize, functions)
app.use('/api/sensealarmmodel', authorize, sensealarmmodel)
app.use('/api/peopleLabel', authorize, peopleLabel)

//app
app.use('/api/app', authorize, appIndex);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



function uncaughtExceptionHandler(err) {
    if (err && err.code == 'ECONNREFUSED') {
        //do someting
    } else {
        process.exit(1);
    }
}
process.on('uncaughtException', uncaughtExceptionHandler);//异常处理

// START THE SERVER
// =============================================================================
var server = app.listen(port, () => {
    console.log(`Server started on port ` + port);
});