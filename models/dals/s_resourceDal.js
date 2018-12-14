const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;


var s_resource = dbConnection.define('s_resource', {
    resourceID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    businessType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    businessID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    fileType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    filePath: {
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
    tableName: 's_resource',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_resource.create({
        resourceID: data.resourceID,
        businessType: data.businessType,
        businessID: data.businessID,
        fileType: data.fileType,
        filePath: data.filePath,
    });
}


module.exports.getByID = function (resourceID) {
    return s_resource.find({
        where: {
            resourceID: resourceID
        }
    });
}

module.exports.getBusinessType = function (businessType) {
    return s_resource.findAll({
        where: {
            businessType: businessType
        }
    });
}

module.exports.getByBusinessIDs = function (businessType, fileType, businessIDs) {
    return s_resource.findAll({
        where: {
            businessType: businessType,
            fileType: fileType,
            businessID: {
                [Op.in]: businessIDs
            }
        }
    });
}

module.exports.update = function (data) {
    return s_resource.update({
        resourceID: data.resourceID,
        businessType: data.businessType,
        businessID: data.businessID,
        fileType: data.fileType,
        filePath: data.filePath,
    }, {
        where: {
            resourceID: data.resourceID
        }
    });
}


module.exports.delete = function (resourceID) {
    return s_resource.destroy({
        where: {
            resourceID: resourceID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}