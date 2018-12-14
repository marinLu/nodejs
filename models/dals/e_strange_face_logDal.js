const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var e_strange_face_log = dbConnection.define('e_strange_face_log', {
    strangerId: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    faceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    snapUUid: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    curFaceLogID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    curCaptureTime: {
        type: Sequelize.DATE,
        allowNull: false
    },
    ageRange: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    glass: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    sex: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    mageLock: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    imageRemoved: {
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
    tableName: 'e_strange_face_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_strange_face_log.create({
        strangerId: data.strangerId,
        faceID: data.faceID,
        snapUUid: data.snapUUid,
        curFaceLogID: data.curFaceLogID,
        curCaptureTime: data.curCaptureTime,
        ageRange: data.ageRange,
        glass: data.glass,
        sex: data.sex,
        mageLock: data.mageLock,
        imageRemoved: data.imageRemoved,
    });
}


module.exports.getByID = function (strangerId) {
    return e_strange_face_log.find({
        where: {
            strangerId: strangerId
        }
    });
}


module.exports.update = function (data) {
    return e_strange_face_log.update({
        strangerId: data.strangerId,
        faceID: data.faceID,
        snapUUid: data.snapUUid,
        curFaceLogID: data.curFaceLogID,
        curCaptureTime: data.curCaptureTime,
        ageRange: data.ageRange,
        glass: data.glass,
        sex: data.sex,
        mageLock: data.mageLock,
        imageRemoved: data.imageRemoved,
    }, {
        where: {
            strangerId: data.strangerId
        }
    });
}


module.exports.delete = function (strangerId) {
    return e_strange_face_log.destroy({
        where: {
            strangerId: strangerId
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}