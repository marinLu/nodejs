const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_sense_alarm_push_log = dbConnection.define('e_sense_alarm_push_log', {
    alarmPushID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    alarmID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    userID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    pushType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    messageID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    pushTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    pushMessage: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT,
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
    tableName: 'e_sense_alarm_push_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_sense_alarm_push_log.create({
        alarmPushID: data.alarmPushID,
        alarmID: data.alarmID,
        userID: data.userID,
        pushTime: data.pushTime,
        pushMessage: data.pushMessage,
        status: data.status,
        pushType: data.pushType,
        messageID: data.messageID
    });
}

module.exports.getCompensateInfos = function () {

    var sql = `
    select * from e_sense_alarm_push_log
    where status=-1 and updateTime> DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `

    return query(sql);
}


module.exports.getByAlarmPushID = function (alarmPushID) {
    return e_sense_alarm_push_log.find({
        where: {
            alarmPushID: alarmPushID
        }
    });
}


module.exports.update = function (data) {
    return e_sense_alarm_push_log.update({
        alarmPushID: data.alarmPushID,
        alarmID: data.alarmID,
        userID: data.userID,
        pushTime: data.pushTime,
        pushMessage: data.pushMessage,
        status: data.status,
        pushType: data.pushType,
        messageID: data.messageID
    }, {
        where: {
            alarmPushID: data.alarmPushID
        }
    });
}


module.exports.delete = function (alarmPushID) {
    return e_sense_alarm_push_log.destroy({
        where: {
            alarmPushID: alarmPushID
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