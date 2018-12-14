const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const senseAlarmOptionDal = require('../dals/e_sense_alarm_optionDal');
const userDal = require('../dals/s_userDal');
const houseDal = require('../dals/b_houseDal');
const buildingDal = require('../dals/b_buildingDal');
const villageDal = require('../dals/b_villageDal');
const dictionaryDal = require('../dals/s_dictionaryDal');
const peopleDal = require('../dals/p_peopleDal');
const resourceDal = require('../dals/s_resourceDal');
const peopleTagDal = require('../dals/p_people_tagDal');
const peopelHouseDal = require('../dals/p_people_houseDal');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');
const verifyAuthority = require('../authority/verifyAuthority');
const parkingDal = require('../dals/e_parkingDal');

var getAlarmList = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    var pageNum = Number(reqBody.pageNum);
    var pageSize = Number(reqBody.pageSize);

    if (pageNum < 1) {
        pageNum = 1;
    }

    if (pageSize < 1) {
        pageSize = 100;
    }

    if (reqBody.modelIDs == '') {
        reqBody.modelIDs = null;
    }

    if (reqBody.alarmTypes == '') {
        reqBody.alarmTypes = null;
    }

    var userFunctions = await redis.getAsync(redisKey.userAuthorityFunctions);

    var filterAlarmType = '';
    var senseAlarmOptions = [];
    if (reqBody.modelID != null && reqBody.modelID != '') {

        let allSenseAlarmOptions = await senseAlarmOptionDal.getByModelID(reqBody.modelID);
        for (let i = 0; i < reqBody.villageIDs.length; i++) {
            let option = allSenseAlarmOptions.filter(x => x.villageID == reqBody.villageIDs[i])[0];
            if (option == null) {
                option = allSenseAlarmOptions.filter(x => cFun.isNullOrEmpty(x.villageID))[0];
            }

            if (option != null) {
                senseAlarmOptions.push(option);
            }
        }
    }

    if (reqBody.modelIDs != null && reqBody.modelIDs.length > 0) {

        let allSenseAlarmOptions = await senseAlarmOptionDal.getByModelIDs(reqBody.modelIDs);
        for (let i = 0; i < reqBody.villageIDs.length; i++) {
            let options = allSenseAlarmOptions.filter(x => x.villageID == reqBody.villageIDs[i]);
            senseAlarmOptions = senseAlarmOptions.concat(options);
        }
    }

    var optionIDs = _.map(senseAlarmOptions, x => x.optionID);

    //如果optionIDs 和 alarmTypes 均为空，则直接返回
    if (optionIDs != null && optionIDs.length == 0 &&
        reqBody.alarmTypes != null && reqBody.alarmTypes.length == 0) {
        return res.json(cFun.responseStatus(0, '没有报警数据'))
    }

    // if ((!cFun.isNullOrEmpty(reqBody.modelID) || reqBody.modelIDs != null && reqBody.modelIDs.length > 0) &&
    //     optionIDs == null || optionIDs.length == 0) {
    //     return res.json(cFun.responseStatus(0, '模型没有配置option'));
    // }

    var deviceAlarmList = await alarmLogDal.getAlarmList(reqBody.villageIDs,
        reqBody.deviceTypes, reqBody.alarmTypes, null, pageNum, pageSize, null, null,
        reqBody.deviceID, Number(reqBody.isDeal), optionIDs,
        filterAlarmType);

    if (deviceAlarmList == null || deviceAlarmList.length == 0) {
        return res.json(cFun.responseStatus(0, '没有报警数据'));
    }

    var villageIDs = Array.from(new Set(deviceAlarmList.map(x => x.villageID)));
    _.remove(villageIDs, x => cFun.isNullOrEmpty(x));
    var villageInfos = await villageDal.getByVillageIDs(villageIDs);
    if (villageInfos == null || villageInfos.length == 0) {
        return res.json(cFun.responseStatus(-1, '数据异常'));
    }

    var houseIDs = Array.from(new Set(deviceAlarmList.map(x => x.houseID)));
    _.remove(houseIDs, x => cFun.isNullOrEmpty(x));

    var buildingIDs = Array.from(new Set(deviceAlarmList.map(x => x.buildingID)));
    _.remove(buildingIDs, x => cFun.isNullOrEmpty(x));

    let houseInfosPr = houseDal.getByHouseIDs(houseIDs);
    let buildingInfosPr = buildingDal.getByBuildingIDs(buildingIDs);


    var alarmReasonDic = [];
    if (reqBody.isDeal != 0) {

        let dictionarys = await redis.getAsync('likeAlarmReason');
        if (dictionarys == null) {
            dictionarys = await dictionaryDal.getLikePath('alarmReason');
            if (dictionarys != null) {
                redis.set('likeAlarmReason', JSON.stringify(dictionarys), 60 * 60);
            }
        } else {
            dictionarys = JSON.parse(dictionarys);
        }

        if (dictionarys == null || dictionarys.length == 0) {
            alarmReasonDic.push({
                name: 'falseAlarm',
                typeName: '误报'
            });

            alarmReasonDic.push({
                name: 'manMade',
                typeName: '人为'
            });
        } else {
            for (let i = 0; i < dictionarys.length; i++) {
                alarmReasonDic.push({
                    name: dictionarys[i].name,
                    typeName: dictionarys[i].typeName
                })
            }
        }
    }

    let alarmLevelColorsPr = getByPath('alarmLevelColor');
    let peopleLabelDicsPr = getByPath('db/p_people_tag/label');

    //获取peoplePicUrl
    var villageResources = await resourceDal.getByBusinessIDs('peoplePic', 'url', [deviceAlarmList[0].villageID]);
    var peoplePicUrl = '';
    if (villageResources != null && villageResources.length > 0) {
        peoplePicUrl = villageResources[0].filePath;
    } else {
        var resources = await resourceDal.getBusinessType('peoplePic');
        if (resources != null && resources.length > 0) {
            peoplePicUrl = resources[0].filePath;
        }
    }

    var houseInfos = await houseInfosPr;
    var buildingInfos = await buildingInfosPr;
    var alarmLevelColors = await alarmLevelColorsPr;
    var peopleLabelDics = await peopleLabelDicsPr;

    var alarms = [];
    for (let i = 0; i < deviceAlarmList.length; i++) {
        const element = deviceAlarmList[i];

        var buildingNo = '';
        var houseNo = '';
        var floor = "";

        if (element.houseID != null && element.houseID != '') {
            var houseInfo = houseInfos.filter(x => x.houseID == element.houseID)[0];
            if (houseInfo != null) {
                buildingNo = houseInfo.buildingNo;
                houseNo = houseInfo.houseNo;
                floor = houseInfo.floor;
            }
        } else {
            if (element.buildingID != null && element.buildingID != '') {
                var buildingInfo = buildingInfos.filter(x => x.buildingID == element.buildingID)[0];
                if (buildingInfo != null) {
                    buildingNo = buildingInfo.buildingNo;
                }
            }
        }

        var alarm = {
            alarmID: element.alarmID,
            deviceID: element.deviceID,
            deviceName: element.deviceName,
            deviceType: element.type,
            alarmType: element.alarmType,
            alarmTypeName: element.alarmTypeName,
            alarmLevel: element.alarmLevel,
            alarmLevelName: element.alarmLevelName,
            alarmCount: element.alarmCount,
            alarmState: element.alarmState,
            isDeal: element.isDeal,
            alarmTime: cFun.formatDateTime(element.alarmTime),
            buildingID: element.buildingID,
            buildingNo: buildingNo,
            houseID: element.houseID,
            houseNo: houseNo,
            floor: floor,
            images: [],
            address: '',
            alarmContent: '',
            currentFlowNo: 0,
            longitude: element.longitude,
            latitude: element.latitude
        };

        //报警颜色
        let alarmLevelColor = alarmLevelColors.filter(x => Number(cFun.removeSpace(x.name)) == element.alarmLevel)[0];
        if (alarmLevelColor != null) {
            alarm.alarmLevelColor = alarmLevelColor.typeName;
        }

        //组装触发报警规则人
        if (element.alarmContent != null && element.alarmContent != '') {
            if (element.alarmType == 'pass' || element.alarmType == 'face') {
                var passAlarm = cFun.jsonTryParse(element.alarmContent);
                if (passAlarm != null) {

                    //获取people
                    var people = await redis.getAsync(redisKey.peopleInfo(passAlarm.peopleID));
                    if (people == null) {
                        people = await peopleDal.getByPeopleID(passAlarm.peopleID);

                        if (people != null) {
                            redis.set(redisKey.peopleInfo(passAlarm.peopleID), JSON.stringify(people), 60 * 60);
                        }
                    } else {
                        people = JSON.parse(people);
                    }

                    //获取peopleHouse
                    var peopleHouse = await redis.getAsync(redisKey.peopleHouseInfo(passAlarm.peopleID));
                    if (peopleHouse == null) {
                        peopleHouse = await peopelHouseDal.getByPeopleID(passAlarm.peopleID);

                        if (peopleHouse != null) {
                            redis.set(redisKey.peopleHouseInfo(passAlarm.peopleID), JSON.stringify(peopleHouse), 60 * 60);
                        }
                    } else {
                        peopleHouse = JSON.parse(peopleHouse);
                    }


                    if (peopleHouse != null) {
                        alarm.buildingNo = peopleHouse.buildingNo;
                        alarm.houseNo = peopleHouse.houseNo;
                    }


                    if (people != null) {

                        var resLabels = [];
                        if (peopleLabelDics != null && peopleLabelDics.length > 0) {

                            //peopelLabels 获取
                            var peopelLabels = await redis.getAsync(redisKey.peopleTags(people.peopleID));
                            if (peopelLabels == null) {

                                peopelLabels = await peopleTagDal.getByPeopleID(people.peopleID);
                                if (peopelLabels != null) {
                                    redis.set(redisKey.peopleTags(people.peopleID), JSON.stringify(peopelLabels), 60 * 60);
                                }
                            } else {
                                peopelLabels = JSON.parse(peopelLabels);
                            }

                            if (peopelLabels != null) {
                                var labels = peopelLabels.map(x => x.label);
                                for (let i = 0; i < labels.length; i++) {
                                    var peopleLabel = peopleLabelDics.filter(x => cFun.removeSpace(x.name) == cFun.removeSpace(labels[i]))
                                    if (peopleLabel != null) {
                                        resLabels.push(peopleLabel);
                                    }
                                }
                            }
                        }

                        alarm.alarmPeople = {
                            name: cFun.maskPeopleName(people.peopleName, verifyAuthority.viewPeopleName(userFunctions)),
                            age: cFun.getAge(people.birthDate),
                            peopleID: people.peopleID,
                            pic: people.headPic == null || people.headPic == '' ? '' : peoplePicUrl + people.headPic,
                            labels: resLabels
                        }
                    }
                }
            }

            if (element.alarmType == 'parkingCarExceed') {
                let parkingCarExceedAlarm = cFun.jsonTryParse(element.alarmContent);
                if (parkingCarExceedAlarm != null) {

                    let parking = await redis.getAsync(redisKey.parkingInfo(parkingCarExceedAlarm.parkingID));
                    if (parking == null) {
                        parking = await parkingDal.getByParkingID(parkingCarExceedAlarm.parkingID);

                        if (parking != null) {
                            redis.set(redisKey.parkingInfo(parkingCarExceedAlarm.parkingID), JSON.stringify(parking), 60 * 60);
                        }
                    } else {
                        parking = JSON.parse(parking);
                    }

                    if (parking != null) {
                        alarm.parkingName = parking.name;
                    }
                }
            }
        }


        var villageInfo = cFun.firstOrDefault(villageInfos.filter(x => x.villageID == element.villageID));
        if (villageInfo != null) {
            alarm.villageID = villageInfo.villageID;
            alarm.villageName = villageInfo.name;
            alarm.address = alarm.villageName;

            if (alarm.buildingNo != null && alarm.buildingNo != '') {
                alarm.address += alarm.buildingNo + '号';
            }

            if (alarm.houseNo != null && alarm.houseNo != '') {
                alarm.address += alarm.houseNo;
            }

            alarm.alarmContent = alarm.address + ' ' + alarm.alarmTypeName;
        }

        //currentFlowNo
        if (!cFun.isNullOrEmpty(element.flowLog)) {
            var flowLogEntity = cFun.jsonTryParse(element.flowLog);
            if (flowLogEntity != null) {
                alarm.currentFlowNo = flowLogEntity.currentFlowNo;
            }
        }

        //已处理
        if (alarm.isDeal == 1) {
            alarm.processedUser = '';
            alarm.processedTime = cFun.formatDateTime(element.processedTime);

            var alarmProcessEntity = cFun.jsonTryParse(element.processedContent);
            if (alarmProcessEntity != null) {

                if (alarmProcessEntity.userID != null && alarmProcessEntity.userID != '') {

                    //user 获取
                    var user = await redis.getAsync(redisKey.userInfo(alarmProcessEntity.userID));
                    if (user == null) {
                        user = await userDal.getByID(alarmProcessEntity.userID);
                        if (user != null) {
                            redis.set(redisKey.userInfo(alarmProcessEntity.userID), JSON.stringify(user), 60 * 60);
                        }
                    } else {
                        user = JSON.parse(user);
                    }

                    if (user != null) {
                        alarm.processedUser = user.displayName;
                    }
                }

                var processedResult = alarmReasonDic.filter(x => x.name == alarmProcessEntity.resultType)[0];
                alarm.processedResult = processedResult == null ? '' : processedResult.typeName;
                alarm.processedRemark = alarmProcessEntity.remark;
            }
        }

        alarms.push(alarm);
    }

    var resBody = {
        alarms: alarms
    };

    return res.json(cFun.responseStatus(0, 'success', resBody));
});
module.exports.getAlarmList = getAlarmList;

