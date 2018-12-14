const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
const cFun = require('../utils/commonFunc');


module.exports.消防设备异常感知 = async function (villageID) {
    var sql = `
    select s_dictionary.typeName,state,count(*) as count from e_device
    inner join s_dictionary
    on e_device.type=s_dictionary.name
    where villageID=:villageID
    and e_device.type in ('smokeDetector','electricArc','combustibleGas','fireCock')
    GROUP BY type,state
    `;

    var replacements = {
        villageID: villageID
    }

    var result = await query(sql, replacements);
    return JSON.stringify(result);
}

module.exports.烟感报警感知本周统计 = async function (villageID) {
    var sql = `
    select device.buildingNo,device.houseNo,count(*) AS count from e_alarm_log
inner join 
(select deviceID,b_house.buildingNo,b_house.houseNo from e_device
left join b_house on e_device.buildingID=b_house.buildingID and e_device.houseID=b_house.houseID
where e_device.type='smokeDetector' and e_device.villageID=:villageID) device
on e_alarm_log.deviceID=device.deviceID
where e_alarm_log.villageID=:villageID
and deviceType='smokeDetector'
and alarmTime>=:time
GROUP BY device.buildingNo,device.houseNo
    `;

    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 6), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);
    return JSON.stringify(result);
}

module.exports.烟感报警感知本月统计 = async function (villageID) {
    var sql = `
    select device.buildingNo,device.houseNo,count(*) AS count from e_alarm_log
inner join 
(select deviceID,b_house.buildingNo,b_house.houseNo from e_device
left join b_house on e_device.buildingID=b_house.buildingID and e_device.houseID=b_house.houseID
where e_device.type='smokeDetector' and e_device.villageID=:villageID) device 
on e_alarm_log.deviceID=device.deviceID
where e_alarm_log.villageID=:villageID
and deviceType='smokeDetector'
and alarmTime>=:time
GROUP BY device.buildingNo,device.houseNo
    `;

    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 29), 'yyyy-MM-dd')
    }



    var result = await query(sql, replacements);
    return JSON.stringify(result);
}

module.exports.报警次数和总消防感知本周 = async function (villageID) {
    var deviceSql = `
    select  type,s_dictionary.typeName,count(*) as count
from e_device
inner join s_dictionary on e_device.type=s_dictionary.name
where type in ('smokeDetector','electricArc','combustibleGas','fireCock')
and villageID=:villageID
GROUP BY type
    `;

    var deviceReplacements = {
        villageID: villageID
    }

    var deviceResult = await query(deviceSql, deviceReplacements);

    var alarmSql = `
    select deviceType,s_dictionary.typeName,count(*) as count from e_alarm_log
    inner join s_dictionary on e_alarm_log.deviceType=s_dictionary.name
where deviceType in ('smokeDetector','electricArc','combustibleGas','fireCock')
and villageID=:villageID
and alarmTime>=:time
GROUP BY deviceType
    `;

    var alarmReplacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 6), 'yyyy-MM-dd')
    }

    var alarmResult = await query(alarmSql, alarmReplacements);

    return JSON.stringify({
        device: deviceResult,
        alarm: alarmResult
    });
}

module.exports.报警次数和总消防感知本月 = async function (villageID) {
    var deviceSql = `
    select  type,s_dictionary.typeName,count(*) as count
    from e_device
    inner join s_dictionary on e_device.type=s_dictionary.name
    where type in ('smokeDetector','electricArc','combustibleGas','fireCock')
    and villageID=:villageID
    GROUP BY type
    `;

    var deviceReplacements = {
        villageID: villageID
    }

    var deviceResult = await query(deviceSql, deviceReplacements);

    var alarmSql = `
    select deviceType,s_dictionary.typeName,count(*) as count from e_alarm_log
    inner join s_dictionary on e_alarm_log.deviceType=s_dictionary.name
where deviceType in ('smokeDetector','electricArc','combustibleGas','fireCock')
and villageID=:villageID
and alarmTime>=:time
GROUP BY deviceType
    `;

    var alarmReplacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 29), 'yyyy-MM-dd')
    }

    var alarmResult = await query(alarmSql, alarmReplacements);

    return JSON.stringify({
        device: deviceResult,
        alarm: alarmResult
    });
}

