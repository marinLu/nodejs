const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const cFun = require('../utils/commonFunc');
var b_building = dbConnection.define('b_building', {
    buildingID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    buildingNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    floorTotal: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    houseTotal: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    latitude: {
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
        tableName: 'b_building',
        timestamps: false
    });


module.exports.insert = function (data) {
    return b_building.create({
        buildingID: data.buildingID,
        villageID: data.villageID,
        buildingNo: data.buildingNo,
        name: data.name,
        floorTotal: data.floorTotal,
        houseTotal: data.houseTotal,
        longitude: data.longitude,
        latitude: data.latitude,
    });
}

module.exports.insertList = function (datas) {
    var insertList = [];
    for (let i = 0; i < datas.length; i++) {
        let data = datas[i];

        insertList.push({
            buildingID: data.buildingID,
            villageID: data.villageID,
            buildingNo: data.buildingNo,
            name: data.name,
            floorTotal: data.floorTotal,
            houseTotal: data.houseTotal,
            longitude: data.longitude,
            latitude: data.latitude,
        })
    }


    return b_building.bulkCreate(insertList);
}


module.exports.getByID = function (buildingID) {
    return b_building.find({
        where: {
            buildingID: buildingID
        }
    });
}

module.exports.getByBuildingIDs = function (buildingIDs) {
    return b_building.findAll({
        where: {
            buildingID: {
                [Op.in]: buildingIDs
            }
        }
    });
}

module.exports.getByVillageIDs = function (villageIDs) {
    return b_building.findAll({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}

module.exports.getByVillageID = function (villageID) {
    return b_building.findAll({
        where: {
            villageID: villageID
        }
    });
}
module.exports.getByVillageByIDs = function (villageID) {
    return b_building.findAll({
        attributes: ['buildingID'],
        where: {
            villageID: villageID
        }
    });
}
module.exports.getByVillageIDCount = function (villageID) {
    return b_building.count({
        where: {
            villageID: villageID
        }
    });
}
module.exports.getBybuno = async function (villageID) {
    var sql = `
    SELECT COUNT(*) as count FROM b_building where villageID=:villageID;
    `;
    var replacements = {
        villageID: villageID,
    }
    var count = await query(sql, replacements);
    return count[0].count;
}
module.exports.update = function (data) {
    return b_building.update({
        buildingID: data.buildingID,
        villageID: data.villageID,
        buildingNo: data.buildingNo,
        name: data.name,
        floorTotal: data.floorTotal,
        houseTotal: data.houseTotal,
        longitude: data.longitude,
        latitude: data.latitude,
    }, {
            where: {
                buildingID: data.buildingID
            }
        });
}


module.exports.delete = function (buildingID) {
    return b_building.destroy({
        where: {
            buildingID: buildingID
        }
    });
}

module.exports.buildingIsNo = function (buildingNo,villageID) {
    return b_building.find({
        where: {
            buildingNo: buildingNo,
            villageID:villageID
        }
    });
}

module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
module.exports.count = function (villageID) {
    return b_building.count({
        where: {
            villageID: villageID
        }
    });
}
module.exports.getByPage = function (pageNum, pageSize, villageID) {
    var sql = `
        select * from b_building
        where villageID in (:villageID) order by insertTime desc limit :startIndex,:pageSize 
    `;
    var replacements = {
        villageID: villageID,
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
module.exports.query = query;
