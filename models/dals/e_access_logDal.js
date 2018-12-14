const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');
const Op = dbConnection.Op;

var e_access_log = dbConnection.define('e_access_log', {
    accessLogID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    deviceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    streetID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    buildingID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    houseID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    cardNo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    credentialType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    credentialNo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    openTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('openTime'));
        }
    },
    openType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    memo: {
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
            return cFun.formatDateTime(this.getDataValue('insertTime'));
        }
    },
}, {
    freezeTableName: true,
    tableName: 'e_access_log',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_access_log.create({
        accessLogID: data.accessLogID,
        deviceID: data.deviceID,
        streetID: data.streetID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        houseID: data.houseID,
        cardNo: data.cardNo,
        credentialType: data.credentialType,
        credentialNo: data.credentialNo,
        openTime: data.openTime,
        openType: data.openType,
        memo: data.memo
    });
}

module.exports.insertList = function (datas) {

    var insertList = [];
    for (let i = 0; i < datas.length; i++) {
        let data = datas[i];

        insertList.push({
            accessLogID: data.accessLogID,
            deviceID: data.deviceID,
            streetID: data.streetID,
            villageID: data.villageID,
            buildingID: data.buildingID,
            houseID: data.houseID,
            cardNo: data.cardNo,
            credentialType: data.credentialType,
            credentialNo: data.credentialNo,
            openTime: data.openTime,
            openType: data.openType,
            memo: data.memo
        });
    }


    e_access_log.bulkCreate(insertList);
}

module.exports.getByID = function (accessLogID) {
    return e_access_log.find({
        where: {
            accessLogID: accessLogID
        }
    });
}

module.exports.getByDeviceID = function (deviceID) {
    return e_access_log.findAll({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.getByCredentialTypeNo = function (credentialNo, credentialType) {
    return e_access_log.findAll({
        where: {
            credentialNo: credentialNo,
            credentialType: credentialType
        }
    });
}

module.exports.getAccessLogs = function (deviceID, startTime, endTime, openType,
    pageNum, pageSize) {
    var where = {
        deviceID: deviceID
    };

    if (startTime != null && endTime != null) {
        where.openTime = {
            [Op.between]: [startTime, endTime]
        }
    }

    if (openType != null && openType != '') {

        if (openType == 'resident') {
            where.openType = {
                [Op.ne]: '100401'
            };
        } else if (openType == 'visitor') {
            where.openType = '100401';
        }

    }

    return e_access_log.findAll({
        where: where,
        order: [
            ['openTime', 'DESC']
        ],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize
    });
}

module.exports.getStatic = function (deviceID, startTime, endTime) {
    return e_access_log.count({
        where: {
            deviceID: deviceID,
            openTime: {
                [Op.between]: [startTime, endTime]
            }
        }
    });
}

module.exports.getLatest = function (credentialNo, credentialType) {
    return e_access_log.find({
        where: {
            credentialNo: credentialNo,
            credentialType: credentialType
        },
        order: [
            ['openTime', 'DESC']
        ],
        limit: 1
    });
}

module.exports.getPassCount = function (credentialNo, credentialType) {
    return e_access_log.count({
        where: {
            credentialNo: credentialNo,
            credentialType: credentialType
        }
    });
}

module.exports.getPassAccess = function (credentialNo, credentialType) {
    return e_access_log.findAll({
        where: {
            credentialNo: credentialNo,
            credentialType: credentialType
        },
        group: 'deviceID',
    });
}

module.exports.update = function (data) {
    return e_access_log.update({
        accessLogID: data.accessLogID,
        deviceID: data.deviceID,
        streetID: data.streetID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        houseID: data.houseID,
        cardNo: data.cardNo,
        credentialType: data.credentialType,
        credentialNo: data.credentialNo,
        openTime: data.openTime,
        openType: data.openType,
        memo: data.memo
    }, {
        where: {
            accessLogID: data.accessLogID
        }
    });
}


module.exports.delete = function (accessLogID) {
    return e_access_log.destroy({
        where: {
            accessLogID: accessLogID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}