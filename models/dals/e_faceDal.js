const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var e_face = dbConnection.define('e_face', {
    faceID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    ioID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    deviceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    channelNo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    in_outType: {
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
    tableName: 'e_face',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_face.create({
        faceID: data.faceID,
        villageID: data.villageID,
        ioID: data.ioID,
        deviceID: data.deviceID,
        channelNo: data.channelNo,
        in_outType: data.in_outType,
    });
}


module.exports.getByID = function (faceID) {
    return e_face.find({
        where: {
            faceID: faceID
        }
    });
}



module.exports.getByDeviceID = function (deviceID) {
    return e_face.find({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.getByDeviceIDs = function (deviceIDs) {
    return e_face.findAll({
        where: {
            deviceID: {
                [Op.in]: deviceIDs
            }
        }
    });
}

module.exports.getByIoID = function (ioID) {
    return e_face.findAll({
        where: {
            ioID: ioID
        },
        order:[
            ['updateTime','DESC']
        ]
    });
}

module.exports.update = function (data) {
    return e_face.update({
        faceID: data.faceID,
        villageID: data.villageID,
        ioID: data.ioID,
        deviceID: data.deviceID,
        channelNo: data.channelNo,
        in_outType: data.in_outType,
    }, {
        where: {
            faceID: data.faceID
        }
    });
}


module.exports.delete = function (faceID) {
    return e_face.destroy({
        where: {
            faceID: faceID
        }
    });
}
module.exports.count = function (villageIDs) {
    return e_face.count({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageIDs) {
    var sql = `
    select e_face.*,b_in_out.name as inoutName,e_device.name as deviceName from e_face
    LEFT JOIN b_in_out on e_face.ioID=b_in_out.ioID
    LEFT JOIN e_device on e_face.deviceID =e_device.deviceID
       where e_face.villageID in (:villageIDs) order by insertTime desc limit :startIndex,:pageSize 
    `;
    var replacements = {
        villageIDs: villageIDs,
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
    }
    return query(sql, replacements);
}

var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
