const cFun = require('../utils/commonFunc');
const statisticDal = require('../dals/e_statisticsDal');
const statisticSql = require('../statistic/statisticSql');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');

const paths = [{
        path: '消防设备异常感知',
        timeInterval: 5 * 60
    },
    {
        path: '烟感报警感知本周统计',
        timeInterval: 60 * 60
    },
    {
        path: '烟感报警感知本月统计',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '报警次数和总消防感知本周',
        timeInterval: 60 * 60
    },
    {
        path: '报警次数和总消防感知本月',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '通行人数次数感知',
        timeInterval: 3
    },
    {
        path: '开门方式感知',
        timeInterval: 3
    },
    {
        path: '楼栋人员通行感知当日',
        timeInterval: 3
    },
    {
        path: '楼栋人员通行感知本周',
        timeInterval: 60 * 60
    },
    {
        path: '楼栋人员通行感知本月',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '抓拍次数及陌生人感知当日',
        timeInterval: 3
    },
    {
        path: '抓拍次数及陌生人感知本周',
        timeInterval: 60 * 60
    },
    {
        path: '实时进出感知',
        timeInterval: 3
    },
    {
        path: '车辆驻留',
        timeInterval: 3
    },
    {
        path: 'alarmSumRealtime', //实时预警总数
        timeInterval: 3
    },
    {
        path: 'alarmTypeRealtime', //今日实有预警感知系统
        timeInterval: 3
    },
    {
        path: 'passCarSumRealtime', //车辆实时通行数量
        timeInterval: 3
    },
    {
        path: '小区当日预警总数',
        timeInterval: 3
    },
    {
        path: '小区当日已处理报警数',
        timeInterval: 3
    },
    {
        path: '小区当日正在处理报警数',
        timeInterval: 3
    },
    {
        path: '小区当日延期超时报警数',
        timeInterval: 3
    },
    {
        path: '小区当日未处理报警数',
        timeInterval: 3
    },
    {
        path: '小区总住户',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区总人数',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区老人数量',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区儿童数量',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区关爱数量',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区重点人员数量',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区总楼数',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区总房屋数',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区车位总数',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区设备总数',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区进入人数',
        timeInterval: 3
    },
    {
        path: '小区离开人数',
        timeInterval: 3
    },
    {
        path: '小区驻留人数',
        timeInterval: 3
    },
    {
        path: '设备实时状态统计',
        timeInterval: 60
    },
    {
        path: '通行人数次数感知本周',
        timeInterval: 60 * 60
    },
    {
        path: '通行人数次数感知本月',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '通行人数次数感知当日',
        timeInterval: 3
    },
    {
        path: '开门方式感知本周',
        timeInterval: 60 * 60
    },
    {
        path: '开门方式感知本月',
        timeInterval: 12 * 60 * 60
    },
    {
        path: '小区当日驶入登记数量',
        timeInterval: 3
    },
    {
        path: '小区当日驶入外来数量',
        timeInterval: 3
    },
    {
        path: '小区当日驶出登记数量',
        timeInterval: 3
    },
    {
        path: '小区当日驶出外来数量',
        timeInterval: 3
    },
    {
        path: '小区停车场抓拍总数',
        timeInterval: 3
    },
    {
        path: '当日公共管理报警数',
        timeInterval: 3
    },
    {
        path: '当日公共服务报警数',
        timeInterval: 3
    },
    {
        path: '当日公共安全报警数',
        timeInterval: 3
    },
    {
        path: '小区当日陌生人员进出',
        timeInterval: 3
    },
    {
        path: '小区当日关注人员进出',
        timeInterval: 3
    },
    {
        path: '小区当日设备在线',
        timeInterval: 3
    },
    {
        path: '小区当日设备离线',
        timeInterval: 3
    },
    {
        path: '小区当日设备故障',
        timeInterval: 3
    },
    {
        path: '小区当日维修',
        timeInterval: 3
    },
    {
        path: '小区门禁当日开门次数',
        timeInterval: 3
    },
    {
        path: '小区门禁当日访客开门次数',
        timeInterval: 3
    },
    {
        path: '小区设备近7天报警已处置情况',
        timeInterval: 60 * 60
    }
];