module.exports.通行人数次数感知 = async function (villageID) {
    var passSql = `
    select count(*) as passCount from e_access_log
where villageID=:villageID


    `;

    var passPeoplesql = `
    select count(*) as passPeopleCount from (select count(credentialNo) from e_access_log
    where villageID=:villageID
    and credentialNo!='' and credentialType!=''
    group by credentialNo) t
    `

    var replacements = {
        villageID: villageID
    }

    var passResult = await query(passSql, replacements);
    var passPeopleResult = await query(passPeoplesql, replacements);
    return JSON.stringify({
        passCount: passResult[0].passCount,
        passPeopleCount: passPeopleResult[0].passPeopleCount
    });
}

module.exports.通行人数次数感知当日 = async function (villageID) {
    var passSql = `
    select count(*) as passCount from e_access_log
    where villageID=:villageID
    and openTime>:openTime

    `;

    var passPeoplesql = `
    select count(*) as passPeopleCount from (select count(credentialNo) from e_access_log
    where villageID=:villageID
    and credentialNo!='' and credentialType!='' and openTime>:openTime
    group by credentialNo) t
    `

    var replacements = {
        villageID: villageID,
        openTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var passResult = await query(passSql, replacements);
    var passPeopleResult = await query(passPeoplesql, replacements);
    return JSON.stringify({
        passCount: passResult[0].passCount,
        passPeopleCount: passPeopleResult[0].passPeopleCount
    });
}

module.exports.通行人数次数感知本周 = async function (villageID) {
    var passSql = `
    select count(*) as passCount from e_access_log
    where villageID=:villageID
    and openTime>=:time

    `;

    var passPeoplesql = `
    select count(*) as passPeopleCount from (select count(credentialNo) from e_access_log
    where villageID=:villageID
    and credentialNo!='' and credentialType!='' and openTime>:time
    group by credentialNo) t
    `

    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 6), 'yyyy-MM-dd')
    }

    var passResult = await query(passSql, replacements);
    var passPeopleResult = await query(passPeoplesql, replacements);
    return JSON.stringify({
        passCount: passResult[0].passCount,
        passPeopleCount: passPeopleResult[0].passPeopleCount
    });
}

module.exports.通行人数次数感知本月 = async function (villageID) {
    var passSql = `
    select count(*) as passCount from e_access_log
    where villageID=:villageID
    and openTime>:time

    `;

    var passPeoplesql = `
    select count(*) as passPeopleCount from (select count(credentialNo) from e_access_log
    where villageID=:villageID
    and credentialNo!='' and credentialType!='' and openTime>:time
    group by credentialNo) t
    `

    var replacements = {
        villageID: villageID,
        time:cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 29), 'yyyy-MM-dd')
    }

    var passResult = await query(passSql, replacements);
    var passPeopleResult = await query(passPeoplesql, replacements);
    return JSON.stringify({
        passCount: passResult[0].passCount,
        passPeopleCount: passPeopleResult[0].passPeopleCount
    });
}

module.exports.开门方式感知 = async function (villageID) {
    var sql = `
    select s_dictionary.typeName,count(*) as count from e_access_log
inner join s_dictionary on e_access_log.openType=s_dictionary.name
where e_access_log.openType!=0
and villageID=:villageID
GROUP BY e_access_log.openType
    `;

    var replacements = {
        villageID: villageID
    }

    var result = await query(sql, replacements);
    return JSON.stringify(result);
}

