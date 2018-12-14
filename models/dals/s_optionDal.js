const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');


var s_option = dbConnection.define('s_option', {
    optionID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    key: {
        type: Sequelize.STRING,
        allowNull: true
    },
    value: {
        type: Sequelize.STRING,
        allowNull: true
    },
    userID: {
        type: Sequelize.STRING,
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
    tableName: 's_option',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_option.create({
        optionID: data.optionID,
        key: data.key,
        value: data.value,
        userID: data.userID,
    });
}


module.exports.getByID = function (optionID) {
    return s_option.find({
        where: {
            optionID: optionID
        }
    });
}

module.exports.getByKeyUserID = function (key, userID) {
    return s_option.find({
        where: {
            key: key,
            userID: userID
        }
    });
}

module.exports.getByKey = function (key) {
    return s_option.findAll({
        where: {
            key: key
        }
    });
}

module.exports.update = function (data) {
    return s_option.update({
        optionID: data.optionID,
        key: data.key,
        value: data.value,
        userID: data.userID,
    }, {
        where: {
            optionID: data.optionID
        }
    });
}


module.exports.delete = function (optionID) {
    return s_option.destroy({
        where: {
            optionID: optionID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}