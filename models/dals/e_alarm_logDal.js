const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const cFun = require('../utils/commonFunc');

var e_alarm_log = dbConnection.define('e_alarm_log', {
    alarmID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    deviceID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    deviceType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    alarmType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alarmTypeName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    optionID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    alarmLevel: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    alarmLevelName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alarmCount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    alarmContent: {
        type: Sequelize.STRING,
        allowNull: true
    },
    alarmState: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    flowLog: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isDeal: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    processedContent: {
        type: Sequelize.STRING,
        allowNull: true
    },
    processedTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('processedTime'));
        }
    },
    processDeadline: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('processDeadline'));
        }
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    alarmTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('alarmTime'));
        }
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 'e_alarm_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_alarm_log.create({
        alarmID: data.alarmID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        alarmType: data.alarmType,
        alarmTypeName: data.alarmTypeName,
        optionID: data.optionID,
        villageID: data.villageID,
        alarmLevel: data.alarmLevel,
        alarmLevelName: data.alarmLevelName,
        alarmCount: data.alarmCount,
        alarmContent: data.alarmContent,
        alarmState: data.alarmState,
        isDeal: data.isDeal,
        processedContent: data.processedContent,
        processedTime: data.processedTime,
        processDeadline: data.processDeadline,
        longitude: data.longitude,
        latitude: data.latitude,
        alarmTime: data.alarmTime,
        flowLog: data.flowLog
    });
}


module.exports.getByAlarmID = function (alarmID) {
    return e_alarm_log.find({
        where: {
            alarmID: alarmID
        }
    });
}

module.exports.countUnsolveNum = async function (alarmTypes, deviceTypes, villageIDs, userID) {

    //        left join e_sense_alarm_push_log on e_alarm_log.alarmID=e_sense_alarm_push_log.alarmID
    let sql = `
        select count(*) as count from e_alarm_log
        where  e_alarm_log.isDeal=:isDeal
    `;

    var replacements = {
        isDeal: 0
    };

    if (!cFun.isNullOrEmpty(userID)) {
        sql += ' and e_sense_alarm_push_log.userID=:userID '
        replacements.userID = userID;
    }

    if (alarmTypes != null && alarmTypes.length > 0) {

        sql += ' and e_alarm_log.alarmType in (:alarmTypes)'

        replacements.alarmTypes = alarmTypes;

    }

    if (deviceTypes != null && deviceTypes.length > 0) {
        sql += ' and e_alarm_log.deviceType in (:deviceTypes)'

        replacements.deviceTypes = deviceTypes;

    }

    if (villageIDs != null && villageIDs != '') {
        sql += ' and e_alarm_log.villageID in (:villageIDs)'

        replacements.villageIDs = villageIDs;
    }

    let result = await query(sql, replacements);

    return result[0].count;
}

module.exports.countUnsolveNumByModelIDs = async function (modelIDs, villageIDs, userID) {

    var sql = `
    select count(*) as count from e_alarm_log 
    where 
    e_alarm_log.optionID in (
        select e_sense_alarm_option.optionID from e_sense_alarm_option
            inner join e_sense_alarm_model
            on e_sense_alarm_option.modelID=e_sense_alarm_model.modelID
            where e_sense_alarm_model.modelID in(:modelIDs))
    and e_alarm_log.isDeal=0
    and e_alarm_log.villageID in(:villageIDs)
    `;

    var replacements = {
        modelIDs: modelIDs,
        villageIDs: villageIDs
    };

    if (!cFun.isNullOrEmpty(userID)) {
        sql + ' and  e_sense_alarm_push_log.userID=:userID';
        replacements.userID = userID;
    }

    let result = await query(sql, replacements);
    if (result != null && result.length > 0) {
        return result[0].count;
    }

    return 0;
}

module.exports.getAlarmList = function (villageIDs, deviceTypes, alarmTypes,
    alarmStates,
    pageNum, pageSize,
    startTime, endTime,
    deviceID, isDeal, optionIDs, filterAlarmType) {
    var sql = `SELECT e_alarm_log.*,
        e_device.deviceID,e_device.type,e_device.houseID,e_device.buildingID,e_device.name as deviceName FROM  e_alarm_log 
        left join e_device 
         on e_alarm_log.deviceID=e_device.deviceID 
         where e_alarm_log.villageID in(:villageID)  `;
    var replacements = {
        villageID: villageIDs,
    }

    if (filterAlarmType != null && filterAlarmType != '') {
        sql += ' and e_alarm_log.alarmType!=:filterAlarmType ';
        replacements.filterAlarmType = filterAlarmType;
    }

    if (deviceID != null && deviceID != '') {
        sql += ' and e_device.deviceID=:deviceID ';
        replacements.deviceID = deviceID;
    }

    if (deviceTypes != null && deviceTypes.length > 0) {
        sql += ' and e_device.type in(:type) ';
        replacements.type = deviceTypes;
    }

    if (alarmTypes != null && alarmTypes.length > 0 && optionIDs != null && optionIDs.length > 0) {
        sql += 'and ( e_alarm_log.alarmType in(:alarmType) or e_alarm_log.optionID in(:optionIDs) )';
        replacements.alarmType = alarmTypes;
        replacements.optionIDs = optionIDs;

    } else {
        if (alarmTypes != null && alarmTypes.length > 0) {
            sql += 'and e_alarm_log.alarmType in(:alarmType) ';
            replacements.alarmType = alarmTypes;
        }

        if (optionIDs != null && optionIDs.length > 0) {
            sql += ' and e_alarm_log.optionID in(:optionIDs) ';
            replacements.optionIDs = optionIDs;
        }
    }

    if (alarmStates != null && alarmStates.length > 0) {
        sql += 'and e_alarm_log.alarmState in(:alarmState) ';
        replacements.alarmState = alarmStates;
    }

    if (isDeal == 0 || isDeal == 1) {
        sql += 'and e_alarm_log.isDeal=:isDeal ';
        replacements.isDeal = isDeal;
    }

    if (startTime != null && startTime != '') {
        sql += 'and e_alarm_log.alarmTime>=:startTime';
        replacements.startTime = startTime;
    }

    if (endTime != null && endTime != '') {
        sql += 'and e_alarm_log.alarmTime<=:endTime';
        replacements.endTime = endTime;
    }

    sql += ' order by e_alarm_log.alarmTime desc ';

    if (pageNum > 0 && pageSize > 0) {
        sql += ' limit ' + (pageNum - 1) * pageSize + ',' + pageSize;
    }

    return query(sql, replacements);
}

