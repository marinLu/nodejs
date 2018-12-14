const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var p_people_house = dbConnection.define('p_people_house', {
    phID: {
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
    buildingNo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    houseID: {
        type: Sequelize.STRING,
        allowNull: true
    },
    houseNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    peopleID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    workState: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    relationshipWithHouseHold: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    personType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    sourceType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    resideMode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isChildren: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isAged: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isFocus: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isCare: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isHouse: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    lastOpenDoorTime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isOperation: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    isDelete: {
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
        tableName: 'p_people_house',
        timestamps: false
    });


module.exports.insert = function (data) {
    return p_people_house.create({
        phID: data.phID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        buildingNo: data.buildingNo,
        houseID: data.houseID,
        houseNo: data.houseNo,
        peopleID: data.peopleID,
        createType: data.createType,
        workState: data.workState,
        relationshipWithHouseHold: data.relationshipWithHouseHold,
        personType: data.personType,
        sourceType: data.sourceType,
        resideMode: data.resideMode,
        isChildren: data.isChildren,
        isAged: data.isAged,
        isFocus: data.isFocus,
        isCare: data.isCare,
        isHouse: data.isHouse,
        lastOpenDoorTime: data.lastOpenDoorTime,
        isOperation: data.isOperation,
        isDelete: data.isDelete,
    });
}


module.exports.getByID = function (phID) {
    return p_people_house.find({
        where: {
            phID: phID
        }
    });
}


module.exports.getByHouseID = function (houseID) {
    return p_people_house.findAll({
        where: {
            houseID: houseID
        }
    });
}

module.exports.getByHouseIDs = function (houseIDs) {
    return p_people_house.findAll({
        where: {
            houseID: {
                [Op.in]: houseIDs
            }
        }
    });
}

module.exports.getByBuildingID = function (buildingID) {
    return p_people_house.findAll({
        where: {
            buildingID: buildingID,
            isDelete: 0
        }
    });
}
module.exports.getPeopleIDByVillageIDCount = function (villageID) {
    return p_people_house.count({
        where: {
            villageID: villageID,
            isDelete: 0
        }
    });
}
module.exports.getPeopleIDByVillageIDCountsum = async function (villageIDs) {
    var sql = `
    SELECT count(*) as count FROM p_people_house LEFT 
        JOIN p_people ON p_people_house.peopleID = p_people.peopleID 
        JOIN b_village on p_people_house.villageID =b_village.villageID
        WHERE p_people_house.villageID in (:villageIDs)
				and p_people_house.isDelete=0 and p_people.isDeleted=0
    `;
    var replacements = {
        villageIDs: villageIDs,
    }
    var count = await query(sql, replacements);
    return count[0].count;

}
module.exports.getByVillageIDs = function (villageIDs) {
    return p_people_house.findAll({
        where: {
            villageID: {
                [Op.in]: villageIDs
            }
        }
    });
}

module.exports.getByPeopleID = function (peopleID) {
    return p_people_house.find({
        where: {
            peopleID: peopleID
        }
    });
}

module.exports.getByPeopleIDs = function (peopleIDs) {
    return p_people_house.findAll({
        where: {
            peopleID: {
                [Op.in]: peopleIDs
            }
        }
    });
}

module.exports.updateLastOpenDoorTime = function (credentialType, credentialNo, openTime) {

    var sql = `
    update p_people_house
    inner join p_people on p_people_house.peopleID=p_people.peopleID
    set p_people_house.lastOpenDoorTime=:lastOpenDoorTime
    where p_people.credentialType=:credentialType and p_people.credentialNo=:credentialNo
    `

    return dbConnection.query(sql, {
        replacements: {
            lastOpenDoorTime: openTime,
            credentialType: credentialType,
            credentialNo: credentialNo
        },
        type: Sequelize.QueryTypes.UPDATE
    });
}

module.exports.getAgeds = function () {
    return p_people_house.findAll({
        where: {
            isAged: 1,
            isDelete: 0
        }
    });
}

module.exports.getChildren = function () {
    return p_people_house.findAll({
        where: {
            isChildren: 1,
            isDelete: 0
        }
    });
}

module.exports.update = function (data) {
    return p_people_house.update({
        phID: data.phID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        buildingNo: data.buildingNo,
        houseID: data.houseID,
        houseNo: data.houseNo,
        peopleID: data.peopleID,
        createType: data.createType,
        workState: data.workState,
        relationshipWithHouseHold: data.relationshipWithHouseHold,
        personType: data.personType,
        sourceType: data.sourceType,
        resideMode: data.resideMode,
        isChildren: data.isChildren,
        isAged: data.isAged,
        isFocus: data.isFocus,
        isCare: data.isCare,
        isHouse: data.isHouse,
        lastOpenDoorTime: data.lastOpenDoorTime,
        isOperation: data.isOperation,
        isDelete: data.isDelete,
    }, {
            where: {
                phID: data.phID
            }
        });
}
module.exports.updateHouseInfo = function (data) {
    return p_people_house.update({

        buildingID: data.buildingID,
        buildingNo: data.buildingNo,
        houseID: data.houseID,
        houseNo: data.houseNo,

        createType: data.createType,
        workState: data.workState,
        relationshipWithHouseHold: data.relationshipWithHouseHold,
        personType: data.personType,
        sourceType: data.sourceType,
        resideMode: data.resideMode,
        isChildren: data.isChildren,
        isAged: data.isAged,
        isFocus: data.isFocus,
        isCare: data.isCare,
        isHouse: data.isHouse,
        isOperation: data.isOperation,
    }, {
            where: {
                phID: data.phID
            }
        });
}
module.exports.updateHousep = function (data) {
    return p_people_house.update({

        isDelete: data.isDelete,
    }, {
            where: {
                phID: data.phID
            }
        });
}

module.exports.delete = function (phID) {
    return p_people_house.destroy({
        where: {
            phID: phID
        }
    });
}


var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
module.exports.query = query;