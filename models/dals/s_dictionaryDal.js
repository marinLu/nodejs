const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;


var s_dictionary = dbConnection.define('s_dictionary', {
    dictionaryID: {
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    typeName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    path: {
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
        tableName: 's_dictionary',
        timestamps: false
    });


module.exports.insert = function (data) {
    return s_dictionary.create({
        dictionaryID: data.dictionaryID,
        name: data.name,
        typeName: data.typeName,
        path: data.path,
    });
}


module.exports.getByID = function (dictionaryID) {
    return s_dictionary.find({
        where: {
            dictionaryID: dictionaryID
        }
    });
}

module.exports.getTypeName = function (path, name) {
    return s_dictionary.find({
        where: {
            path: path,
            name: name
        }
    });
}

module.exports.getByPath = function (path) {
    return s_dictionary.findAll({
        where: {
            path: path
        }
    });
}

module.exports.getLikePath = function (path) {
    return s_dictionary.findAll({
        where: {
            path: {
                [Op.like]: '%' + path + '%'
            }
        },
        order: [
            ['insertTime', 'DESC']
        ]
    });
}

module.exports.getByPaths = function (paths) {

    return s_dictionary.findAll({
        where: {
            path: {
                [Op.in]: paths
            }
        },
        order: [
            ['insertTime', 'DESC']
        ]
    });
}

module.exports.getLikePathInfo = function (path) {
    return s_dictionary.find({
        where: {
            path: {
                [Op.like]: '%' + path + '%'
            }
        },
        order: [
            ['name', 'DESC']
        ]
    });
}

module.exports.getAllPath = function (path) {
    return s_dictionary.findAll({
        where: {
            path: {
                [Op.like]: '%' + path + '%'
            }
        }
    });
}

module.exports.update = function (data) {
    return s_dictionary.update({
        dictionaryID: data.dictionaryID,
        name: data.name,
        typeName: data.typeName,
        path: data.path,
    }, {
            where: {
                dictionaryID: data.dictionaryID
            }
        });
}


module.exports.delete = function (dictionaryID) {

    return s_dictionary.destroy({
        where: {
            dictionaryID: dictionaryID
        }
    });
}

module.exports.deleteLabel = function (labelName) {

    return s_dictionary.destroy({
        where: {
            path: {
                [Op.eq]: 'db/p_people_tag/label/' + labelName
            }
        }
    });
}
module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}