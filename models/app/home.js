const cFun = require('../utils/commonFunc');
const optionDal = require('../dals/s_optionDal');
const villageDal = require('../dals/b_villageDal');
const authorityDal = require('../dals/s_authorityDal');
const userExtendDal = require('../dals/s_user_extendDal');
const UserExtendEntity = require('../entitys/s_user_extendEntity');
const alarmLogDal = require('../dals/e_alarm_logDal');
const TraceEntity = require('blueplus-dals').p_traceEntity;
const traceDal = require('blueplus-dals').p_traceDal;

var getAppGlobalConfig =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var authoritys = await authorityDal.getByUserID(reqBody.head.userID);
        var areaCodes = Array.from(new Set(authoritys.map(x => x.areaCode)));

        var streetCodes = areaCodes.filter(x => cFun.isStreetCode(x));
        var committeeCodes = areaCodes.filter(x => cFun.isCommitteeCode(x));
        var villageCodes = areaCodes.filter(x => cFun.isVillageCode(x));

        var villageInfos = [];
        if (committeeCodes != null && committeeCodes.length > 0) {
            var villageInfo1 = await villageDal.getByCommitteeCodes(committeeCodes);
            villageInfos = villageInfos.concat(villageInfo1);
        }

        if (streetCodes != null && streetCodes.length > 0) {
            var villageInfo2 = await villageDal.getByStreetCodes(streetCodes);
            villageInfo2 = villageInfo2.filter(x => villageInfos.findIndex(y => y.villageID == x.villageID) < 0);
            villageInfos = villageInfos.concat(villageInfo2);
        }

        if (villageCodes != null && villageCodes.length > 0) {
            var villageInfo3 = await villageDal.getByVillageNos(villageCodes);
            villageInfo3 = villageInfo3.filter(x => villageInfos.findIndex(y => y.villageID == x.villageID) < 0);
            villageInfos = villageInfos.concat(villageInfo3);
        }

        if (villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '未配置区域访问权限'));
        }

        //获取平台名称
        var prodcutName = '智慧社区移动终端';
        var prodcutInfos = await optionDal.getByKey('appProductName');
        if (prodcutInfos.length > 0) {
            var userProduct = prodcutInfos.filter(x => x.userID == reqBody.head.userID);
            if (userProduct.length > 0) {
                prodcutName = userProduct[0].value;
            } else {
                let userProduct = prodcutInfos.filter(x => x.userID == null || x.userID == '');
                if (userProduct != null) {
                    prodcutName = userProduct[0].value;
                }
            }
        }

        var realTimeCount = await alarmLogDal.countUnsolveNum(['fire', 'doorOpen', 'parkingCarExceed'], null, villageInfos.map(x => x.villageID));
        var alert = {
            name: '及时处置',
            unsolveNum: realTimeCount,
            code: 'realTimeDeal'
        };

        var notifyCount = await alarmLogDal.countUnsolveNum(['pass'], null, villageInfos.map(x => x.villageID));
        var remind = {
            name: '预警提醒',
            unsolveNum: notifyCount,
            code: 'alarmNotify'
        };

        var ops = {
            name: '异常运维',
            unsolveNum: 0,
            code: 'deviceOps'
        };

        var functions = [];
        functions.push(alert);
        functions.push(remind);
        functions.push(ops);

        var resBody = {
            prodcutName: prodcutName,
            villages: [],
            functions: functions
        };

        for (let i = 0; i < villageInfos.length; i++) {
            let villageInfo = villageInfos[i];
            resBody.villages.push({
                villageID: villageInfo.villageID,
                villageName: villageInfo.name
            });
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getAppGlobalConfig = getAppGlobalConfig;

var pushRegistrationID =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var longitude = req.body.head.longitude == null ? 0 : req.body.head.longitude;
        var latitude = req.body.head.latitude == null ? 0 : req.body.head.latitude;

        var userTrace = new TraceEntity();
        userTrace.traceID = cFun.guid();
        userTrace.pID = reqBody.head.userID;
        userTrace.pIDType = 0;
        userTrace.source = 0;
        userTrace.longitude = longitude;
        userTrace.latitude = latitude;
        userTrace.locationTime = cFun.formatDateTime();
        traceDal.insert(userTrace);

        var userExtendInfo = await userExtendDal.getByUserID(reqBody.head.userID);
        if (userExtendInfo != null) {
            userExtendDal.updateLocationRegistID(longitude, latitude, reqBody.registrationID, reqBody.head.userID);
        } else {
            var userExtendEntity = new UserExtendEntity();
            userExtendEntity.userID = reqBody.head.userID;
            userExtendEntity.longitude = longitude;
            userExtendEntity.latitude = latitude;
            userExtendEntity.pushRegistID = reqBody.registrationID;
            userExtendDal.insert(userExtendEntity);
        }

        return res.json(cFun.responseStatus(0, 'success'));
    });
module.exports.pushRegistrationID = pushRegistrationID;