const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const cFun = require('../utils/commonFunc');
const Op = dbConnection.Op;

var s_role = dbConnection.define('s_role', {
    roleID: {
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    roleName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    orderNum: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
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
    tableName: 's_role',
    timestamps: false
});



module.exports.insert = function (data) {
    return s_role.create({
        roleID: data.roleID,
        roleName: data.roleName,
        orderNum: data.orderNum,
        description: data.description,
    });

}


module.exports.getByUserIDgetByRoleID = function (roleID) {
    return s_role.find({
        where: {
            roleID: roleID
        }
    });
}


module.exports.getByRoleIDs = function (roleIDs) {
    return s_role.findAll({
        where: {
            roleID: {
                [Op.in]: roleIDs
            }
        }
    });
}

module.exports.getAll = function () {
    return s_role.findAll({
        order: [
            ['insertTime', 'DESC']
        ]

    });
}
// module.exports.getAllList= function(){

//     var sql = `
//     SELECT * from s_role  LEFT JOIN s_authority on s_role.roleID=s_authority.urID  

// `;

// return query(sql);
// }

module.exports.getByName = function (roleName) {
    return s_role.find({
        where: {
            roleName: roleName
        }
    });
}

module.exports.update = function (data) {
    return s_role.update({
        roleID: data.roleID,
        roleName: data.roleName,
        orderNum: data.orderNum,
        description: data.description,
    }, {
        where: {
            roleID: data.roleID
        }
    });
}


module.exports.delete = function (roleID) {
    return s_role.destroy({
        where: {
            roleID: roleID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}