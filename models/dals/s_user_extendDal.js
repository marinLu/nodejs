const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const cFun = require('../utils/commonFunc');

var s_user_extend = dbConnection.define('s_user_extend', {
    userID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    pushRegistID: {
        type: Sequelize.STRING,
        allowNull: true
    },
    pushTags: {
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
    tableName: 's_user_extend',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_user_extend.create({
        userID: data.userID,
        longitude: data.longitude,
        latitude: data.latitude,
        pushRegistID: data.pushRegistID,
        pushTags: data.pushTags,
    });
}


module.exports.getByUserID = function (userID) {
    return s_user_extend.find({
        where: {
            userID: userID
        }
    });
}

module.exports.getByUserIDs = function (userIDs) {
    return s_user_extend.findAll({
        where: {
            userID: {
                [Op.in]: userIDs
            }
        }
    });
}

module.exports.getByPushRegistID = function (pushRegistID) {
    return s_user_extend.find({
        where: {
            pushRegistID: pushRegistID
        }
    });
}

module.exports.update = function (data) {
    return s_user_extend.update({
        userID: data.userID,
        longitude: data.longitude,
        latitude: data.latitude,
        pushRegistID: data.pushRegistID,
        pushTags: data.pushTags,
    }, {
        where: {
            userID: data.userID
        }
    });
}

module.exports.updateLocationRegistID = function (longitude, latitude, pushRegistID, userID) {
    let sql = `
        update s_user_extend set longitude=:longitude,latitude=:latitude,pushRegistID=:pushRegistID,updateTime=:updateTime
         where userID=:userID
    `

    var replacements = {
        longitude: longitude,
        latitude: latitude,
        pushRegistID: pushRegistID,
        userID: userID,
        updateTime: cFun.formatDateTime()
    }

    return dbConnection.query(sql, {
        replacements: replacements,
        type: Sequelize.QueryTypes.UPDATE
    });
}


module.exports.delete = function (userID) {
    return s_user_extend.destroy({
        where: {
            userID: userID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}