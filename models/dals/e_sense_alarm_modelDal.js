const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var e_sense_alarm_model = dbConnection.define('e_sense_alarm_model', {
    modelID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    modelName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    
    modelCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    modelType: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    modelRule: {
        type: Sequelize.STRING,
        allowNull: true
    },
    modelComments: {
        type: Sequelize.STRING,
        allowNull: true
    },
    groupName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    sceneID: {
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
    tableName: 'e_sense_alarm_model',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_sense_alarm_model.create({
        modelID: data.modelID,
        modelName: data.modelName,
        modelCode: data.modelCode,
        modelType: data.modelType,
        modelRule: data.modelRule,
        modelComments: data.modelComments,
        sceneID: data.sceneID,
        isValid: data.isValid,
        isDelete: data.isDelete,
        editUser: data.editUser,
    });
}


module.exports.getByModelID = function (modelID) {
    return e_sense_alarm_model.find({
        where: {
            modelID: modelID
        }
    });
}

module.exports.getAll = function () {
    return e_sense_alarm_model.findAll({
        where: {
            isDelete: 0
        }
    });
}

module.exports.getByModelIDs = function (modelIDs) {
    return e_sense_alarm_model.findAll({
        where: {
            modelID: {
                [Op.in]: modelIDs
            }
        }
    });
}

module.exports.getByModelType = function (modelType) {
    return e_sense_alarm_model.findAll({
        where: {
            modelType: modelType
        }
    });
}

module.exports.update = function (data) {
    return e_sense_alarm_model.update({
        modelID: data.modelID,
        modelName: data.modelName,
        modelCode: data.modelCode,
        modelType: data.modelType,
        modelRule: data.modelRule,
        modelComments: data.modelComments,
        sceneID: data.sceneID,
        isValid: data.isValid,
        isDelete: data.isDelete,
        editUser: data.editUser,
    }, {
        where: {
            modelID: data.modelID
        }
    });
}


module.exports.delete = function (modelID) {
    return e_sense_alarm_model.destroy({
        where: {
            modelID: modelID
        }
    });
}

module.exports.getUserAllScene = function () {
    let sqlString = `
        select B.sceneName,A.groupName,A.modelName,A.modelID
        from e_sense_alarm_model as A
        left join e_sense_alarm_scene as B on A.sceneID = B.sceneID;
    `;
    return query(sqlString);
}

module.exports.getByFunctionID = function (functionID) {
    var where = {};

    var sql = `
    select e_sense_alarm_model.* from e_sense_alarm_model
    inner join e_sense_alarm_scene on e_sense_alarm_model.sceneID=e_sense_alarm_scene.sceneID
    where e_sense_alarm_model.isDelete=0
    `;

    if (functionID != null && functionID != '') {
        sql += ' and  e_sense_alarm_scene.functionID=:functionID '
        where.functionID = functionID;
    }

    sql=sql+' order by e_sense_alarm_model.updateTime desc '

    return query(sql, where);
}

module.exports.getAllPage= function (pageNum, pageSize) {
    var sql = ``;
    var replacements = {};
    sql = `
    SELECT e_sense_alarm_model.*, e_sense_alarm_scene.sceneName  FROM e_sense_alarm_model 
	LEFT JOIN e_sense_alarm_scene on e_sense_alarm_model.sceneID=e_sense_alarm_scene.sceneID
    where e_sense_alarm_model.isDelete=0
        order by e_sense_alarm_model.insertTime desc  limit :startIndex,:pageSize 
    `;
    replacements = {
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
      
    }
    return query(sql, replacements);
}
module.exports.getAllPageCount= function () {
    return e_sense_alarm_model.count({
        where: {
            isDelete: 0
        }
    });
}
module.exports.getSensealarmmodelIsvalidList= function () {
    return e_sense_alarm_model.findAll({
        where: {
            isDelete: 0
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