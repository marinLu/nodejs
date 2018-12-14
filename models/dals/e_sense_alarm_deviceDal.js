const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_sense_alarm_device = dbConnection.define('e_sense_alarm_device', {
    relID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    sceneID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    deviceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    relDeviceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    editUser: {
        type: Sequelize.CHAR,
        allowNull: false
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
    tableName: 'e_sense_alarm_device',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_sense_alarm_device.create({
        relID: data.relID,
        sceneID: data.sceneID,
        deviceID: data.deviceID,
        relDeviceID: data.relDeviceID,
        editUser: data.editUser,
    });
}


module.exports.getByRelID = function (relID) {
    return e_sense_alarm_device.find({
        where: {
            relID: relID
        }
    });
}

module.exports.getByDeviceScence = function (deviceID,sceneID) {
    var where = {       
        deviceID: deviceID
    };

    if (sceneID!=null) {
        where.sceneID=sceneID;
    }

    return e_sense_alarm_device.findAll({
        where:where
    });
}

module.exports.update = function (data) {
    return e_sense_alarm_device.update({
        relID: data.relID,
        sceneID: data.sceneID,
        deviceID: data.deviceID,
        relDeviceID: data.relDeviceID,
        editUser: data.editUser,
    }, {
        where: {
            relID: data.relID
        }
    });
}


module.exports.delete = function (relID) {
    return e_sense_alarm_device.destroy({
        where: {
            relID: relID
        }
    });
}