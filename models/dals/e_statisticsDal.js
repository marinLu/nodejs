const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const cFun = require('../utils/commonFunc');

var e_statistics = dbConnection.define('e_statistics', {
    statisticID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    path: {
        type: Sequelize.STRING,
        allowNull: true
    },
    name: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    data: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    villageID: {
        type: Sequelize.STRING,
        allowNull: true
    },
    timeInterval: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true,
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
    tableName: 'e_statistics',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_statistics.create({
        statisticID: data.statisticID,
        path: data.path,
        name: data.name,
        data: data.data,
        villageID: data.villageID,
        timeInterval: data.timeInterval,
    });
}


module.exports.getByID = function (statisticID) {
    return e_statistics.find({
        where: {
            statisticID: statisticID
        }
    });
}


module.exports.getByPathsVillageIDs = function (paths, villageIDs) {
    return e_statistics.findAll({
        where: {
            path: {
                [Op.in]: paths
            },
            villageID: {
                [Op.in]: villageIDs
            }
        },
        order: [
            ['insertTime', 'DESC']
        ]
    });
}

module.exports.getByPathVillageID = function (path, villageID) {
    return e_statistics.find({
        where: {
            path:path,
            villageID:villageID
        },
        order: [
            ['insertTime', 'DESC']
        ],
        limit:1
    });
}

module.exports.update = function (data) {
    return e_statistics.update({
        statisticID: data.statisticID,
        path: data.path,
        name: data.name,
        data: data.data,
        villageID: data.villageID,
        timeInterval: data.timeInterval,
    }, {
        where: {
            statisticID: data.statisticID
        }
    });
}


module.exports.delete = function (statisticID) {
    return e_statistics.destroy({
        where: {
            statisticID: statisticID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}