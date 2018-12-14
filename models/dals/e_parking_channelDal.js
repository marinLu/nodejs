const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;


var e_parking_channel = dbConnection.define('e_parking_channel', {
    parkChanID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    parkingID: {
        type: Sequelize.CHAR,
        allowNull: false
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
        allowNull: false
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
    tableName: 'e_parking_channel',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_parking_channel.create({
        parkChanID: data.parkChanID,
        parkingID: data.parkingID,
        villageID: data.villageID,
        ioID: data.ioID,
        deviceID: data.deviceID,
        channelNo: data.channelNo,
        in_outType: data.in_outType,
    });
}


module.exports.getByParkChanID = function (parkChanID) {
    return e_parking_channel.find({
        where: {
            parkChanID: parkChanID
        }
    });
}

module.exports.getDeviceID = function (deviceID) {
    return e_parking_channel.find({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.getParkingID = function (parkingID) {
    return e_parking_channel.findAll({
        where: {
            parkingID: parkingID
        }
    });
}

module.exports.getByIoID = function (ioID) {
    return e_parking_channel.findAll({
        where: {
            ioID: ioID
        }
    });
}

module.exports.update = function (data) {
    return e_parking_channel.update({
        parkChanID: data.parkChanID,
        parkingID: data.parkingID,
        villageID: data.villageID,
        ioID: data.ioID,
        deviceID: data.deviceID,
        channelNo: data.channelNo,
        in_outType: data.in_outType,
    }, {
        where: {
            parkChanID: data.parkChanID
        }
    });
}


module.exports.delete = function (parkChanID) {
    return e_parking_channel.destroy({
        where: {
            parkChanID: parkChanID
        }
    });
}
module.exports.count = function (villageIDs) {
    return e_parking_channel.count({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageIDs) {
    var sql = `

    select e_parking_channel.*,b_in_out.name as inoutName,e_parking.name as parkingName,e_device.name as deviceName from e_parking_channel
     LEFT JOIN b_in_out on e_parking_channel.ioID=b_in_out.ioID
     LEFT JOIN e_parking on e_parking_channel.parkingID =e_parking.parkingID
     LEFT JOIN e_device on e_parking_channel.deviceID =e_device.deviceID
        where e_parking_channel.villageID in  (:villageIDs)order by insertTime desc 
    limit :startIndex,:pageSize 
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
// module.exports.query = function (queryString, replacements) {
//     return dbConnection.query(queryString, {
//         replacements: replacements,
//         type: Sequelize.QueryTypes.SELECT
//     });
// }
module.exports.query = query;