module.exports.开门方式感知本周 = async function (villageID) {
    var sql = `
    select s_dictionary.typeName,count(*) as count from e_access_log
    inner join s_dictionary on e_access_log.openType=s_dictionary.name
    where e_access_log.openType!=0
    and villageID=:villageID
    and e_access_log.openTime>=:time
    GROUP BY e_access_log.openType
    `;

    var replacements = {
        villageID: villageID,
        time:cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 6), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);
    return JSON.stringify(result);
}

module.exports.楼栋人员通行感知当日 = async function (villageID) {
    var passCountSql = `
    select buildingNo,count(*) as passCount from e_access_log
inner join b_building on  e_access_log.buildingID=b_building.buildingID
where e_access_log.villageID=:villageID and e_access_log.openTime>=:time
GROUP BY e_access_log.buildingID
    `;

    var passPeopleCountSql = `
    select buildingNo,count(*) as passPeopleCount from (select buildingNo,credentialNo,count(*) as count from e_access_log
inner join b_building on  e_access_log.buildingID=b_building.buildingID
where e_access_log.credentialNo!='' and e_access_log.credentialType!='' and e_access_log.villageID=:villageID and e_access_log.openTime>=:time
GROUP BY e_access_log.buildingID,e_access_log.credentialNo) t
GROUP BY t.buildingNo

    `;

    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var passCountResult = await query(passCountSql, replacements);
    var passPeopleCountResult = await query(passPeopleCountSql, replacements);
    return JSON.stringify({
        passCount: passCountResult,
        passPeopleCount: passPeopleCountResult
    });
}

module.exports.楼栋人员通行感知本周 = async function (villageID) {
    var passCountSql = `
    select buildingNo,count(*) as passCount from e_access_log
inner join b_building on  e_access_log.buildingID=b_building.buildingID
where e_access_log.villageID=:villageID 
and e_access_log.openTime>=:time
GROUP BY e_access_log.buildingID
    `;

    var passPeopleCountSql = `
    select buildingNo,count(*) as passPeopleCount from (select buildingNo,credentialNo,count(*) as count from e_access_log
inner join b_building on  e_access_log.buildingID=b_building.buildingID
where e_access_log.credentialNo!='' and e_access_log.credentialType!='' and e_access_log.villageID=:villageID and e_access_log.openTime>=:time
GROUP BY e_access_log.buildingID,e_access_log.credentialNo) t
GROUP BY t.buildingNo

    `;

    var replacements = {
        villageID: villageID,
        time:cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 6), 'yyyy-MM-dd')
    }

    var passCountResult = await query(passCountSql, replacements);
    var passPeopleCountResult = await query(passPeopleCountSql, replacements);
    return JSON.stringify({
        passCount: passCountResult,
        passPeopleCount: passPeopleCountResult
    });
}

module.exports.楼栋人员通行感知本月 = async function (villageID) {
    var passCountSql = `
    select buildingNo,count(*) as passCount from e_access_log
inner join b_building on  e_access_log.buildingID=b_building.buildingID
where e_access_log.villageID=:villageID and e_access_log.openTime>=:time
GROUP BY e_access_log.buildingID
    `;

    var passPeopleCountSql = `
    select buildingNo,count(*) as passPeopleCount from (select buildingNo,credentialNo,count(*) as count from e_access_log
inner join b_building on  e_access_log.buildingID=b_building.buildingID
where e_access_log.credentialNo!='' and e_access_log.credentialType!='' and e_access_log.villageID=:villageID and e_access_log.openTime>=:time
GROUP BY e_access_log.buildingID,e_access_log.credentialNo) t
GROUP BY t.buildingNo

    `;

    var replacements = {
        villageID: villageID,
        time:cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 29), 'yyyy-MM-dd')
    }

    var passCountResult = await query(passCountSql, replacements);
    var passPeopleCountResult = await query(passPeopleCountSql, replacements);
    return JSON.stringify({
        passCount: passCountResult,
        passPeopleCount: passPeopleCountResult
    });
}

