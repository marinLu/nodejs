const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var p_people_tag = dbConnection.define('p_people_tag', {
    ptID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    peopleID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    label: {
        type: Sequelize.STRING,
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
    tableName: 'p_people_tag',
    timestamps: false
});


module.exports.insert = function (data) {
    return p_people_tag.create({
        ptID: data.ptID,
        peopleID: data.peopleID,
        label: data.label,
        isDelete: data.isDelete,
    });
}


module.exports.getByID = function (ptID) {
    return p_people_tag.find({
        where: {
            ptID: ptID
        }
    });
}

module.exports.getByPeopleID = function (peopleID) {
  var sql =`select * from s_dictionary t1 inner join p_people_tag t2 on t1.name=t2.label WHERE t2.isDelete=0 and t2.peopleID=:peopleID`
  return dbConnection.query(sql, {
    replacements: {
        peopleID: peopleID
    },
    type: Sequelize.QueryTypes.SELECT
});
}

module.exports.getByLabels = function (labels) {
    return p_people_tag.findAll({
        where: {
            label: {
                [Op.in]: labels
            },
            isDelete: 0
        }
    });
}

module.exports.update = function (data) {
    return p_people_tag.update({
        ptID: data.ptID,
        peopleID: data.peopleID,
        label: data.label,
        isDelete: data.isDelete,
    }, {
        where: {
            ptID: data.ptID
        }
    });
}


module.exports.delete = function (ID) {
    return p_people_tag.destroy({
        where: {
            ptID: ptID
        }
    });
}

module.exports.byPeopleIDdelete = function (peopleID) {
    return p_people_tag.update({
        isDelete: 1,
    }, {
        where: {
            peopleID: peopleID
        }
    });
   
}
module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}