var getByPath = async function (path) {

    var dics = await redis.getAsync(redisKey.dictionary(path));
    if (dics == null) {
        dics = await dictionaryDal.getByPath(path);

        if (dics != null) {
            redis.set(redisKey.dictionary(path), JSON.stringify(dics), 60 * 60)
        }
    } else {
        dics = JSON.parse(dics);
    }

    return dics;
};

var getAlarm = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var deviceAlarmList = await alarmLogDal.getAlarmInfo(reqBody.alarmID);

    if (deviceAlarmList == null || deviceAlarmList.length == 0) {
        return res.json(cFun.responseStatus(0, '没有报警数据'));
    }

    var villageIDs = Array.from(new Set(deviceAlarmList.map(x => x.villageID)));
    var villageInfos = await villageDal.getByVillageIDs(villageIDs);
    if (villageInfos == null || villageInfos.length == 0) {
        return res.json(cFun.responseStatus(-1, '数据异常'));
    }

    var houseIDs = Array.from(new Set(deviceAlarmList.map(x => x.houseID)));
    var houseInfos = await houseDal.getByHouseIDs(houseIDs);

    var buildingIDs = Array.from(new Set(deviceAlarmList.map(x => x.buildingID)));
    var buildingInfos = await buildingDal.getByBuildingIDs(buildingIDs);

    var alarmReasonDic = [];
    if (reqBody.isDeal != 0) {
        var dictionarys = await dictionaryDal.getByPath('alarmReason');
        if (dictionarys == null || dictionarys.length == 0) {
            alarmReasonDic.push({
                name: 'falseAlarm',
                typeName: '误报'
            });

            alarmReasonDic.push({
                name: 'manMade',
                typeName: '人为'
            });
        } else {
            for (let i = 0; i < dictionarys.length; i++) {
                alarmReasonDic.push({
                    name: dictionarys[i].name,
                    typeName: dictionarys[i].typeName
                })
            }
        }
    }

    var alarmLevelColors = await dictionaryDal.getByPath('alarmLevelColor');
    var peopleLabelDics = await dictionaryDal.getByPath('db/p_people_tag/label');

    var alarms = [];
    for (let i = 0; i < deviceAlarmList.length; i++) {
        const element = deviceAlarmList[i];

        var buildingNo = '';
        var houseNo = '';
        var floor = "";

        if (element.houseID != null && element.houseID != '') {
            var houseInfo = houseInfos.filter(x => x.houseID == element.houseID)[0];
            if (houseInfo != null) {
                buildingNo = houseInfo.buildingNo;
                houseNo = houseInfo.houseNo;
                floor = houseInfo.floor;
            }
        } else {
            if (element.buildingID != null && element.buildingID != '') {
                var buildingInfo = buildingInfos.filter(x => x.buildingID == element.buildingID)[0];
                if (buildingInfo != null) {
                    buildingNo = buildingInfo.buildingNo;
                }
            }
        }

        var alarm = {
            alarmID: element.alarmID,
            deviceID: element.deviceID,
            deviceType: element.type,
            alarmType: element.alarmType,
            alarmTypeName: element.alarmTypeName,
            alarmLevel: element.alarmLevel,
            alarmLevelName: element.alarmLevelName,
            alarmCount: element.alarmCount,
            alarmState: element.alarmState,
            isDeal: element.isDeal,
            alarmTime: cFun.formatDateTime(element.alarmTime),
            buildingID: element.buildingID,
            buildingNo: buildingNo,
            houseID: element.houseID,
            houseNo: houseNo,
            floor: floor,
            images: [],
            address: '',
            alarmContent: '',
            currentFlowNo: 0
        };

        //报警颜色
        let alarmLevelColor = alarmLevelColors.filter(x => Number(cFun.removeSpace(x.name)) == element.alarmLevel)[0];
        if (alarmLevelColor != null) {
            alarm.alarmLevelColor = alarmLevelColor.typeName;
        }

        //组装触发报警规则人
        if (element.alarmContent != null && element.alarmContent != '') {
            if (element.alarmType == 'pass') {
                var passAlarm = cFun.jsonTryParse(element.alarmContent);
                if (passAlarm != null) {
                    var people = await peopleDal.getByPeopleID(passAlarm.peopleID);
                    var peopleHouse = await peopelHouseDal.getByPeopleID(passAlarm.peopleID);

                    if (peopleHouse != null) {
                        alarm.buildingNo = peopleHouse.buildingNo;
                        alarm.houseNo = peopleHouse.houseNo;
                    }

                    //获取peoplePicUrl
                    var villageResources = await resourceDal.getByBusinessIDs('peoplePic', 'url', [element.villageID]);
                    var peoplePicUrl = '';
                    if (villageResources != null && villageResources.length > 0) {
                        peoplePicUrl = villageResources[0].filePath;
                    } else {
                        var resources = await resourceDal.getBusinessType('peoplePic');
                        peoplePicUrl = resources[0].filePath;
                    }

                    if (people != null) {

                        var resLabels = [];

                        if (peopleLabelDics != null && peopleLabelDics.length > 0) {
                            var peopelLabels = await peopleTagDal.getByPeopleID(people.peopleID);
                            if (peopelLabels != null) {
                                var labels = peopelLabels.map(x => x.label);
                                for (let i = 0; i < labels.length; i++) {
                                    var peopleLabel = peopleLabelDics.filter(x => cFun.removeSpace(x.name) == cFun.removeSpace(labels[i]))
                                    if (peopleLabel != null) {
                                        resLabels.push(peopleLabel);
                                    }
                                }
                            }
                        }

                        alarm.alarmPeople = {
                            name: people.peopleName,
                            age: cFun.getAge(people.birthDate),
                            peopleID: people.peopleID,
                            pic: people.headPic == null || people.headPic == '' ? '' : peoplePicUrl + people.headPic,
                            labels: resLabels
                        }
                    }
                }
            }
        }


        var villageInfo = cFun.firstOrDefault(villageInfos.filter(x => x.villageID == element.villageID));
        if (villageInfo != null) {
            alarm.villageID = villageInfo.villageID;
            alarm.villageName = villageInfo.name;
            alarm.address = alarm.villageName;

            if (alarm.buildingNo != null && alarm.buildingNo != '') {
                alarm.address += alarm.buildingNo + '号';
            }

            if (alarm.houseNo != null && alarm.houseNo != '') {
                alarm.address += alarm.houseNo;
            }

            alarm.alarmContent = alarm.address + ' ' + alarm.alarmTypeName;
        }

        //currentFlowNo
        if (!cFun.isNullOrEmpty(element.flowLog)) {
            var flowLogEntity = cFun.jsonTryParse(element.flowLog);
            if (flowLogEntity != null) {
                alarm.currentFlowNo = flowLogEntity.currentFlowNo;
            }
        }

        //已处理
        if (alarm.isDeal == 1) {
            alarm.processedUser = '';
            alarm.processedTime = cFun.formatDateTime(element.processedTime);

            var alarmProcessEntity = cFun.jsonTryParse(element.processedContent);
            if (alarmProcessEntity != null) {

                if (alarmProcessEntity.userID != null && alarmProcessEntity.userID != '') {
                    var user = await userDal.getByID(alarmProcessEntity.userID);
                    if (user != null) {
                        alarm.processedUser = user.displayName;
                    }
                }

                var processedResult = alarmReasonDic.filter(x => x.name == alarmProcessEntity.resultType)[0];
                alarm.processedResult = processedResult == null ? '' : processedResult.typeName;
                alarm.processedRemark = alarmProcessEntity.remark;
            }
        }

        alarms.push(alarm);
    }

    var resBody = {
        alarm: alarms.length > 0 ? alarms[0] : null
    };

    return res.json(cFun.responseStatus(0, 'success', resBody));
});
module.exports.getAlarm = getAlarm;