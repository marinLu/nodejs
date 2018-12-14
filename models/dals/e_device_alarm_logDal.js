const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');
const Op = dbConnection.Op;

var e_device_alarm_log = dbConnection.define('e_device_alarm_log', {
    alarmID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    deviceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    deviceType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alarmType: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    alarmTypeName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alarmLevel: {
        type: Sequelize.CHAR,
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
    alarmState: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isDeal: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    alarmTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('alarmTime'))
        }
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('insertTime'))
        }
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 'e_device_alarm_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_device_alarm_log.create({
        alarmID: data.alarmID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        alarmType: data.alarmType,
        alarmTypeName: data.alarmTypeName,
        alarmLevel: data.alarmLevel,
        alarmLevelName: data.alarmLevelName,
        alarmCount: data.alarmCount,
        alarmState: data.alarmState,
        alarmTime: data.alarmTime,
        isDeal: data.isDeal,
    });
}

module.exports.getByAlarmID = function (alarmID) {
    return e_device_alarm_log.find({
        where: {
            alarmID: alarmID
        }
    });
}

module.exports.getByDevice = function (deviceID, alarmTypes,
    pageNum, pageSize) {
    var sql = 'SELECT * FROM e_device_alarm_log ' +
        ' inner join e_device ' +
        ' on e_device_alarm_log.deviceID=e_device.deviceID ';
    var replacements = {

    }

    if (deviceID != null) {
        sql += ' and e_device_alarm_log.deviceID=:deviceID ';
        replacements.deviceID = deviceID;
    }

    if (alarmTypes != null) {
        sql += 'and e_device_alarm_log.alarmType in(:alarmTypes) ';
        replacements.alarmTypes = alarmTypes;
    }

    sql += ' order by e_device_alarm_log.alarmTime desc ';

    if (pageNum > 0 && pageSize > 0) {
        sql += ' limit ' + (pageNum - 1) * pageSize + ',' + pageNum * pageSize;
    }

    return dbConnection.query(sql, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.getDeviceAlarmList = function (villageIDs, deviceTypes, alarmTypes,
    alarmStates,
    pageNum, pageSize,
    startTime, endTime) {
    var sql = 'SELECT * FROM e_device_alarm_log ' +
        ' inner join e_device ' +
        ' on e_device_alarm_log.deviceID=e_device.deviceID ' +
        ' where e_device.villageID in(:villageID) ';
    var replacements = {
        villageID: villageIDs,
    }

    if (deviceTypes != null && deviceTypes.length > 0) {
        sql += ' and e_device.type in(:type) ';
        replacements.type = deviceTypes;
    }

    if (alarmTypes != null && alarmTypes.length > 0) {
        sql += 'and e_device_alarm_log.alarmType in(:alarmType) ';
        replacements.alarmType = alarmTypes;
    }

    if (alarmStates != null && alarmStates.length > 0) {
        sql += 'and e_device_alarm_log.alarmState in(:alarmState) ';
        replacements.alarmState = alarmStates;
    }

    if (startTime != null && startTime != '') {
        sql += 'and e_device_alarm_log.alarmTime>=:startTime';
        replacements.startTime = startTime;
    }

    if (endTime != null && endTime != '') {
        sql += 'and e_device_alarm_log.alarmTime<=:endTime';
        replacements.endTime = endTime;
    }

    sql += ' order by e_device_alarm_log.alarmTime desc ';

    if (pageNum > 0 && pageSize > 0) {
        sql += ' limit ' + (pageNum - 1) * pageSize + ',' + pageSize;
    }

    return dbConnection.query(sql, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}


module.exports.update = function (data) {
    return e_device_alarm_log.update({
        alarmID: data.alarmID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        alarmType: data.alarmType,
        alarmTypeName: data.alarmTypeName,
        alarmLevel: data.alarmLevel,
        alarmLevelName: data.alarmLevelName,
        alarmCount: data.alarmCount,
        alarmState: data.alarmState,
        isDeal: data.isDeal,
        alarmTime: data.alarmTime
    }, {
        where: {
            alarmID: data.alarmID
        }
    });
}


module.exports.delete = function (alarmID) {
    return e_device_alarm_log.destroy({
        where: {
            alarmID: alarmID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });

}