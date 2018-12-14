const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var e_sense_alarm_option = dbConnection.define('e_sense_alarm_option', {
    optionID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    modelID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    flowID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    alarmName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    alarmLevel: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    isValid: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isDelete: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    startTime: {
        type: Sequelize.DATE,
        allowNull: false
    },
    endTime: {
        type: Sequelize.DATE,
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
    tableName: 'e_sense_alarm_option',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_sense_alarm_option.create({
        optionID: data.optionID,
        villageID: data.villageID,
        modelID: data.modelID,
        flowID: data.flowID,
        alarmName: data.alarmName,
        alarmLevel: data.alarmLevel,
        isValid: data.isValid,
        isDelete: data.isDelete,
        startTime: data.startTime,
        endTime: data.endTime,
        editUser: data.editUser,
    });
}


module.exports.getByOptionID = function (optionID) {
    return e_sense_alarm_option.find({
        where: {
            optionID: optionID
        }
    });
}

module.exports.getByModelIDs = function (modelIDs) {
    return e_sense_alarm_option.findAll({
        where: {
            modelID: {
                [Op.in]: modelIDs
            }
        }
    });
}

module.exports.getByModelID = function (modelID) {
    return e_sense_alarm_option.findAll({
        where: {
            modelID: modelID
        }
    });
}

module.exports.getByModelVillageID = function (modelID, villageID) {
    return e_sense_alarm_option.findAll({
        where: {
            modelID: modelID,
            villageID: villageID,
            isValid: 0,
            isDelete: 0
        }
    });
}

module.exports.getByFlowID = function (flowID) {
    return e_sense_alarm_option.findAll({
        where: {
            flowID: flowID
        }
    });
}

module.exports.getByFlowIDs = function (flowIDs) {
    return e_sense_alarm_option.findAll({
        where: {
            flowID: {
                [Op.in]: flowIDs
            }
        }
    });
}

module.exports.update = function (data) {
    return e_sense_alarm_option.update({
        optionID: data.optionID,
        villageID: data.villageID,
        modelID: data.modelID,
        flowID: data.flowID,
        alarmName: data.alarmName,
        alarmLevel: data.alarmLevel,
        isValid: data.isValid,
        isDelete: data.isDelete,
        startTime: data.startTime,
        endTime: data.endTime,
        editUser: data.editUser,
    }, {
        where: {
            optionID: data.optionID
        }
    });
}


module.exports.delete = function (optionID) {
    return e_sense_alarm_option.destroy({
        where: {
            optionID: optionID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.querydel = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.DELETE
    });
}