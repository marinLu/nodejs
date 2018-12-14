const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var p_trace = dbConnection.define('p_trace', {
    traceID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    deviceID: {
        type: Sequelize.STRING,
        allowNull: true
    },
    pID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pIDType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    source: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    locationTime: {
        type: Sequelize.DATE,
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
    tableName: 'p_trace',
    timestamps: false
});


module.exports.insert = function (data) {
    return p_trace.create({
        traceID: data.traceID,
        villageID: data.villageID,
        deviceID: data.deviceID,
        pID: data.pID,
        pIDType: data.pIDType,
        source: data.source,
        longitude: data.longitude,
        latitude: data.latitude,
        locationTime: data.locationTime,
    });
}


module.exports.getByTraceID = function (traceID) {
    return p_trace.find({
        where: {
            traceID: traceID
        }
    });
}


module.exports.update = function (data) {
    return p_trace.update({
        traceID: data.traceID,
        villageID: data.villageID,
        deviceID: data.deviceID,
        pID: data.pID,
        pIDType: data.pIDType,
        source: data.source,
        longitude: data.longitude,
        latitude: data.latitude,
        locationTime: data.locationTime,
    }, {
        where: {
            traceID: data.traceID
        }
    });
}


module.exports.delete = function (traceID) {
    return p_trace.destroy({
        where: {
            traceID: traceID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}