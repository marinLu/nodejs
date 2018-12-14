const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var e_camera = dbConnection.define('e_camera', {
    cameraID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    deviceID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cameraIP: {
        type: Sequelize.STRING,
        allowNull: true
    },
    cameraPort: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    loginUser: {
        type: Sequelize.STRING,
        allowNull: true
    },
    loginPassword: {
        type: Sequelize.STRING,
        allowNull: true
    },
    streamSource: {
        type: Sequelize.STRING,
        allowNull: false
    },
    installAngle: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    inOutFlag: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    useType: {
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
    tableName: 'e_camera',
    timestamps: false
});
module.exports.e_camera = e_camera

module.exports.insert = function (data) {
    return e_camera.create({
        cameraID: data.cameraID,
        deviceID: data.deviceID,
        cameraIP: data.cameraIP,
        cameraPort: data.cameraPort,
        loginUser: data.loginUser,
        loginPassword: data.loginPassword,
        streamSource: data.streamSource,
        installAngle: data.installAngle,
        inOutFlag: data.inOutFlag,
        useType: data.useType,
    });
}


module.exports.getByCameraID = function (cameraID) {
    return e_camera.find({
        where: {
            cameraID: cameraID
        }
    });
}



module.exports.getByUseType = function (useType) {
    return e_camera.findAll({
        where: {
            useType: useType
        }
    });
}

module.exports.getByDeviceID = function (deviceID) {
    return e_camera.find({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.queryByDeviceID = function (deviceID) {
    return e_camera.findAll({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.getByDeviceIDs = function (deviceIDs) {
    return e_camera.findAll({
        where: {
            deviceID: {
                [Op.in]:deviceIDs
            }
        },
        order:[
            ['updateTime','DESC']
        ]
    });
}

module.exports.getByCameraIDs = function (cameraIDs) {
    return e_camera.findAll({
        where: {
            cameraID: {
                [Op.in]: cameraIDs
            }
        }
    });
}


module.exports.update = function (data) {
    return e_camera.update({
        cameraID: data.cameraID,
        deviceID: data.deviceID,
        cameraIP: data.cameraIP,
        cameraPort: data.cameraPort,
        loginUser: data.loginUser,
        loginPassword: data.loginPassword,
        streamSource: data.streamSource,
        installAngle: data.installAngle,
        inOutFlag: data.inOutFlag,
        useType: data.useType,
    }, {
        where: {
            cameraID: data.cameraID
        }
    });
}


module.exports.delete = function (cameraID) {
    return e_camera.destroy({
        where: {
            cameraID: cameraID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}