var getByPaths = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    var resBody = {
        datas: []
    }

    var statistics = [];

    for (let i = 0; i < reqBody.paths.length; i++) {
        let path = reqBody.paths[i];

        for (let i = 0; i < reqBody.villageIDs.length; i++) {
            let villageID = reqBody.villageIDs[i];
            let pathNode = _.find(paths, x => x.path == path);

            //生成时间戳
            let nowTimestamp = cFun.timestamp();
            if (pathNode != null) {

                let redisCacheData = await redis.getAsync(redisKey.getByPath(path, villageID));
                if (redisCacheData == null) {
                    let data = await pathSwitch(path, villageID);

                    let cacheEntity = {
                        data: data,
                        time: nowTimestamp
                    }

                    redis.set(redisKey.getByPath(path, villageID), JSON.stringify(cacheEntity));

                    statistics.push({
                        path: path,
                        name: path,
                        data: data,
                        villageID: villageID,
                        timeInterval: pathNode.timeInterval,
                        time: nowTimestamp
                    });
                } else {
                    let cacheEntityInfo = cFun.jsonTryParse(redisCacheData);

                    if (cacheEntityInfo == null || cacheEntityInfo.time + pathNode.timeInterval <= nowTimestamp) {
                        //redis里有数据，但是已过期
                        let data = await pathSwitch(path, villageID);
                        let cacheEntity = {
                            data: data,
                            time: nowTimestamp
                        }

                        redis.set(redisKey.getByPath(path, villageID), JSON.stringify(cacheEntity));

                        statistics.push({
                            path: path,
                            name: path,
                            data: data,
                            villageID: villageID,
                            timeInterval: pathNode.timeInterval,
                            time: nowTimestamp
                        });
                    } else {
                        statistics.push({
                            path: path,
                            name: path,
                            data: cacheEntityInfo.data,
                            villageID: villageID,
                            timeInterval: pathNode.timeInterval,
                            time: cacheEntityInfo.time
                        });
                    }
                }

            } else {

                //从数据库直接获取
                let statisticInfo = await statisticDal.getByPathVillageID(path, villageID);
                if (statisticInfo != null) {
                    statisticInfo.time = statisticInfo.updateTime;
                    statistics.push(statisticInfo);
                } else {
                    statistics.push({
                        path: path,
                        name: path,
                        data: 0,
                        villageID: villageID,
                        timeInterval: 30,
                        time: nowTimestamp
                    });
                }
            }
        }
    }

    if (statistics == null || statistics.length == 0) {
        return res.json(cFun.responseStatus(0, 'success', resBody));
    }

    for (let i = 0; i < statistics.length; i++) {
        let element = statistics[i];
        resBody.datas.push({
            statisticID: element.statisticID,
            path: element.path,
            name: element.name,
            data: element.data,
            villageID: element.villageID,
            timeInterval: element.timeInterval,
            time: element.time
        })
    }

    return res.json(cFun.responseStatus(0, 'success', resBody));

})

module.exports.getByPaths = getByPaths;

