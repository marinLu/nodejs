const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');

var e_sense_alarm_flow = dbConnection.define('e_sense_alarm_flow', {
    flowID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    modelID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    flowName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    flowRule: {
        type: Sequelize.STRING,
        allowNull: true
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
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('insertTime'))
        }
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('updateTime'))
        }
    },
}, {
    freezeTableName: true,
    tableName: 'e_sense_alarm_flow',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_sense_alarm_flow.create({
        flowID: data.flowID,
        modelID: data.modelID,
        flowName: data.flowName,
        flowRule: data.flowRule,
        isValid: data.isValid,
        isDelete: data.isDelete,
        editUser: data.editUser,
    });
}


module.exports.getByID = function (flowID) {
    return e_sense_alarm_flow.find({
        where: {
            flowID: flowID
        }
    });
}

module.exports.getAll = function () {
    return e_sense_alarm_flow.findAll({
        where: {
            isDelete: 0
        }
    });
}

module.exports.getByPage = function (pageNum, pageSize) {

    var sql=`
        select * from e_sense_alarm_flow
        where isDelete=0 order by e_sense_alarm_flow.insertTime desc limit :startIndex,:pageSize 
    `;

    var replacements={
        startIndex:(pageNum-1)*pageSize,
        pageSize:pageSize
    }

    return query(sql,replacements);
}

module.exports.update = function (data) {
    return e_sense_alarm_flow.update({
        flowID: data.flowID,
        modelID: data.modelID,
        flowName: data.flowName,
        flowRule: data.flowRule,
        isValid: data.isValid,
        isDelete: data.isDelete,
        editUser: data.editUser,
    }, {
        where: {
            flowID: data.flowID
        }
    });
}


module.exports.delete = function (flowID) {
    return e_sense_alarm_flow.destroy({
        where: {
            flowID: flowID
        }
    });
}



module.exports.count = function () {
    return e_sense_alarm_flow.count({
    // return p_people({
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