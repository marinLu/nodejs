const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var s_log = dbConnection.define('s_log', {
    logID: {
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    logType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    operationType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    logContent: {
        type: Sequelize.STRING,
        allowNull: true
    },
    systemCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    moduleCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    functionCode: {
        type: Sequelize.STRING,
        allowNull: false
    },
    logIP: {
        type: Sequelize.STRING,
        allowNull: true
    },
    userID: {
        type: Sequelize.CHAR,
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
    tableName: 's_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_log.create({
        logID: data.logID,
        logType: data.logType,
        operationType: data.operationType,
        logContent: data.logContent,
        systemCode: data.systemCode,
        moduleCode: data.moduleCode,
        functionCode: data.functionCode,
        logIP: data.logIP,
        userID: data.userID,
    });
}

module.exports.insertList = function (datas) {

    var insertData = [];
    for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        insertData.push({
            logID: data.logID,
            logType: data.logType,
            operationType: data.operationType,
            logContent: data.logContent,
            systemCode: data.systemCode,
            moduleCode: data.moduleCode,
            functionCode: data.functionCode,
            logIP: data.logIP,
            userID: data.userID,
        });
    }


    return s_log.bulkCreate(insertData);
}

module.exports.getByID = function (logID) {
    return s_log.find({
        where: {
            logID: logID
        }
    });
}


module.exports.update = function (data) {
    return s_log.update({
        logID: data.logID,
        logType: data.logType,
        operationType: data.operationType,
        logContent: data.logContent,
        systemCode: data.systemCode,
        moduleCode: data.moduleCode,
        functionCode: data.functionCode,
        logIP: data.logIP,
        userID: data.userID,
    }, {
        where: {
            logID: data.logID
        }
    });
}


module.exports.delete = function (logID) {
    return s_log.destroy({
        where: {
            logID: logID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}