var pathSwitch = async function (path, villageID) {
    if (path == '消防设备异常感知') {
        let data = await statisticSql.消防设备异常感知(villageID);
        return data;
    }

    if (path == '烟感报警感知本周统计') {
        let data = await statisticSql.烟感报警感知本周统计(villageID);
        return data;
    }

    if (path == '烟感报警感知本月统计') {
        let data = await statisticSql.烟感报警感知本月统计(villageID);
        return data;
    }

    if (path == '报警次数和总消防感知本周') {
        let data = await statisticSql.报警次数和总消防感知本周(villageID);
        return data;
    }

    if (path == '报警次数和总消防感知本月') {
        let data = await statisticSql.报警次数和总消防感知本月(villageID);
        return data;
    }

    if (path == '通行人数次数感知') {
        let data = await statisticSql.通行人数次数感知(villageID);
        return data;
    }

    if (path == '通行人数次数感知本周') {
        let data = await statisticSql.通行人数次数感知本周(villageID);
        return data;
    }

    if (path == '通行人数次数感知本月') {
        let data = await statisticSql.通行人数次数感知本月(villageID);
        return data;
    }

    if (path == '通行人数次数感知当日') {
        let data = await statisticSql.通行人数次数感知当日(villageID);
        return data;
    }

    if (path == '开门方式感知') {
        let data = await statisticSql.开门方式感知(villageID);
        return data;
    }

    if (path == '开门方式感知本周') {
        let data = await statisticSql.开门方式感知本周(villageID);
        return data;
    }


    if (path == '楼栋人员通行感知当日') {
        let data = await statisticSql.楼栋人员通行感知当日(villageID);
        return data;
    }

    if (path == '楼栋人员通行感知本周') {
        let data = await statisticSql.楼栋人员通行感知本周(villageID);
        return data;
    }

    if (path == '楼栋人员通行感知本月') {
        let data = await statisticSql.楼栋人员通行感知本月(villageID);
        return data;
    }

    if (path == '抓拍次数及陌生人感知当日') {
        let data = await statisticSql.抓拍次数及陌生人感知当日(villageID);
        return data;
    }

    if (path == '抓拍次数及陌生人感知本周') {
        let data = await statisticSql.抓拍次数及陌生人感知本周(villageID);
        return data;
    }

    if (path == '实时进出感知') {
        let data = await statisticSql.实时进出感知(villageID);
        return data;
    }

    if (path == '车辆驻留') {
        await statisticSql.车辆实时通行数量(villageID);
        let data = await statisticSql.车辆驻留(villageID);
        return data;
    }

    if (path == 'alarmSumRealtime') {
        let data = await statisticSql.实时预警总数(villageID);
        return data;
    }

    if (path == '小区当日预警总数') {
        let data = await statisticSql.小区当日预警总数(villageID);
        return data;
    }


    if (path == 'alarmTypeRealtime') {
        let data = await statisticSql.今日实有预警感知系统(villageID);
        return data;
    }

    if (path == 'passCarSumRealtime') {
        let data = await statisticSql.车辆实时通行数量(villageID);
        return data;
    }

    if (path == '小区老人数量') {
        let data = await statisticSql.小区老人数量(villageID);
        return data;
    }

    if (path == '小区儿童数量') {
        let data = await statisticSql.小区儿童数量(villageID);
        return data;
    }

    if (path == '小区关爱数量') {
        let data = await statisticSql.小区关爱数量(villageID);
        return data;
    }

    if (path == '小区重点人员数量') {
        let data = await statisticSql.小区重点人员数量(villageID);
        return data;
    }

    if (path == '小区总楼数') {
        let data = await statisticSql.小区总楼数(villageID);
        return data;
    }

    if (path == '小区总房屋数') {
        let data = await statisticSql.小区总房屋数(villageID);
        return data;
    }

    if (path == '小区总住户') {
        let data = await statisticSql.小区总住户(villageID);
        return data;
    }

    if (path == '小区总人数') {
        let data = await statisticSql.小区总人数(villageID);
        return data;
    }

    if (path == '小区车位总数') {
        let data = await statisticSql.小区车位总数(villageID);
        return data;
    }

    if (path == '小区设备总数') {
        let data = await statisticSql.小区设备总数(villageID);
        return data;
    }

    if (path == '小区进入人数') {
        let data = await statisticSql.小区进入人数(villageID);
        return data;
    }

    if (path == '小区离开人数') {
        let data = await statisticSql.小区离开人数(villageID);
        return data;
    }

    //
    if (path == '小区驻留人数') {
        // await statisticSql.小区人脸卡口通行数量(villageID);
        let data = await statisticSql.小区驻留人数(villageID);
        return data;
    }

    if (path == '设备实时状态统计') {

        let data = await statisticSql.设备实时状态统计(villageID);
        return data;
    }

    if (path == '小区当日驶入登记数量') {

        let data = await statisticSql.小区当日驶入登记数量(villageID);
        return data;
    }

    if (path == '小区当日驶入外来数量') {

        let data = await statisticSql.小区当日驶入外来数量(villageID);
        return data;
    }

    if (path == '小区当日驶出登记数量') {

        let data = await statisticSql.小区当日驶出登记数量(villageID);
        return data;
    }

    if (path == '小区当日驶出外来数量') {

        let data = await statisticSql.小区当日驶出外来数量(villageID);
        return data;
    }

    if (path == '小区停车场抓拍总数') {
        let data = await statisticSql.小区停车场抓拍总数(villageID);
        return data;
    }

    if (path == '当日公共管理报警数') {
        let data = await statisticSql.当日公共管理报警数(villageID);
        return data;
    }


    if (path == '当日公共服务报警数') {
        let data = await statisticSql.当日公共服务报警数(villageID);
        return data;
    }


    if (path == '当日公共安全报警数') {
        let data = await statisticSql.当日公共安全报警数(villageID);
        return data;
    }

    if (path == '小区当日陌生人员进出') {
        let data = await statisticSql.小区当日陌生人员进出(villageID);
        return data;
    }

    if (path == '小区当日关注人员进出') {
        let data = await statisticSql.小区当日关注人员进出(villageID);
        return data;
    }

    if (path == '小区当日已处理报警数') {
        let data = await statisticSql.小区当日已处理报警数(villageID);
        return data;
    }

    if (path == '小区当日未处理报警数') {
        let data = await statisticSql.小区当日未处理报警数(villageID);
        return data;
    }

    if (path == '小区当日正在处理报警数') {
        let data = await statisticSql.小区当日正在处理报警数(villageID);
        return data;
    }

    if (path == '小区当日延期超时报警数') {
        let data = await statisticSql.小区当日延期超时报警数(villageID);
        return data;
    }


    if (path == '小区当日设备在线') {
        let data = await statisticSql.小区当日设备在线(villageID);
        return data;
    }

    if (path == '小区当日设备离线') {
        let data = await statisticSql.小区当日设备离线(villageID);
        return data;
    }

    if (path == '小区当日设备故障') {
        let data = await statisticSql.小区当日设备故障(villageID);
        return data;
    }

    if (path == '小区当日维修') {
        let data = await statisticSql.小区当日维修(villageID);
        return data;
    }

    if (path == '小区门禁当日开门次数') {
        let data = await statisticSql.小区门禁当日开门次数(villageID);
        return data;
    }

    if (path == '小区门禁当日访客开门次数') {
        let data = await statisticSql.小区门禁当日访客开门次数(villageID);
        return data;
    }

    if (path == '小区设备近7天报警已处置情况') {
        let data = await statisticSql.小区设备近7天报警已处置情况(villageID);
        return data;
    }
}