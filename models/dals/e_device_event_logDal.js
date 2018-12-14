const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_device_event_log = dbConnection.define('e_device_event_log', {
    eventID: {
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
    eventType: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    eventTime: {
        type: Sequelize.DATE,
        allowNull: true
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
    tableName: 'e_device_event_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_device_event_log.create({
        eventID: data.eventID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        eventType: data.eventType,
        eventTime: data.eventTime,
    });
}


module.exports.getByEventID = function (eventID) {
    return e_device_event_log.find({
        where: {
            eventID: eventID
        }
    });
}


module.exports.update = function (data) {
    return e_device_event_log.update({
        eventID: data.eventID,
        deviceID: data.deviceID,
        deviceType: data.deviceType,
        eventType: data.eventType,
        eventTime: data.eventTime,
    }, {
        where: {
            eventID: data.eventID
        }
    });
}


module.exports.delete = function (eventID) {
    return e_device_event_log.destroy({
        where: {
            eventID: eventID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}