const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var f_face_topic = dbConnection.define('f_face_topic', {
    faceTopicID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    userID: {
        type: Sequelize.CHAR,
        allowNull: false,
    },
    loginName: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    topicName: {
        type: Sequelize.CHAR,
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
        tableName: 'f_face_topic',
        timestamps: false
    });


module.exports.insert = function (data) {
    return f_face_topic.create({
        faceTopicID: data.faceTopicID,
        userID: data.userID,
        loginName: data.loginName,
        topicName: data.topicName
    });
}


module.exports.getByFaceTopicID = function (faceTopicID) {
    return f_face_topic.find({
        where: {
            faceTopicID: faceTopicID
        }
    });
}

module.exports.getByloginName = function (loginName) {
    return f_face_topic.findAll({
        where: {
            loginName: loginName
        },
        order: [
            ['updateTime', 'DESC']
        ]
    });
}


module.exports.update = function (data) {
    return f_face_topic.update({
        userID: data.userID,
        loginName: data.loginName,
        topicName: data.topicName
    }, {
            where: {
                faceTopicID: data.faceTopicID,
            }
        }
    );
}


module.exports.delete = function (faceGWID) {
    return f_face_topic.destroy({
        where: {
            faceTopicID: faceTopicID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}