module.exports.抓拍次数及陌生人感知当日 = async function (villageID) {
    var countSql = `
    select face.name,count(*) as count from e_face_log
inner join (select e_face.faceID,e_device.name from e_face
inner join e_device on e_face.deviceID=e_device.deviceID  and e_face.villageID=:villageID ) face on e_face_log.faceID=face.faceID
where e_face_log.faceSource=0 and e_face_log.faceCaptureTime>=:time
GROUP BY  e_face_log.faceID
    `;

    var strangerCountSql = `
    select face.name,count(*) as count from e_face_log
inner join (select e_face.faceID,e_device.name from e_face
inner join e_device on e_face.deviceID=e_device.deviceID and e_face.villageID=:villageID ) face on e_face_log.faceID=face.faceID
where e_face_log.faceSource=0 and (credentialNo='' or credentialType='') and e_face_log.faceCaptureTime>=:time
GROUP BY  e_face_log.faceID

    `;

    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var countResult = await query(countSql, replacements);
    var strangerCountResult = await query(strangerCountSql, replacements);
    return JSON.stringify({
        count: countResult,
        strangerCount: strangerCountResult
    });
}

module.exports.抓拍次数及陌生人感知本周 = async function (villageID) {
    var countSql = `
    select face.name,count(*) as count from e_face_log
inner join (select e_face.faceID,e_device.name from e_face
inner join e_device on e_face.deviceID=e_device.deviceID  and e_face.villageID=:villageID ) face on e_face_log.faceID=face.faceID
where e_face_log.faceSource=0 and  e_face_log.faceCaptureTime>=:time
GROUP BY  e_face_log.faceID
    `;

    var strangerCountSql = `
    select face.name,count(*) as count from e_face_log
inner join (select e_face.faceID,e_device.name from e_face
inner join e_device on e_face.deviceID=e_device.deviceID and e_face.villageID=:villageID ) face on e_face_log.faceID=face.faceID
where e_face_log.faceSource=0 and (credentialNo='' or credentialType='') and e_face_log.faceCaptureTime>=:time
GROUP BY  e_face_log.faceID

    `;

    var replacements = {
        villageID: villageID,
        time:cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 6), 'yyyy-MM-dd')
    }

    var countResult = await query(countSql, replacements);
    var strangerCountResult = await query(strangerCountSql, replacements);
    return JSON.stringify({
        count: countResult,
        strangerCount: strangerCountResult
    });
}

module.exports.实时进出感知 = async function (villageID) {
    var passCountSql = `
    select DATE_FORMAT(e_face_log.faceCaptureTime,'%H')  as faceCaptureHour,count(*) as count from e_face_log
inner join (select e_face.faceID,e_device.name from e_face
inner join e_device on e_face.deviceID=e_device.deviceID  and e_face.villageID=:villageID) face on e_face_log.faceID=face.faceID
where e_face_log.faceSource=0 and e_face_log.faceCaptureTime>=:time
GROUP BY DATE_FORMAT(e_face_log.faceCaptureTime,'%H') 
    `;

    var passPeopleCountSql = `
    select t.faceCaptureHour,count(*) as count from 
(select e_face_log.credentialNo,DATE_FORMAT(e_face_log.faceCaptureTime,'%H')   as faceCaptureHour,count(*) as count from e_face_log
inner join (select e_face.faceID,e_device.name from e_face
inner join e_device on e_face.deviceID=e_device.deviceID  and e_face.villageID=:villageID) face on e_face_log.faceID=face.faceID
where e_face_log.faceSource=0 and e_face_log.faceCaptureTime>=:time and e_face_log.credentialNo!='' and e_face_log.credentialType!=''
GROUP BY e_face_log.credentialNo,DATE_FORMAT(e_face_log.faceCaptureTime,'%H')) t
GROUP BY t.faceCaptureHour

    `;

    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var passCount = await query(passCountSql, replacements);
    var passPeopleCount = await query(passPeopleCountSql, replacements);
    return JSON.stringify({
        passCount: passCount,
        passPeopleCount: passPeopleCount
    });
}

