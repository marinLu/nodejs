const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const userRoleDal = require('../dals/s_user_roleDal');
const Op = dbConnection.Op;
const s_authority = require('blueplus-dals').s_authorityDal.s_authority;

module.exports.insert = require('blueplus-dals').s_authorityDal.insert;
module.exports.update = require('blueplus-dals').s_authorityDal.update;

module.exports.getByID = function (authorityID) {
    return s_authority.find({
        where: {
            authorityID: authorityID
        }
    });
}

module.exports.getByUrIDType = function (urID, urType) {
    return s_authority.findAll({
        where: {
            urID: urID,
            urType: urType
        }
    });
}
module.exports.getByUrIDAll = function (urIDs) {
    // return s_authority.findAll({
    //     where: {
    //         urID: {
    //             [Op.in]: urIDs
    //         },
    //     }
    // });
    var sql = `
    SELECT * from s_authority 
    where s_authority.urID in (:urIDs) and  functionID =''  `
    return querys(sql, {
        urIDs: urIDs
    })
}
module.exports.getByUserID = async function (userID) {
    var userRoleInfos = await userRoleDal.getByUserID(userID);
    var urIDs = userRoleInfos.map(x => x.roleID);
    // if(urType==1){
    //     urIDs=urIDs;
    // }else if(urType==0){
    //     urIDs=userID;
    // }
    urIDs.push(userID);
    var authoritys = await s_authority.findAll({
        where: {
            urID: {
                [Op.in]: urIDs
            },
            urType: {
                [Op.in]: [0,1]
            }
        }
    });

    return authoritys;
}



module.exports.delete = function (ID) {
    return s_authority.destroy({
        where: {
            authorityID: authorityID
        }
    });
}
module.exports.gets_authorityByRoleIDs = function (roleIDs) {
    var sql = `
    SELECT s_function.*,s_authority.* from s_function 
    inner JOIN s_authority on s_function.functionID=s_authority.functionID 
    where s_authority.urType=1 and s_authority.urID in (:roleIDs)  
    `
    return querys(sql, {
        roleIDs: roleIDs
    })
}

module.exports.delRoles = function (roleIDs) {
    var sql = `
    DELETE from s_authority where urID in (:roleIDs) 
    `
    return querydel(sql, {
        roleIDs: roleIDs
    })
}


var querys = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

var querydel = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.DELETE
    });
}
module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.querydels = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.DELETE
    });
}
