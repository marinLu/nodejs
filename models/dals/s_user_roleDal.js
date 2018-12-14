const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;

var s_user_role = dbConnection.define('s_user_role', {
    ID: {
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    userID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    roleID: {
        type: Sequelize.STRING,
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
    tableName: 's_user_role',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_user_role.create({
        ID: data.ID,
        userID: data.userID,
        roleID: data.roleID,
    });
}

module.exports.insertList = function (datas) {

    let insertList = [];
    for (let i = 0; i < datas.length; i++) {
        let data = datas[i];

        insertList.push({
            ID: data.ID,
            userID: data.userID,
            roleID: data.roleID,
        });
    }

    return s_user_role.bulkCreate(insertList);
}

module.exports.getByID = function (ID) {
    return s_user_role.find({
        where: {
            ID: ID
        }
    });
}

module.exports.getByRoleID = function (roleID) {
    return s_user_role.findAll({
        where: {
            roleID: roleID
        }
    });
}

module.exports.getByRoleIDs = function (roleIDs) {
    return s_user_role.findAll({
        where: {
            roleID: {
                [Op.in]: roleIDs
            }
        }
    });
}


module.exports.getByUserID = function (userID) {
    return s_user_role.findAll({
        where: {
            userID: userID
        }
    });
}

module.exports.update = function (data) {
    return s_user_role.update({
        ID: data.ID,
        userID: data.userID,
        roleID: data.roleID,
    }, {
        where: {
            ID: data.ID
        }
    });
}


module.exports.delete = function (ID) {
    return s_user_role.destroy({
        where: {
            ID: ID
        }
    });
}

module.exports.buUserIDdelete = function (userID) {
    return s_user_role.destroy({
        where: {
            userID: userID
        }
    });
}
module.exports.getUserRoleByUserIDs = function (userIDs) {
    var sql = `
    select  s_role.*,s_user_role.userID from s_user_role
    inner join s_role on s_user_role.roleID=s_role.roleID
    where s_user_role.userID in(:userIDs) 
    `
    return query(sql, {
        userIDs: userIDs
    })
}



var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}