module.exports.车辆驻留 = async function (villageID) {
    var sql = `
    select curParkingCount from b_village
    where villageID=:villageID
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].curParkingCount;
}


module.exports.实时预警总数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_alarm_log
    where villageID=:villageID and alarmTime>=:time
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return JSON.stringify({
        data: count[0].count
    });
}

module.exports.小区当日预警总数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_alarm_log
    where villageID=:villageID and alarmTime>=:time
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区当日未处理报警数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_alarm_log
    where villageID=:villageID and alarmTime>=:time and isDeal=0 and alarmState=0
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.今日实有预警感知系统 = async function (villageID) {
    var sql = `
    SELECT alarmType,s_dictionary.typeName as alarmTypeName,count(*) AS count FROM e_alarm_log
	inner join s_dictionary on e_alarm_log.alarmType=s_dictionary.name
	where villageID=:villageID and alarmTime>=:time
	GROUP BY alarmType
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);
    return JSON.stringify(result);
}

module.exports.车辆实时通行数量 = async function (villageID) {
    var inQuery = `
    SELECT COUNT(*) as count FROM e_parking_log 
    WHERE villageID=:villageID and inOutTime>=:time
    AND in_outType=0
    `;

    var outQuery = `
    SELECT COUNT(*) as count FROM e_parking_log 
    WHERE villageID=:villageID and inOutTime>=:time
    AND in_outType=1
    `;

    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var inResult = await query(inQuery, replacements);
    var outResult = await query(outQuery, replacements);

    var inCount = inResult[0].count;
    var outCount = outResult[0].count;

    var updateCurParkingCountSql = "update b_village set curParkingCount=parkingCount+(" + (inCount - outCount) + ") where villageID=:villageID limit 1"
    dbConnection.query(updateCurParkingCountSql, {
        replacements: replacements
    });

    return JSON.stringify({
        data: inCount + outCount
    });
}

