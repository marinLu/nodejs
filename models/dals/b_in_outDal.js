const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var b_in_out = dbConnection.define('b_in_out', {
    ioID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    buildingID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: false
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: false
    },
    gisArea: {
        type: Sequelize.STRING,
        allowNull: true
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    picUrl: {
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
    tableName: 'b_in_out',
    timestamps: false
});


module.exports.insert = function (data) {
    return b_in_out.create({
        ioID: data.ioID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        code: data.code,
        name: data.name,
        longitude: data.longitude,
        latitude: data.latitude,
        gisArea: data.gisArea,
        type: data.type,
        picUrl: data.picUrl,
    });
}


module.exports.getByIoID = function (ioID) {
    return b_in_out.find({
        where: {
            ioID: ioID
        }
    });
}

module.exports.getByIoIDs = function (ioIDs) {
    return b_in_out.findAll({
        where: {
            ioID: {
                [Op.in]: ioIDs
            }
        }
    });
}

module.exports.getByBuildingID = function (buildingID) {
    return b_in_out.find({
        where: {
            buildingID: buildingID
        }
    });
}

module.exports.getByVillageIDs = function (pageNum, pageSize, villageIDs) {

    var sql = `select * from b_in_out where villageID in (:villageIDs) order by insertTime desc
     `;

    var replacements = {
        villageIDs: villageIDs
    };
    if (pageNum != null && pageNum > 0 && pageSize != null && pageSize > 0) {
        sql += ' limit :startIndex,:pageSize '
        replacements.startIndex = (pageNum - 1) * pageSize;
        replacements.pageSize = pageSize;
    }

    return query(sql, replacements);
}

module.exports.getByBuildingIDs = function (buildingIDs) {
    return b_in_out.find({
        where: {
            buildingID: {
                [Op.in]: buildingIDs
            }
        }
    });
}

module.exports.update = function (data) {
    return b_in_out.update({
        ioID: data.ioID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        code: data.code,
        name: data.name,
        longitude: data.longitude,
        latitude: data.latitude,
        type: data.type,
        picUrl: data.picUrl,
        gisArea: data.gisArea
    }, {
        where: {
            ioID: data.ioID
        }
    });
}


module.exports.delete = function (ioID) {
    return b_in_out.destroy({
        where: {
            ioID: ioID
        }
    });
}

var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.count = function (villageID) {
    return b_in_out.count({
        where: {
            villageID: villageID
        }
    });
}
module.exports.countSum = function (villageIDs) {
    return b_in_out.count({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageID) {
    var sql = `
        select * from b_in_out
        where villageID in (:villageID) order by insertTime desc limit :startIndex,:pageSize 
    `;
    var replacements = {
        villageID: villageID,
        startIndex: (pageNum - 1) * pageSize,
        pageSize: pageSize
    }
    return query(sql, replacements);
}