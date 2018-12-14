const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var f_face_gateway = dbConnection.define('f_face_gateway', {
    faceGWID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    middleServerID: {
        type: Sequelize.CHAR,
        allowNull: false,
    },
    buildingID : {
        type : Sequelize.CHAR,
        allowNull : false
    },
    ip: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    port: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    mac: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    name: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    status: {
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
        tableName: 'f_face_gateway',
        timestamps: false
    });


module.exports.insert = function (data) {
    return f_face_gateway.create({
        middleServerID: data.middleServerID,
        buildingID : data.buildingID,
        faceGWID: data.faceGWID,
        faceDBID: data.faceDBID,
        ip: data.ip,
        port: data.port,
        mac: data.mac,
        name: data.name,
        villageID: data.villageID,
        status: data.status,
    });
}


module.exports.getByMiddleServerID = function (middleServerID) {
    return f_face_gateway.find({
        where: {
            middleServerID: middleServerID
        }
    });
}

module.exports.getByBuildingID = function(buildingID){
    return f_face_gateway.find({
        where :{
            buildingID : buildingID
        }
    })
}

module.exports.getByFaceGWID = function (faceGWID) {
    return f_face_gateway.find({
        where: {
            faceGWID: faceGWID
        },
        order: [
            ['updateTime', 'DESC']
        ]
    });
}

module.exports.getByIP = function (ip) {
    return f_face_gateway.findAll({
        where: {
            ip: ip
        },
        order: [
            ['updateTime', 'DESC']
        ]
    });
}

module.exports.update = function (data) {
    return f_face_gateway.update({
        middleServerID: data.middleServerID,
        faceDBID: data.faceDBID,
        buildingID : data.buildingID,
        ip: data.ip,
        port: data.port,
        mac: data.mac,
        name: data.name,
        villageID: data.villageID,
        status: data.status,
    }, {
            where: {
                faceGWID: data.faceGWID
            }
        }
    );
}


module.exports.delete = function (faceGWID) {
    return f_face_gateway.destroy({
        where: {
            faceGWID: faceGWID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}