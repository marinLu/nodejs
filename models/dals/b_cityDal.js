const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var b_city = dbConnection.define('b_city', {
    cityID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey:true
    },
    provinceID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    cityNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pinyin: {
        type: Sequelize.STRING,
        allowNull: true
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
        allowNull: true
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 'b_city',
    timestamps: false
});


module.exports.insert = function (data) {
    return b_city.create({
        cityID: data.cityID,
        provinceID: data.provinceID,
        cityNo: data.cityNo,
        name: data.name,
        pinyin: data.pinyin,
        longitude: data.longitude,
        latitude: data.latitude,
    });
}


module.exports.getByCityID = function (cityID) {
    return b_city.find({
        where: {
            cityID: cityID
        }
    });
}

module.exports.getByProvinceID = function (provinceID) {
    return b_city.findAll({
        where: {
            provinceID: provinceID
        }
    });
}
module.exports.getByProvinceIDs = function (provinceID) {
    return b_city.find({
        where: {
            provinceID: provinceID
        }
    });
}
module.exports.update = function (data) {
    return b_city.update({
        cityID: data.cityID,
        provinceID: data.provinceID,
        cityNo: data.cityNo,
        name: data.name,
        pinyin: data.pinyin,
        longitude: data.longitude,
        latitude: data.latitude,
    }, {
        where: {
            cityID: data.cityID
        }
    });
}


module.exports.delete = function (ID) {
    return b_city.destroy({
        where: {
            cityID: cityID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}