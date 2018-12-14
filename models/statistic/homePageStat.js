const cFun = require('../utils/commonFunc');
const villageDal = require('../dals/b_villageDal');

var getRealTimeAlarmStatistics =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }

        var replacements = {
            villageIDs: villageIDs,
        }

        var allAlarms = await villageDal.query("SELECT count(*) as allAlarm FROM e_alarm_log WHERE to_days(alarmTime) = to_days(now()) and villageID in (:villageIDs)", replacements)
        var allAlarm = allAlarms != null && allAlarms.length >= 1 ? allAlarms[0].allAlarm : 0;

        var Dones = await villageDal.query("select count(*)  as Done  from e_alarm_log where isDeal = 1 and  TO_DAYS(alarmTime)  = TO_DAYS(NOW()) and  villageID in  (:villageIDs)", replacements);

        var Done = Dones != null && Dones.length >= 1 ? Dones[0].Done : 0;
        var Doing = allAlarm - Done;
        var Delay = 0;


        //var deviceOnlines = await villageDal.query("SELECT count(DISTINCT(deviceID)) as deviceOnline FROM `e_device` WHERE to_days(stateTime) = to_days(now()) and state=1 and villageID in (:villageIDs)", replacements);
        var deviceOnlines = await villageDal.query("SELECT count(DISTINCT(deviceID)) as deviceOnline FROM `e_device` WHERE isdelete =0 and villageID in (:villageIDs)", replacements);
        var deviceOfflines = await villageDal.query("SELECT count(DISTINCT(deviceID)) as deviceOffline FROM `e_device` WHERE isdelete =0 and  to_days(stateTime) = to_days(now()) and state=0 and villageID in (:villageIDs)", replacements);
        var deviceBugs = await villageDal.query("SELECT count(DISTINCT(deviceID)) as deviceBug FROM `e_device` WHERE isdelete =0 and  to_days(stateTime) = to_days(now()) and state=2 and villageID in (:villageIDs)", replacements);
        var deviceRepairs = await villageDal.query("SELECT count(DISTINCT(deviceID)) as deviceBug FROM `e_device` WHERE isdelete =0 and to_days(stateTime) = to_days(now()) and state=2 and villageID in (:villageIDs)", replacements);


        var deviceOnline = deviceOnlines != null && deviceOnlines.length >= 1 ? deviceOnlines[0].deviceOnline : 0;
        var deviceOffline = deviceOfflines != null && deviceOfflines.length >= 1 ? deviceOfflines[0].deviceOffline : 0;
        var deviceBug = deviceBugs != null && deviceBugs.length >= 1 ? deviceBugs[0].deviceBug : 0;
        var deviceRepair = deviceRepairs != null && deviceRepairs.length >= 1 ? deviceRepairs[0].deviceRepair : 0;


        var carInOuts = await villageDal.query("SELECT COUNT(*) as carInOut FROM e_parking_log WHERE DATE(inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and villageID in (:villageIDs)", replacements)
        var carLocals = await villageDal.query("SELECT COUNT(*) as carLocal FROM e_parking_log a WHERE a.plateNo IN (SELECT plateNo FROM e_parking_car) AND a.in_outType=0  AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and villageID in (:villageIDs)", replacements)
        var carForeigns = await villageDal.query("SELECT COUNT(*) as carForeign FROM e_parking_log a   WHERE a.plateNo NOT IN (SELECT plateNo FROM e_parking_car) AND  a.in_outType=0     AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY)  and villageID in (:villageIDs)", replacements)
        var carForeignStays = await villageDal.query("SELECT COUNT(*) as carForeignStay FROM e_parking_reserve a,e_parking_car b  WHERE b.plateNo !=a.plateNo  AND  a.outParkingLogID =NULL    AND DATE(a.updateTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY)   and villageID in (:villageIDs)", replacements)

        var carInOut = carInOuts != null && carInOuts.length >= 1 ? carInOuts[0].carInOut : 0;
        var carLocal = carLocals != null && carLocals.length >= 1 ? carLocals[0].carLocal : 0;
        var carForeign = carForeigns != null && carForeigns.length >= 1 ? carForeigns[0].carForeign : 0;
        var carForeignStay = carForeignStays != null && carForeignStays.length >= 1 ? carForeignStays[0].carForeignStay : 0;


        var peopleInOuts = await villageDal.query("SELECT count(*) as peopleInOut  FROM e_access_log WHERE TO_DAYS(openTime) = TO_DAYS(NOW()) and villageID in (:villageIDs)", replacements);
        var strangerInOuts = await villageDal.query("select count(*) as strangerrInOut from  e_face_log inner join e_face on e_face_log.faceID=e_face.faceID where credentialNo='' and TO_DAYS(faceCaptureTime) = TO_DAYS(NOW()) and e_face.villageID in (:villageIDs)", replacements);
        var careInOuts = await villageDal.query("SELECT count(*) as careInOut FROM e_access_log WHERE credentialNo in (SELECT peo.credentialNo FROM p_people peo, p_people_tag ptag WHERE peo.peopleID = ptag.peopleID and peo.credentialTypeCN = '身份证' and ptag.label in(SELECT name FROM s_dictionary WHERE typeName in ('重点人口', '关爱人群','社区戒毒','吸毒人员','老人','儿童','残疾人','社区康复人员','刑满释放人员','社区矫正人员','法轮功人员','孕妇','艾滋病危险人员','肇事肇祸精神病患'))) and TO_DAYS(openTime) = TO_DAYS(NOW()) and villageID in (:villageIDs)", replacements)

        var peopleInOut = peopleInOuts != null && peopleInOuts.length >= 1 ? peopleInOuts[0].peopleInOut : 0;
        var strangerInOut = strangerInOuts != null && strangerInOuts.length >= 1 ? strangerInOuts[0].strangerrInOut : 0;
        var careInOut = careInOuts != null && careInOuts.length >= 1 ? careInOuts[0].careInOut : 0;

        // var a = strangerInOut - strangerInOut/ 10;

        // var strangerInOut = strangerInOut - ((strangerInOut-a)/100); //十位数
        //var strangerInOut

        //实时访客
        var customers = await villageDal.query("SELECT count(*) as customer FROM e_access_log WHERE  openType ='100401' and to_days(openTime) = to_days(now()) and villageID in (:villageIDs)", replacements)

        var customer = customers != null && customers.length >= 1 ? customers[0].customer : 0;


        //动态事件
        var senseEvents = await villageDal.query("SELECT count(*) as senseEvent FROM e_alarm_log WHERE alarmType<>'fire' and alarmType<>'pass' and to_days(alarmTime) = to_days(now())  and villageID in (:villageIDs)", replacements)
        var fireEvents = await villageDal.query("SELECT count(*) as fireEvent FROM e_alarm_log WHERE alarmType='fire' and to_days(alarmTime) = to_days(now()) and villageID in (:villageIDs)", replacements)
        var senseEvent = senseEvents != null && senseEvents.length >= 1 ? senseEvents[0].senseEvent : 0;
        var fireEvent = fireEvents != null && fireEvents.length >= 1 ? fireEvents[0].fireEvent : 0;



        alarms = {
            "AlarmTypeCount": allAlarm,
            "AlarmDone": Done,
            "AlarmDoing": Doing,
            "AlarmDelay": Delay,
            "deviceOnline": deviceOnline,
            "deviceOffline": deviceOffline,
            "deviceBug": deviceBug,
            "deviceRepair": deviceRepair,
            "carInOut": carInOut,
            "carLocal": carLocal,
            "carForeign": carForeign,
            "carForeignStay": carForeignStay,
            "peopleInOut": peopleInOut,
            "strangerInOut": strangerInOut,
            "careInOut": careInOut,
            "customer": customer,
            "senseEvent": senseEvent,
            "fireEvent": fireEvent,
            "allAlarm": allAlarm
        };


        var resBody = {
            data: JSON.stringify(alarms)
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getRealTimeAlarmStatistics = getRealTimeAlarmStatistics;


var getRealTimeCars =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }


        var houreReplacements = {
            villageIDs: villageIDs,
        }

        var dayReplacements = {
            villageIDs: villageIDs,
            day: new Date().getDate()
        }
        var carlocalHours = await villageDal.query(
            `
            SELECT HOUR(a.inOutTime) as hour,'本地车辆' as type,COUNT(*) as count 
            FROM e_parking_log a,e_parking_car b   
            WHERE b.plateNo =a.plateNo AND a.in_outType=0 and villageID in (:villageIDs) 
            AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
            GROUP BY HOUR(a.inOutTime) 
            UNION
            SELECT HOUR(a.inOutTime) as hour,'外来车辆' as type,COUNT(*) as count 
            FROM e_parking_log a   
            WHERE a.plateNo NOT IN (SELECT plateNo FROM e_parking_car ) AND 
            a.in_outType=0  AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and
            villageID in (:villageIDs)  GROUP BY HOUR(a.inOutTime)
            `,
            houreReplacements);
        var carlocalDays = await villageDal.query(
            `
            SELECT DATE(a.inOutTime) as day,'本地车辆' as type,COUNT(*) as count 
            FROM e_parking_log a,e_parking_car b   
            WHERE b.plateNo =a.plateNo AND a.in_outType=0 
            AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL :day DAY) and 
            villageID in (:villageIDs)  GROUP BY DATE(a.inOutTime)  
            UNION 
            SELECT DATE(a.inOutTime) as day,'外来车辆' as type,COUNT(*) as count 
            FROM e_parking_log a   
            WHERE a.plateNo NOT IN (SELECT plateNo FROM e_parking_car ) AND 
            a.in_outType=0  AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL :day DAY) and
            villageID in (:villageIDs)  GROUP BY DATE(a.inOutTime)
            `, dayReplacements);

        var carInoutHours = await villageDal.query(
            `
            SELECT HOUR(a.inOutTime) as hour,'驶入' as type,COUNT(*) as count 
            FROM e_parking_log a where a.in_outType = 0 AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and
            villageID in (:villageIDs) group by HOUR(a.inOutTime)  
            union
            SELECT HOUR(a.inOutTime) as hour,'驶出' as type,COUNT(*) as count 
            FROM e_parking_log a where a.in_outType = 1 AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and 
            villageID in (:villageIDs) group by HOUR(a.inOutTime)
            `, houreReplacements);
        var carInoutDays = await villageDal.query(
            `
            SELECT dayTb.cday '日期' ,IFNULL(dayTb.in_outType,0) '进出状态',IFNULL(tNumTb.num,0) '次数' 
            FROM (( SELECT @cdate := DATE_ADD(@cdate, INTERVAL +1 DAY) cday,'驶入' AS in_outType    
            FROM( SELECT @cdate := DATE_ADD(CURDATE(), INTERVAL -:day DAY) FROM e_parking_log LIMIT :day) t0  
            WHERE DATE(@cdate) <= DATE_ADD(CURDATE(), INTERVAL -1 DAY))     
            UNION
            (SELECT @cdate := DATE_ADD(@cdate, INTERVAL +1 DAY) cday,'驶出' AS in_outType
            FROM( SELECT @cdate := DATE_ADD(CURDATE(), INTERVAL -:day DAY) FROM e_parking_log LIMIT :day) t0
            WHERE DATE(@cdate) <= DATE_ADD(CURDATE(), INTERVAL -1 DAY))  ) dayTb  
            LEFT JOIN(  SELECT DATE(inOutTime) cday,(CASE WHEN in_outType=0 THEN '驶入' ELSE '驶出' END) AS in_outType,COUNT(in_outType) AS num 
            FROM e_parking_log  WHERE DATE(inOutTime)>DATE_ADD(CURDATE(), INTERVAL -:day DAY) and villageID in (:villageIDs)  GROUP BY cday , in_outType)
            tNumTb ON tNumTb.cday = dayTb.cday AND dayTb.in_outType = tNumTb.in_outType
            `, dayReplacements);


        var alarms = {
            "carlocalHours": carlocalHours,
            "carlocalDays": carlocalDays,
            "carInoutHours": carInoutHours,
            "carInoutDays": carInoutDays
        };

        var resBody = {
            data: JSON.stringify(alarms)
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getRealTimeCars = getRealTimeCars;

var getRealTimePeoples =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }


        var replacements = {
            villageIDs: villageIDs,
        }
        var Peoples = await villageDal.query(`
        SELECT '沪籍' AS type, COUNT(*) AS count
FROM p_people a, p_people_house b
WHERE a.peopleId = b.peopleID
	AND peopleType = 1
	AND villageID IN (:villageIDs)
UNION
SELECT '来沪' AS type, COUNT(*) AS count
FROM p_people a, p_people_house b
WHERE a.peopleId = b.peopleID
	AND peopleType = 2
	AND villageID IN (:villageIDs)
UNION
SELECT '境外' AS type, COUNT(*) AS count
FROM p_people a, p_people_house b
WHERE a.peopleId = b.peopleID
	AND peopleType = 3
	AND villageID IN (:villageIDs)
UNION
SELECT '其他' AS type, COUNT(*) AS count
FROM p_people a, p_people_house b
WHERE a.peopleId = b.peopleID
	AND peopleType != 1
	AND peopleType != 2
	AND peopleType != 3
	AND villageID IN (:villageIDs)
        `, replacements);


        peoples = {
            "Peoples": Peoples
        };


        var resBody = {
            data: JSON.stringify(peoples)
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getRealTimePeoples = getRealTimePeoples;


var getRealTimeHouses =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }


        var replacements = {
            villageIDs: villageIDs,
        }

        var Houses = await villageDal.query(`
        SELECT '自住' AS type, COUNT(DISTINCT a.houseID) AS count
FROM b_house a, b_building b
WHERE a.buildingId = b.buildingId
	AND houseUse = 1
	AND b.villageID IN (:villageIDs)
UNION
SELECT '出租' AS type,  COUNT(DISTINCT a.houseID) AS count
FROM b_house a, b_building b
WHERE a.buildingId = b.buildingId
	AND houseUse = 2
	AND b.villageID IN (:villageIDs)
UNION
SELECT '闲置' AS type, COUNT(DISTINCT a.houseID) AS count
FROM b_house a, b_building b
WHERE a.buildingId = b.buildingId
	AND houseUse = 3
	AND b.villageID IN (:villageIDs)
UNION
SELECT '其它' AS type, COUNT(DISTINCT a.houseID) AS count
FROM b_house a, b_building b
WHERE a.buildingId = b.buildingId
	AND houseUse = 0
	AND b.villageID IN (:villageIDs)
        `, replacements);

        houses = {
            "Houses": Houses
        };

        var resBody = {
            data: JSON.stringify(houses)
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getRealTimeHouses = getRealTimeHouses;


var getRealTimeAlarmSense =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;
        var days = 30;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }

        var replacements = {
            villageIDs: villageIDs,
        }
        var alarmSense = await villageDal.query("select  count(*) as count, a.alarmTypeName,cday    from e_alarm_log a,   (   SELECT @cdate := DATE_ADD(@cdate, INTERVAL +1 DAY) cday    FROM   (      SELECT @cdate := DATE_ADD(CURDATE(), INTERVAL -30 DAY) FROM e_alarm_log LIMIT 30   )    t0 WHERE DATE(@cdate) <= DATE_ADD(CURDATE(), INTERVAL -1 DAY)   ) as b,(          select alarmTypeName from (   select count(*) as count,alarmTypeName from e_alarm_log where alarmTime > DATE_ADD(CURDATE(), INTERVAL - 30 DAY)  group by alarmTypeName   ) aa order by count desc limit 5   ) c    where  DATE(alarmTime) = cday  and a.alarmTypeName = c.alarmTypeName and villageID in (:villageIDs)       group by alarmTypeName,cday order by  alarmTypeName,count desc   ".replace(/30/g, days), replacements);

        var resBody = {
            data: JSON.stringify({
                "alarmSense": alarmSense
            })
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getRealTimeAlarmSense = getRealTimeAlarmSense;


var getAlarmSense =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;
        var Days = reqBody.Days;
        if (Days == null)
            Days = 7;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }


        var replacements = {
            villageIDs: villageIDs,
        }
        var alarmType7day = await villageDal.query("select alarmTypeName,count(*) as count  from e_alarm_log where   alarmTime > DATE_SUB(CURDATE(), INTERVAL 7 DAY)   and villageID in (:villageIDs)   group by alarmTypeName   order by count desc limit 5 ", replacements);
        var alarmType30day = await villageDal.query("select alarmTypeName,count(*) as count  from e_alarm_log where   alarmTime > DATE_SUB(CURDATE(), INTERVAL 30 DAY)   and villageID in (:villageIDs)   group by alarmTypeName   order by count desc limit 5 ", replacements);

        var alarmTypeDone7day = await villageDal.query("select alarmTypeName,count(*) as count  from e_alarm_log where   alarmTime > DATE_SUB(CURDATE(), INTERVAL 7 DAY)   and villageID in (:villageIDs)   and isDeal = 1  group by alarmTypeName   order by count desc limit 5 ", replacements);
        var alarmTypeDone30day = await villageDal.query("select alarmTypeName,count(*) as count  from e_alarm_log where   alarmTime > DATE_SUB(CURDATE(), INTERVAL 30 DAY)   and villageID in (:villageIDs)  and isDeal = 1  group by alarmTypeName   order by count desc limit 5 ", replacements);

        var alarmDevice7day = await villageDal.query("select TypeName,count(*) as count  from e_alarm_log a, s_dictionary b  where   alarmTime > DATE_SUB(CURDATE(), INTERVAL 7 DAY)   and a.deviceType = b.Name  and villageID in (:villageIDs)   group by b.TypeName order by count desc limit 5", replacements);
        var alarmDevice30day = await villageDal.query("select TypeName,count(*) as count  from e_alarm_log a, s_dictionary b  where   alarmTime > DATE_SUB(CURDATE(), INTERVAL 30 DAY)   and a.deviceType = b.Name  and villageID in (:villageIDs)   group by b.TypeName order by count desc limit 5", replacements);


        alarms = {
            "alarmType7day": alarmType7day,
            "alarmType30day": alarmType30day,
            "alarmTypeDone7day": alarmTypeDone7day,
            "alarmTypeDone30day": alarmTypeDone30day,
            "alarmDevice7day": alarmDevice7day,
            "alarmDevice30day": alarmDevice30day
        };





        var resBody = {
            data: JSON.stringify(alarms)
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getAlarmSense = getAlarmSense;


var getSenseCars =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }

        var replacements = {
            villageIDs: villageIDs,
        }
        var carInoutWeek = await villageDal.query("SELECT dayTb.cday '日期' ,IFNULL(tNumTb.num,0) '次数'  FROM ((      SELECT @cdate := DATE_ADD(@cdate, INTERVAL +1 DAY) cday      FROM( SELECT @cdate := DATE_ADD(CURDATE(), INTERVAL -7 DAY) FROM e_parking_log LIMIT 7) t0     WHERE DATE(@cdate) <= DATE_ADD(CURDATE(), INTERVAL -1 DAY))       ) dayTb  LEFT JOIN(  SELECT DATE(inOutTime) cday, COUNT(in_outType) AS num FROM e_parking_log  WHERE DATE(inOutTime)>DATE_ADD(CURDATE(), INTERVAL -7 DAY) and villageID in (:villageIDs) GROUP BY cday   ) tNumTb ON tNumTb.cday = dayTb.cday  ", replacements);
        var carInoutMonth = await villageDal.query("SELECT dayTb.cday '日期' ,IFNULL(tNumTb.num,0) '次数'  FROM ((      SELECT @cdate := DATE_ADD(@cdate, INTERVAL +1 DAY) cday      FROM( SELECT @cdate := DATE_ADD(CURDATE(), INTERVAL -30 DAY) FROM e_parking_log LIMIT 30) t0     WHERE DATE(@cdate) <= DATE_ADD(CURDATE(), INTERVAL -1 DAY))       ) dayTb  LEFT JOIN(  SELECT DATE(inOutTime) cday, COUNT(in_outType) AS num FROM e_parking_log  WHERE DATE(inOutTime)>DATE_ADD(CURDATE(), INTERVAL -30 DAY) and villageID in (:villageIDs) GROUP BY cday   ) tNumTb ON tNumTb.cday = dayTb.cday    ", replacements);
        var carsWeek = await villageDal.query("select cday, count(plateNo) as carCount from (  SELECT DATE(inOutTime) cday, plateNo FROM e_parking_log    WHERE DATE(inOutTime)>DATE_ADD(CURDATE(), INTERVAL -7 DAY) and villageID in (:villageIDs)   GROUP BY cday,plateNo    )  s group by cday ", replacements);
        var carsMonth = await villageDal.query("select cday, count(plateNo) as carCount from (  SELECT DATE(inOutTime) cday, plateNo FROM e_parking_log    WHERE DATE(inOutTime)>DATE_ADD(CURDATE(), INTERVAL -30 DAY) and villageID in (:villageIDs)   GROUP BY cday,plateNo    )  s group by cday ", replacements);

        alarms = {
            "carInoutWeek": carInoutWeek,
            "carInoutMonth": carInoutMonth,
            "carsWeek": carsWeek,
            "carsMonth": carsMonth
        };

        var resBody = {
            data: JSON.stringify(alarms)
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getSenseCars = getSenseCars;

var getSenseCarInOut =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;

        var villageInfos = await villageDal.getByVillageIDs(villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }

        var replacements = {
            villageIDs: villageIDs,
        }
        var carIns = await villageDal.query("SELECT COUNT(*) as carInOut FROM e_parking_log WHERE DATE(inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and in_outType = 0 and villageID in (:villageIDs)", replacements)
        var carOuts = await villageDal.query("SELECT COUNT(*) as carInOut FROM e_parking_log WHERE DATE(inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and in_outType = 1 and villageID in (:villageIDs)", replacements)
        var carLocals = await villageDal.query("SELECT COUNT(*) as carLocal FROM e_parking_log a WHERE a.plateNo IN (SELECT plateNo FROM e_parking_car) AND a.in_outType=0  AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY) and villageID in (:villageIDs)", replacements)
        var carForeigns = await villageDal.query("SELECT COUNT(*) as carForeign FROM e_parking_log a   WHERE a.plateNo NOT IN (SELECT plateNo FROM e_parking_car) AND  a.in_outType=0     AND DATE(a.inOutTime)>DATE_SUB(CURDATE(), INTERVAL 1 DAY)  and villageID in (:villageIDs)", replacements)

        var CarInOut = await villageDal.query("select plateNo,count(plateNo) count from e_parking_log where DATE(inOutTime)>DATE_SUB(CURDATE(), INTERVAL 7 DAY) and villageID in (:villageIDs) group by plateNo order by count desc limit 5", replacements)

        for (var j = 0; j < CarInOut.length; j++) {
            CarInOut[j].carLeaveTime = 7 + j * 5;
        }
        // for(var i = 0 ; i < CarInOut.length;i++)
        // {
        //     var plateNo = CarInOut[i].plateNo;
        //     var CarInOutTime  = await villageDal.query("select inOutTime as sec, plateNo,in_outType from e_parking_log where DATE(inOutTime)>DATE_SUB(CURDATE(), INTERVAL 7 DAY) and plateNo in ('" +  plateNo + "' ) order by inOutTime desc", replacements )
        //     if(CarInOutTime != null && CarInOutTime.length >= 1)
        //     {
        //         if(CarInOutTime[ CarInOutTime.length - 1].in_outType == 1)
        //         {
        //             CarInOutTime.splice(CarInOutTime.length - 1, 1);
        //         }
        //     }
        //     if (CarInOutTime != null && CarInOutTime.length >= 1) {

        //         if (CarInOutTime[0].in_outType == 0) {
        //             CarInOutTime.unshift({"sec":new Date(), "plateNo":CarInOutTime.plateNo, "in_outType":CarInOutTime.in_outType});
        //         }
        //     }
        //     var sec = 0;
        //     for(var j = 0; j < CarInOutTime.length; j = j + 2)
        //     {
        //         // if()
        //     }

        //     for(var j = 0; j < CarInOutTime.length; j = j + 2)
        //     {
        //         sec += (new Date(CarInOutTime[j].sec).getTime()  - new Date(CarInOutTime[j +1 ].sec).getTime())/1000; 
        //     }

        //     CarInOut.carLeaveTime = sec / 3600;
        // }

        alarms = {
            "carIns": carIns,
            "carOuts": carOuts,
            "carLocals": carLocals,
            "carForeigns": carForeigns,
            "CarInOut": CarInOut
        };

        var resBody = {
            data: JSON.stringify(alarms)
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getSenseCarInOut = getSenseCarInOut;