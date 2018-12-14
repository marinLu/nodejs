const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const userRoleDal = require('../dals/s_user_roleDal');
const Op = dbConnection.Op;

var s_user = dbConnection.define('s_user', {
    userID: {
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    loginName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    displayName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    departmentID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    phoneTel: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tel: {
        type: Sequelize.STRING,
        allowNull: true
    },
    position: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    status: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isValid: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    multLogin: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    loginSystemType: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    accessNet: {
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
        tableName: 's_user',
        timestamps: false
    });

var insert = function (data, options) {
    return s_user.create({
        userID: data.userID,
        loginName: data.loginName,
        password: data.password,
        displayName: data.displayName,
        departmentID: data.departmentID,
        phoneTel: data.phoneTel,
        tel: data.tel,
        position: data.position,
        email: data.email,
        status: data.status,
        isValid: data.isValid,
        multLogin: data.multLogin,
        loginSystemType: data.loginSystemType,
        accessNet: data.accessNet,
    }, options);

}
module.exports.insert = insert;

module.exports.insertUserInfo = function (userEntity, userRoleEntitys) {
    dbConnection.transaction(function (t) {
        return s_user.create(userEntity, {
            transaction: t
        })
            .then(function (param) {
                return userRoleDal.insertList(userRoleEntitys, {
                    transaction: t
                })
            })
    }).catch(function (err) {
        console.log(err);
    })
}

module.exports.getByID = function (userID) {
    return s_user.find({
        where: {
            userID: userID
        }
    });
}

module.exports.getByPhoneTel = function (phoneTel) {
    return s_user.find({
        where: {
            phoneTel: phoneTel
        }
    });
}

module.exports.getByIDs = function (userIDs) {
    return s_user.findAll({
        where: {
            userID: {
                [Op.in]: userIDs
            }
        }
    });

}

module.exports.getByLoginName = function (loginName) {
    return s_user.find({
        where: {
            loginName: loginName
        }
    });
}

module.exports.getByDepartmentID = function (departmentID) {
    return s_user.findAll({
        where: {
            departmentID: departmentID
        }
    });
}

module.exports.getAll = function () {
    return s_user.findAll({
        order: [
            ['insertTime', 'DESC']
        ]
    });
}

module.exports.getByPage = function (pageNum, pageSize, orderRule) {

    var sql = `
    select s_user.* ,s_department.name as departmentName,s_department.departmentID as departmentID FROM s_user 
LEFT JOIN s_department on s_user.departmentID=s_department.departmentID
order by insertTime desc `;
    if (orderRule == 'displayName') {
        sql += ',displayName '
    }

    if (orderRule == 'displayName_desc') {
        sql += ',displayName desc '
    }

    sql += 'limit :startIndex,:endIndex';
    return query(sql, {
        startIndex: (pageNum - 1) * pageSize,
        endIndex: pageSize
    })
}

module.exports.update = function (data) {
    return s_user.update({
        userID: data.userID,
        loginName: data.loginName,
        password: data.password,
        displayName: data.displayName,
        departmentID: data.departmentID,
        phoneTel: data.phoneTel,
        tel: data.tel,
        position: data.position,
        email: data.email,
        status: data.status,
        isValid: data.isValid,
        multLogin: data.multLogin,
        loginSystemType: data.loginSystemType,
        accessNet: data.accessNet,
    }, {
            where: {
                userID: data.userID
            }
        });
}

module.exports.updatePassWord = function (data) {
    return s_user.update({
        userID: data.userID,
        password: data.password
    }, {
            where: {
                userID: data.userID
            }
        });
}

module.exports.delete = function (userID) {
    return s_user.destroy({
        where: {
            userID: userID
        }
    });
}


module.exports.count = function () {
    return s_user.count();
}

var query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
module.exports.query = query;