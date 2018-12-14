const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');


var s_department = dbConnection.define('s_department', {
    departmentID: {
        type: Sequelize.CHAR,
        allowNull: false,
        primaryKey: true
    },
    code: {
        type: Sequelize.STRING,
        allowNull: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    parentID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    isValid: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isUnit: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    level: {
        type: Sequelize.TINYINT,
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
        allowNull: true
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 's_department',
    timestamps: false
});


module.exports.insert = function (data) {
    return s_department.create({
        departmentID: data.departmentID,
        code: data.code,
        name: data.name,
        parentID: data.parentID,
        isValid: data.isValid,
        isUnit: data.isUnit,
        level: data.level,
        orderNum: data.orderNum,
        description: data.description,
    });
}


module.exports.getAllDepartment = function () {
    return s_department.findAll();
}

module.exports.getByDepartmentID = function (departmentID) {
    return s_department.find({
        where: {
            departmentID: departmentID
        }
    });
}


module.exports.getCode = function (code) {
    return s_department.find({
        where: {
            code: code,

        }
    });
}


module.exports.getByParentID = function () {
    // if (parentID == null) {
    //     parentID = 0;
    // }
    return s_department.findAll({
        order: [
            ['insertTime', 'DESC']
        ]
    });
}
module.exports.getByIsValid = function () {
    return s_department.findAll({
        where: {
            isValid: 0,
        }
        
    });
}
module.exports.getByPage = function (pageNum, pageSize) {
    // if (parentID == null) {
    //     parentID = 0;
    // }  where parentID=:parentID 
    var sql=`
        select * from s_department
      order by insertTime desc limit :startIndex,:pageSize 
    `;

    var replacements={
        startIndex:(pageNum-1)*pageSize,
        pageSize:pageSize
    }

    return querys(sql,replacements);
}
module.exports.update = function (data) {
    return s_department.update({
        departmentID: data.departmentID,
        code: data.code,
        name: data.name,
        parentID: data.parentID,
        isValid: data.isValid,
        isUnit: data.isUnit,
        level: data.level,
        orderNum: data.orderNum,
        description: data.description,
    }, {
        where: {
            departmentID: data.departmentID
        }
    })
}


module.exports.delete = function (departmentID) {
    return s_department.destroy({
        where: {
            departmentID: departmentID
        }
    })
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    })
}
var querys = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}
module.exports.querys = querys;