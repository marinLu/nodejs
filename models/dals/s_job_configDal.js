const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var s_job_config = dbConnection.define('s_job_config', {
    jobID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prority: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    jobGroup: {
        type: Sequelize.STRING,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    path: {
        type: Sequelize.STRING,
        allowNull: true
    },
    rule: {
        type: Sequelize.STRING,
        allowNull: true
    },
    remark: {
        type: Sequelize.STRING,
        allowNull: true
    },
    param: {
        type: Sequelize.STRING,
        allowNull: true
    },
    lastEndTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    isValid: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    owner: {
        type: Sequelize.STRING,
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
    tableName: 's_job_config',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_job_config.create({
        jobID: data.jobID,
        name: data.name,
        prority: data.prority,
        jobGroup: data.group,
        status: data.status,
        path: data.path,
        rule: data.rule,
        remark: data.remark,
        param: data.param,
        lastEndTime: data.lastEndTime,
        owner: data.owner,
        isValid:data.isValid
    });
}


module.exports.getByID = function (jobID) {
    return s_job_config.find({
        where: {
            jobID: jobID
        }
    });
}

module.exports.getByGroup = function (jobGroup) {
    return s_job_config.findAll({
        where: {
            jobGroup: jobGroup,
            isValid:1
        }
    });
}

module.exports.update = function (data) {
    return s_job_config.update({
        jobID: data.jobID,
        name: data.name,
        prority: data.prority,
        jobGroup: data.jobGroup,
        status: data.status,
        path: data.path,
        rule: data.rule,
        remark: data.remark,
        param: data.param,
        lastEndTime: data.lastEndTime,
        owner: data.owner,
        isValid:data.isValid
    }, {
        where: {
            jobID: data.jobID
        }
    });
}


module.exports.delete = function (jobID) {
    return s_job_config.destroy({
        where: {
            jobID: jobID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}