const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var s_userToken = dbConnection.define('s_usertoken', {
    userTokenID: {
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    userID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    authToken: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    loginSystemType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    loginType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    lastLoginIP: {
        type: Sequelize.STRING,
        allowNull: true
    },
    lastLoginTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    activeTime: {
        type: Sequelize.STRING,
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
    tableName: 's_usertoken',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_userToken.create({
        userTokenID: data.userTokenID,
        userID: data.userID,
        authToken: data.authToken,
        loginSystemType: data.loginSystemType,
        loginType: data.loginType,
        lastLoginIP: data.lastLoginIP,
        lastLoginTime: data.lastLoginTime,
        activeTime: data.activeTime,
    });
}


module.exports.getByID = function (userTokenID) {
    return s_userToken.find({
        where: {
            userTokenID: userTokenID
        }
    });
}

module.exports.getByUserIDType = function (userID, loginSystemType, loginType) {
    return s_userToken.find({
        where: {
            userID: userID,
            loginSystemType: loginSystemType,
            loginType: loginType
        }
    });
}


module.exports.update = function (data) {
    return s_userToken.update({
        userTokenID: data.userTokenID,
        userID: data.userID,
        authToken: data.authToken,
        loginSystemType: data.loginSystemType,
        loginType: data.loginType,
        lastLoginIP: data.lastLoginIP,
        lastLoginTime: data.lastLoginTime,
        activeTime: data.activeTime,
    }, {
        where: {
            userTokenID: data.userTokenID
        }
    });
}


module.exports.delete = function (userTokenID) {
    return s_userToken.destroy({
        where: {
            userTokenID: userTokenID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}