const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');
const Op = dbConnection.Op;

var e_face_log = dbConnection.define('e_face_log', {
    faceLogID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    faceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    faceSource: {
        type: Sequelize.SMALLINT,
        allowNull: true
    },
    credentialNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    credentialType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    faceCapture: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    personType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    faceSimilarity: {
        type: Sequelize.DOUBLE,
        allowNull: true
    },
    snapUUid: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    faceCaptureTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('faceCaptureTime'));
        }
    },
    ageRange: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    glass: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    sex: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    faceRect: {
        type: Sequelize.STRING,
        allowNull: true
    },
    faceUrl: {
        type: Sequelize.STRING,
        allowNull: true
    },
    bkgUrl: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isRegistered: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    mageLock: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    imageRemoved: {
        type: Sequelize.TINYINT,
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
    tableName: 'e_face_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_face_log.create({
        faceLogID: data.faceLogID,
        faceID: data.faceID,
        faceSource: data.faceSource,
        credentialNo: data.credentialNo,
        credentialType: data.credentialType,
        faceCapture: data.faceCapture,
        snapUUid: data.snapUUid,
        faceCaptureTime: data.faceCaptureTime,
        ageRange: data.ageRange,
        glass: data.glass,
        sex: data.sex,
        faceRect: data.faceRect,
        faceUrl: data.faceUrl,
        bkgUrl: data.bkgUrl,
        isRegistered: data.isRegistered,
        mageLock: data.mageLock,
        imageRemoved: data.imageRemoved,
        personType: data.personType,
        faceSimilarity: data.faceSimilarity
    });
}


module.exports.getByID = function (faceLogID) {
    return e_face_log.find({
        where: {
            faceLogID: faceLogID
        }
    });
}

module.exports.getByFaceID = function (faceID) {
    return e_face_log.findAll({
        where: {
            faceID: faceID
        },
        limit: 30,
        order: [
            ['faceCaptureTime', 'DESC']
        ]
    });
}

module.exports.getByFaceIDs = function (faceIDs) {
    return e_face_log.findAll({
        where: {
            faceID: {
                [Op.in]: faceIDs
            }
        },
        limit: 10,
        order: [
            ['faceCaptureTime', 'DESC']
        ]
    });
}

module.exports.update = function (data) {
    return e_face_log.update({
        faceLogID: data.faceLogID,
        faceID: data.faceID,
        faceSource: data.faceSource,
        credentialNo: data.credentialNo,
        credentialType: data.credentialType,
        faceCapture: data.faceCapture,
        snapUUid: data.snapUUid,
        faceCaptureTime: data.faceCaptureTime,
        ageRange: data.ageRange,
        glass: data.glass,
        sex: data.sex,
        faceRect: data.faceRect,
        faceUrl: data.faceUrl,
        bkgUrl: data.bkgUrl,
        isRegistered: data.isRegistered,
        mageLock: data.mageLock,
        imageRemoved: data.imageRemoved,
        personType: data.personType,
        faceSimilarity: data.faceSimilarity
    }, {
        where: {
            faceLogID: data.faceLogID
        }
    });
}


module.exports.delete = function (ID) {
    return e_face_log.destroy({
        where: {
            faceLogID: faceLogID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}