module.exports.小区老人数量 = async function (villageID) {
    var sql = `
    SELECT count(*) as count FROM p_people_house
    WHERE isDelete=0 AND  villageID=:villageID AND isAged=1
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区儿童数量 = async function (villageID) {
    var sql = `
    SELECT count(*) as count FROM p_people_house
    WHERE isDelete=0 AND  villageID=:villageID AND isChildren=1
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区关爱数量 = async function (villageID) {
    var sql = `
    SELECT count(*) as count FROM p_people_house
    WHERE isDelete=0 AND  villageID=:villageID AND isCare=1
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区重点人员数量 = async function (villageID) {
    var sql = `
    SELECT count(*) as count FROM p_people_house
    WHERE isDelete=0 AND  villageID=:villageID AND isFocus=1
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区总楼数 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM  b_building  
             WHERE b_building.villageID=:villageID
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区总房屋数 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM b_house 
             INNER JOIN b_building 
             ON b_house.buildingID=b_building.buildingID 
             WHERE b_building.villageID=:villageID
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区总住户 = async function (villageID) {
    var sql = `
    select count(*) as count from (select houseID from p_people_house
        where villageID=:villageID and isDelete=0 and houseID!=''
        group by houseID) t
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区总人数 = async function (villageID) {
    var sql = `
    SELECT count(*) as count FROM p_people_house
    inner join  p_people on p_people_house.peopleID=p_people.peopleID
    WHERE p_people.isDeleted=0 AND 
    p_people_house.isDelete=0 AND p_people_house.villageID=:villageID 
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区车位总数 = async function (villageID) {
    var sql = `
    select parkingCount as count from b_village
    where villageID=:villageID 
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区设备总数 = async function (villageID) {
    var sql = `
    SELECT count(*) as count FROM e_device
    WHERE villageID=:villageID AND isDelete=0 AND isDisable=0
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区进入人数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_face_log
inner join e_face on e_face_log.faceID=e_face.faceID
where e_face.villageID=:villageID and faceSource=0 and faceCaptureTime>=:time and in_outType=0 
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区离开人数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_face_log
    inner join e_face on e_face_log.faceID=e_face.faceID
    where e_face.villageID=:villageID and faceSource=0 and faceCaptureTime>=:time and in_outType=1
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}


module.exports.小区人脸卡口通行数量 = async function (villageID) {
    var inSql = `
    select count(*) as count from e_face_log
inner join e_face on e_face_log.faceID=e_face.faceID
where e_face.villageID=:villageID and faceSource=0 and faceCaptureTime>:faceCaptureTime and in_outType=0 
    `;

    var outSql = `
    select count(*) as count from e_face_log
    inner join e_face on e_face_log.faceID=e_face.faceID
    where e_face.villageID=:villageID and faceSource=0 and faceCaptureTime>:faceCaptureTime and in_outType=1
    `;

    var replacements = {
        villageID: villageID,
        faceCaptureTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var inResult = await query(inSql, replacements);
    var outResult = await query(outSql, replacements);

    var inCount = inResult[0].count;
    var outCount = outResult[0].count;

    // var updateSql = 'update b_village set peopleCount=(SELECT count(*) as count FROM p_people_house WHERE isDelete=0 AND  villageID=:villageID )+(' +
    //     (inCount - outCount) + ')' +
    //     ' where villageID=:villageID limit 1';

    var updateSql = 'update b_village set peopleCount=(5000)+(' +
        (inCount - outCount) + ')' +
        ' where villageID=:villageID limit 1';
    dbConnection.query(updateSql, {
        replacements: replacements
    });

    return inCount + outCount;
}

module.exports.小区驻留人数 = async function (villageID) {

    var inSql = `
    select count(*) as count from e_face_log
inner join e_face on e_face_log.faceID=e_face.faceID
where e_face.villageID=:villageID and faceSource=0 and faceCaptureTime>:faceCaptureTime and in_outType=0 
    `;

    var outSql = `
    select count(*) as count from e_face_log
    inner join e_face on e_face_log.faceID=e_face.faceID
    where e_face.villageID=:villageID and faceSource=0 and faceCaptureTime>:faceCaptureTime and in_outType=1
    `;

    var replacements = {
        villageID: villageID,
        faceCaptureTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var inResult = await query(inSql, replacements);
    var outResult = await query(outSql, replacements);

    var inCount = inResult[0].count;
    var outCount = outResult[0].count;

    var peopleSql = `
    select peopleCount from b_village where villageID=:villageID
    `;


    var peopleSqlReplacements = {
        villageID: villageID
    }

    var peopleResult = await query(peopleSql, peopleSqlReplacements);
    var peopleCount = peopleResult[0].peopleCount;


    return peopleCount + inCount - outCount;
}

module.exports.设备实时状态统计 = async function (villageID) {
    var sql = `
    SELECT type,typeName,state,COUNT(*) AS count FROM e_device 
    inner join s_dictionary on e_device.type=s_dictionary.name
where villageID=:villageID
GROUP BY type,state 
    `;


    var replacements = {
        villageID: villageID
    }

    var result = await query(sql, replacements);



    return JSON.stringify(result);
}

module.exports.门禁访客数量 = async function (deviceID) {
    var sql = `
    select count(*) as count from e_access_log
where deviceID=:deviceID
and openType='100401'
and  openTime>=:openTime
    `;


    var replacements = {
        deviceID: deviceID,
        openTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);



    return result[0].count;
}

module.exports.人脸卡口通行数量 = async function (faceIDs) {
    var sql = `
    select count(*) as count from e_face_log
where faceID in(:faceIDs) and faceCaptureTime>=:faceCaptureTime
    `;


    var replacements = {
        faceIDs: faceIDs,
        faceCaptureTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);



    return result[0].count;
}

module.exports.小区当日驶入登记数量 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM e_parking_log WHERE inOutTime>=:inOutTime and in_outType = 0 and villageID in (:villageIDs)
and plateNo in (select plateNo from e_parking_car)

    `;


    var replacements = {
        villageIDs: [villageID],
        inOutTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);



    return result[0].count;
}

module.exports.小区当日驶出登记数量 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM e_parking_log WHERE inOutTime>=:inOutTime and in_outType=1 and villageID in (:villageIDs)
and plateNo in (select plateNo from e_parking_car)

    `;


    var replacements = {
        villageIDs: [villageID],
        inOutTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);



    return result[0].count;
}

module.exports.小区当日驶入外来数量 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM e_parking_log WHERE inOutTime>=:inOutTime and in_outType=0 and villageID in (:villageIDs)
and plateNo not in (select plateNo from e_parking_car)

    `;


    var replacements = {
        villageIDs: [villageID],
        inOutTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);



    return result[0].count;
}

module.exports.小区当日驶出外来数量 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM e_parking_log WHERE inOutTime>=:inOutTime and in_outType=1 and villageID in (:villageIDs)
and plateNo not in (select plateNo from e_parking_car)

    `;


    var replacements = {
        villageIDs: [villageID],
        inOutTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.小区停车场当日驶入数量 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM e_parking_log WHERE inOutTime>=:inOutTime and in_outType=0 and villageID=:villageID
    `;

    var replacements = {
        villageID: villageID,
        inOutTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.小区停车场当日驶出数量 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM e_parking_log WHERE inOutTime>=:inOutTime and in_outType=1 and villageID=:villageID
    `;

    var replacements = {
        villageID: villageID,
        inOutTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.小区停车场抓拍总数 = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM e_parking_log WHERE inOutTime>:inOutTime and villageID=:villageID
    `;

    var replacements = {
        villageID: villageID,
        inOutTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.当日公共管理报警数 = async function (villageID) {
    var sql = `
    
select count(*) as count from e_alarm_log
inner join e_sense_alarm_option on e_alarm_log.optionID=e_sense_alarm_option.optionID
inner join e_sense_alarm_model on e_sense_alarm_model.modelID=e_sense_alarm_option.modelID
where e_sense_alarm_model.groupName='公共管理' and alarmTime>=:alarmTime and e_alarm_log.villageID=:villageID
    `;

    var replacements = {
        villageID: villageID,
        alarmTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.当日公共服务报警数 = async function (villageID) {
    var sql = `
    
    select count(*) as count from e_alarm_log
    inner join e_sense_alarm_option on e_alarm_log.optionID=e_sense_alarm_option.optionID
    inner join e_sense_alarm_model on e_sense_alarm_model.modelID=e_sense_alarm_option.modelID
    where e_sense_alarm_model.groupName='公共服务' and alarmTime>=:alarmTime and e_alarm_log.villageID=:villageID
    `;

    var replacements = {
        villageID: villageID,
        alarmTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.当日公共安全报警数 = async function (villageID) {
    var sql = `
    
    select count(*) as count from e_alarm_log
    inner join e_sense_alarm_option on e_alarm_log.optionID=e_sense_alarm_option.optionID
    inner join e_sense_alarm_model on e_sense_alarm_model.modelID=e_sense_alarm_option.modelID
    where e_sense_alarm_model.groupName='公共安全' and alarmTime>=:alarmTime and e_alarm_log.villageID=:villageID
    `;

    var replacements = {
        villageID: villageID,
        alarmTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.小区当日陌生人员进出 = async function (villageID) {
    var sql = `
    
     select count(*) as count from  e_face_log
     inner join e_face on e_face_log.faceID=e_face.faceID 
     where credentialNo='' and faceCaptureTime>=:faceCaptureTime
     and e_face.villageID in (:villageIDs)
    `;

    var replacements = {
        villageIDs: [villageID],
        faceCaptureTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.小区当日关注人员进出 = async function (villageID) {
    var sql = `
    
    select count(*) as count from  e_face_log
    inner join e_face on e_face_log.faceID=e_face.faceID 
    where   faceCaptureTime>=:faceCaptureTime
    and e_face.villageID=:villageID and credentialNo in (
	select p_people.credentialNo from p_people_house
    inner join p_people on p_people_house.peopleID=p_people.peopleID
    where isFocus=1 and villageID=:villageID
		)
    `;

    var replacements = {
        villageID: villageID,
        faceCaptureTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var result = await query(sql, replacements);

    return result[0].count;
}

module.exports.小区当日已处理报警数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_alarm_log
    where villageID=:villageID and isDeal=1 and alarmTime>=:time 
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区当日正在处理报警数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_alarm_log
    where villageID=:villageID and alarmState=4 and isDeal=0 and alarmTime>=:time
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区当日延期超时报警数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_alarm_log
    where villageID=:villageID and isDeal=0 and alarmState=0 and alarmTime>=:time
    and processDeadline<now()
    `;


    var replacements = {
        villageID: villageID,
        time: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区当日设备在线 = async function (villageID) {
    var sql = `
    select count(*) as count from e_device
    where villageID=:villageID and state=1 and isdelete=0 and isDisable=0
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区当日设备离线 = async function (villageID) {
    var sql = `
    select count(*) as count from e_device
    where villageID=:villageID and state=0 and isdelete=0 and isDisable=0
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区当日设备故障 = async function (villageID) {
    var sql = `
    select count(*) as count from e_device
    where villageID=:villageID and state=2 and isdelete=0 and isDisable=0
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区当日维修 = async function (villageID) {
    var sql = `
    select count(*) as count from e_device
    where villageID=:villageID and state=2 and isdelete=0 and isDisable=0
    `;


    var replacements = {
        villageID: villageID
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区门禁当日开门次数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_access_log
    where villageID=:villageID and openTime>:openTime
    `;


    var replacements = {
        villageID: villageID,
        openTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区门禁当日访客开门次数 = async function (villageID) {
    var sql = `
    select count(*) as count from e_access_log
    where villageID=:villageID and openTime>:openTime and openType='100401'
    `;


    var replacements = {
        villageID: villageID,
        openTime: cFun.formatDateTime(new Date(), 'yyyy-MM-dd')
    }

    var count = await query(sql, replacements);
    return count[0].count;
}

module.exports.小区设备近7天报警已处置情况 = async function (villageID) {
    // var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    // var resDays = [];

    // for (let i = 0; i < 7; i++) {
    //     let day = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * i);

    //     resDays.push({
    //         week: weekDay[day.getDay()],
    //         day: day.getDate()
    //     })
    // }


    var sql = `
    select s_dictionary.typeName,DATE_FORMAT(alarmTime,"%Y-%m-%d") as day,count(*) as count from e_alarm_log
    inner join s_dictionary on e_alarm_log.deviceType=s_dictionary.name
    where deviceType!='' and isDeal=1 and villageID=:villageID and alarmTime>:startTime and alarmTime<:endTime
    group by deviceType,DATE_FORMAT(alarmTime,"%Y-%m-%d")
    `;


    var replacements = {
        villageID: villageID,
        startTime: cFun.formatDateTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 6), 'yyyy-MM-dd'),
        endTime: cFun.formatDateTime(new Date())
    }

    var result = await query(sql, replacements);

    // if (result != null && result.length > 0) {
    //     for (let i = 0; i < result.length; i++) {
    //         let week = _.find(resDays, x => x.day == result[i].day).week;
    //         result[i].day = week
    //     }
    // }

    return JSON.stringify(result);
}