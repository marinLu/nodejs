const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun=require('../utils/commonFunc');

var e_device_ops_log = dbConnection.define('e_device_ops_log', {
    opsID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    deviceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    deviceType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    deviceState: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    isOnline: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    opsType: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    opsTypeName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    opsCount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    alarmTime:{
        type: Sequelize.DATE,
        allowNull: true,
        get(){
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
    tableName: 'e_device_ops_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_device_ops_log.create({
        opsID: data.opsID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        deviceState: data.deviceState,
        isOnline: data.isOnline,
        opsType: data.opsType,
        opsTypeName: data.opsTypeName,
        opsCount: data.opsCount,
        alarmTime: data.alarmTime
    });
}


module.exports.getByOpsID = function (opsID) {
    return e_device_ops_log.find({
        where: {
            opsID: opsID
        }
    });
}

module.exports.getByDeviceID = function (deviceID) {
    return e_device_ops_log.findAll({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.update = function (data) {
    return e_device_ops_log.update({
        opsID: data.opsID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        deviceState: data.deviceState,
        isOnline: data.isOnline,
        opsType: data.opsType,
        opsTypeName: data.opsTypeName,
        opsCount: data.opsCount,
    }, {
        where: {
            opsID: data.opsID
        }
    });
}


module.exports.delete = function (opsID) {
    return e_device_ops_log.destroy({
        where: {
            opsID: opsID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}