module.exports.getAlarmInfo = function (alarmID) {
    var sql = `SELECT e_alarm_log.*,
        e_device.deviceID,e_device.type,e_device.houseID,e_device.buildingID FROM  e_alarm_log 
        left join e_device 
         on e_alarm_log.deviceID=e_device.deviceID 
         where e_alarm_log.alarmID=:alarmID  `;
    var replacements = {
        alarmID: alarmID,
    }

    return query(sql, replacements);
}

module.exports.getAlarmListByOption = function (optionIDs, villageIDs, isDeal,
    pageNum, pageSize) {
    var sql = `
        select * from e_alarm_log
         where
          e_alarm_log.optionID in(:optionIDs)
         and e_alarm_log.villageID in(:villageIDs) 
         and e_alarm_log.isDeal=:isDeal order by e_alarm_log.alarmTime desc
    `
    var replacements = {
        optionIDs: optionIDs,
        villageIDs: villageIDs,
        isDeal: isDeal
    }

    if (pageNum > 0 && pageSize > 0) {
        sql += ' limit ' + (pageNum - 1) * pageSize + ',' + pageSize;
    }

    return query(sql, replacements);
}

module.exports.getByDevice = function (deviceID, alarmTypes,
    pageNum, pageSize) {
    var sql = 'SELECT * FROM e_alarm_log ' +
        ' inner join e_device ' +
        ' on e_alarm_log.deviceID=e_device.deviceID ';
    var replacements = {

    }

    if (deviceID != null) {
        sql += ' and e_alarm_log.deviceID=:deviceID ';
        replacements.deviceID = deviceID;
    }

    if (alarmTypes != null) {
        sql += 'and e_alarm_log.alarmType in(:alarmTypes) ';
        replacements.alarmTypes = alarmTypes;
    }

    sql += ' order by e_alarm_log.alarmTime desc ';

    if (pageNum > 0 && pageSize > 0) {
        sql += ' limit ' + (pageNum - 1) * pageSize + ',' + pageNum;
    }

    return query(sql, replacements);
}

module.exports.getWaitPushAlarms = function () {
    var sql = `
    select * from e_alarm_log
inner join e_sense_alarm_option on e_alarm_log.optionID=e_sense_alarm_option.optionID
inner join e_sense_alarm_flow on e_sense_alarm_option.flowID=e_sense_alarm_flow.flowID
where e_alarm_log.isDeal=0 and e_alarm_log.processedTime<NOW() and e_alarm_log.alarmLevel>0
and e_sense_alarm_option.isValid=0 and e_sense_alarm_option.isDelete=0 and e_sense_alarm_option.startTime<NOW() and e_sense_alarm_option.endTime>NOW()
and e_sense_alarm_flow.isValid=0 and e_sense_alarm_flow.isDelete=0
    `;
    var replacements = {

    }

    return query(sql, replacements);
}


module.exports.update = function (data) {
    return e_alarm_log.update({
        alarmID: data.alarmID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        alarmType: data.alarmType,
        alarmTypeName: data.alarmTypeName,
        optionID: data.optionID,
        villageID: data.villageID,
        alarmLevel: data.alarmLevel,
        alarmLevelName: data.alarmLevelName,
        alarmCount: data.alarmCount,
        alarmContent: data.alarmContent,
        alarmState: data.alarmState,
        isDeal: data.isDeal,
        processedContent: data.processedContent,
        processedTime: data.processedTime,
        processDeadline: data.processDeadline,
        longitude: data.longitude,
        latitude: data.latitude,
        alarmTime: data.alarmTime,
        flowLog: data.flowLog
    }, {
        where: {
            alarmID: data.alarmID
        }
    });
}


module.exports.delete = function (alarmID) {
    return e_alarm_log.destroy({
        where: {
            alarmID: alarmID
        }
    });
}


var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
module.exports.query = query;