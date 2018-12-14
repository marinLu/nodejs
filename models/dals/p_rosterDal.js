const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');


var p_roster = dbConnection.define('p_roster', {
    rosterID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    workerID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    workWeek: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    workStartTime: {
        type: Sequelize.TIME,
        allowNull: true
    },
    workEndTime: {
        type: Sequelize.TIME,
        allowNull: true
    },
    rosterStartTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('rosterStartTime'));
        }
    },
    rosterEndTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('rosterEndTime'));
        }
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true ,
        get() {
            return cFun.formatDateTime(this.getDataValue('insertTime'));
        }
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('updateTime'));
        }
    },
}, {
    freezeTableName: true,
    tableName: 'p_roster',
    timestamps: false
});


module.exports.insert = function (data) {
    return p_roster.create({
        rosterID: data.rosterID,
        villageID: data.villageID,
        workerID: data.workerID,
        workWeek: data.workWeek,
        workStartTime: data.workStartTime,
        workEndTime: data.workEndTime,
        rosterStartTime: data.rosterStartTime,
        rosterEndTime: data.rosterEndTime,
    });
}


module.exports.getByRosterID = function (rosterID) {
    return p_roster.find({
        where: {
            rosterID: rosterID
        }
    });
}


/**
 * 获取当前小区排班表
 * @param {*} villageID 
 */
module.exports.getRoster = function (villageID) {

    var sql = `
    select * from p_roster
    inner join p_worker on p_roster.workerID=p_worker.workerID
    where rosterStartTime<NOW() and rosterEndTime>NOW()
    and workWeek=date_format(NOW(),'%w')
    and p_roster.villageID=:villageID
    `;

    return query(sql, {
        villageID: villageID
    });
}


module.exports.update = function (data) {
    return p_roster.update({
        rosterID: data.rosterID,
        villageID: data.villageID,
        workerID: data.workerID,
        workWeek: data.workWeek,
        workStartTime: data.workStartTime,
        workEndTime: data.workEndTime,
        rosterStartTime: data.rosterStartTime,
        rosterEndTime: data.rosterEndTime,
    }, {
        where: {
            rosterID: data.rosterID
        }
    });
}


module.exports.delete = function (rosterID) {
    return p_roster.destroy({
        where: {
            rosterID: rosterID
        }
    });
}
module.exports.byWorkerIDdelete = function (workerID) {
    return p_roster.destroy({
        where: {
            workerID: workerID
        }
    });
}
module.exports.getRosterByWorkerID = function (workerID) {
    return p_roster.findAll({
        where: {
            workerID: workerID
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