const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_sense_alarm_scene = dbConnection.define('e_sense_alarm_scene', {
    sceneID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    sceneName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sceneCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    functionID: {
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
    tableName: 'e_sense_alarm_scene',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_sense_alarm_scene.create({
        sceneID: data.sceneID,
        sceneName: data.sceneName,
        sceneCode: data.sceneCode,
        functionID: data.functionID,
        isValid: data.isValid,
        isDelete: data.isDelete,
        editUser: data.editUser,
    });
}


module.exports.getByID = function (sceneID) {
    return e_sense_alarm_scene.find({
        where: {
            sceneID: sceneID
        }
    });
}
module.exports.getSceneAll = function (sceneID) {
    return e_sense_alarm_scene.findAll({
        where: {
            isDelete: 0
        }
    });
}



module.exports.update = function (data) {
    return e_sense_alarm_scene.update({
        sceneID: data.sceneID,
        sceneName: data.sceneName,
        sceneCode: data.sceneCode,
        functionID: data.functionID,
        isValid: data.isValid,
        isDelete: data.isDelete,
        editUser: data.editUser,
    }, {
        where: {
            sceneID: data.sceneID
        }
    });
}


module.exports.delete = function (sceneID) {
    return e_sense_alarm_scene.destroy({
        where: {
            sceneID: sceneID
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