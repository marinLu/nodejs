const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_door_status = dbConnection.define('e_door_status', {
    doorStatusID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    deviceMAC: {
        type: Sequelize.CHAR,
        allowNull: false
    },

    timeStamp: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    state: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    }, {
        freezeTableName: true,
        tableName: 'e_door_status',
        timestamps: false
    });


module.exports.insert = function (data) {
    return e_door_status.create({
        doorStatusID: data.doorStatusID,
        deviceMAC: data.deviceMAC,
        timeStamp: data.timeStamp,
        state: data.state
    });
}





