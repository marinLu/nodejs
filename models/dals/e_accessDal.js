const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var e_access = dbConnection.define('e_access', {
    accessID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    accessName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    deviceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    mac: {
        type: Sequelize.STRING,
        allowNull: true
    },
    type: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    lockState: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    lockStateTime: {
        type: Sequelize.DATE,
        allowNull: false
    },
    inCameraID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    outCameraID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    faceGatewayMac: {
        type: Sequelize.STRING,
        allowNull: true
    },
    faceGatewayState: {
        type: Sequelize.TINYINT,
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
    tableName: 'e_access',
    timestamps: false
});
module.exports.e_access = e_access

module.exports.insert = function (data) {
    return e_access.create({
        accessID: data.accessID,
        accessName: data.accessName,
        deviceID: data.deviceID,
        mac: data.mac,
        type: data.type,
        lockState: data.lockState,
        lockStateTime: data.lockStateTime,
        inCameraID: data.inCameraID,
        outCameraID: data.outCameraID,
        faceGatewayMac: data.faceGatewayMac,
        faceGatewayState: data.faceGatewayState
    });
}


module.exports.getByID = function (accessID) {
    return e_access.find({
        where: {
            accessID: accessID
        }
    });
}

module.exports.getByDeviceID = function (deviceID) {
    return e_access.find({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.queryByDeviceID = function (deviceID) {
    let queryString = `SELECT (SELECT NAME FROM e_device WHERE deviceID = ec.deviceID LIMIT 1) inCameraName, 
    (SELECT NAME FROM e_device WHERE deviceID = ec1.deviceID LIMIT 1) outCameraName,
    ea.* 
    FROM e_access AS ea
    LEFT JOIN e_camera AS ec
    ON ea.inCameraID = ec.cameraID
    LEFT JOIN e_camera AS ec1
    ON ea.outCameraID = ec1.cameraID
    WHERE ea.deviceID = ?`
    return dbConnection.query(queryString, {
        replacements: [deviceID],
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.getByMac = function (mac) {
    return e_access.find({
        where: {
            [Op.or]: [{
                    mac: mac
                },
                {
                    faceGatewayMac: mac
                }
            ]
        }
    });
}

module.exports.update = function (data) {
    return e_access.update({
        accessID: data.accessID,
        accessName: data.accessName,
        deviceID: data.deviceID,
        mac: data.mac,
        type: data.type,
        lockState: data.lockState,
        lockStateTime: data.lockStateTime,
        inCameraID: data.inCameraID,
        outCameraID: data.outCameraID,
        faceGatewayMac: data.faceGatewayMac,
        faceGatewayState: data.faceGatewayState
    }, {
        where: {
            accessID: data.accessID
        }
    });
}


module.exports.delete = function (accessID) {
    return e_access.destroy({
        where: {
            accessID: accessID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.changeAccessState = function (replacements) {
    let queryString = `UPDATE e_access AS ea
    INNER JOIN  (SELECT CASE lockState WHEN 1 THEN 0 ELSE 1 END AS lockState  FROM e_access WHERE deviceID = ?) tmp
    SET ea.lockState= tmp.lockState
    WHERE ea.deviceID = ?`
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.UPDATE
    });
}
