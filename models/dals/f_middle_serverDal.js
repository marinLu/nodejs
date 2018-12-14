const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var f_middle_server = dbConnection.define('f_middle_server', {
    middleServerID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    ip: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    port: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    name: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    serverType: {
        type: Sequelize.TINYINT,
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
    tableName: 'f_middle_server',
    timestamps: false
});


module.exports.insert = function (data) {
    return f_middle_server.create({
        middleServerID: data.middleServerID,
        ip: data.ip,
        port: data.port,
        name: data.name,
        serverType: data.serverType,
    });
}


module.exports.getByID = function (middleServerID) {
    return f_middle_server.find({
        where: {
            middleServerID: middleServerID
        }
    });
}

module.exports.getByVillageID = function (villageID) {
    return f_middle_server.findAll({
        where: {
            villageID: villageID
        },
        order:[
            ['updateTime','DESC']
        ]
    });
}

module.exports.getByIP = function (ip) {
    return f_middle_server.findAll({
        where: {
            ip: ip
        },
        order:[
            ['updateTime','DESC']
        ]
    });
}

module.exports.update = function (data) {
    return f_middle_server.update({
        ip: data.ip,
        port: data.port,
        name: data.name,
        serverType: data.serverType,
    }, {
        where: {
            middleServerID: data.middleServerID
        }
    });
}


module.exports.delete = function (middleServerID) {
    return f_middle_server.destroy({
        where: {
            middleServerID: middleServerID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}