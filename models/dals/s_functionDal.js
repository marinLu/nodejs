const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const cFun = require('../utils/commonFunc');
const s_function = require('blueplus-dals').s_functionDal.s_function

module.exports.insert = require('blueplus-dals').s_functionDal.insert;
module.exports.update = require('blueplus-dals').s_functionDal.update;
module.exports.delete = require('blueplus-dals').s_functionDal.delete;
module.exports.query = require('blueplus-dals').s_functionDal.query;

// module.exports.getByID = function (functionID) {
//     return s_function.find({
//         where: {
//             functionID: functionID
//         }
//     });
// }


// module.exports.getByFunctionCode = function (functionCode) {
//     return s_function.find({
//         where: {
//             functionCode: functionCode
//         }
//     });
// }

module.exports.getByIDs = function (functionIDs) {
    return s_function.findAll({
        where: {
            functionID: {
                [Op.in]: functionIDs
            }
        }
    });
}


module.exports.getFunctionAll = function () {
    return s_function.findAll({});
}




module.exports.getModuleCodeOne = function () {
    return s_function.findAll({
        where: {
            parentFunctionCode: ""
        }
    });
}
// module.exports.getparentFunctionCodeTh = function (parentFunctionCode) {
//     return s_function.findAll({
//         where: {
//             parentFunctionCode: parentFunctionCode
//         }
//     });
// }
module.exports.getparentFunctionCodeTwo = function (parentFunctionCode) {
    return s_function.findAll({
        where: {
            parentFunctionCode: parentFunctionCode
        }
    });
}

module.exports.getParentFunctionCode = function (parentFunctionCode, urIDs) {

    let sql = `
    SELECT s_function.* from s_function 
    left JOIN s_authority on s_function.functionID=s_authority.functionID 
    where s_authority.urID in (:urIDs) and s_function.parentFunctionCode= :parentFunctionCode
    `;
    let replacements = {
        urIDs: urIDs,
        parentFunctionCode: parentFunctionCode

    };
    return this.query(sql, replacements);
}



module.exports.getFunctionCodeAll = function (functionCodes, systemCode) {
    return s_function.findAll({
        where: {
            functionCode: {
                [Op.in]: functionCodes

            },
            systemCode: systemCode
        }
    });
}
module.exports.getByIDs = function (functionIDs) {
    return s_function.findAll({
        where: {
            functionID: {
                [Op.in]: functionIDs
            }
        }
    });
}
module.exports.getByID = function (functionID) {
    return s_function.find({
        where: {
            functionID: functionID
        }

    });
}
module.exports.getByCode = function (functionCode) {
    return s_function.find({
        where: {
            functionCode: functionCode
        }

    });
}

module.exports.getByUserID = function (urIDs) {

    if (urIDs == null || urIDs.length == 0) {
        return null;
    }

    let sql = `
    SELECT s_function.* from s_function 
    left JOIN s_authority on s_function.functionID=s_authority.functionID 
    where s_authority.urID in (:urIDs)
    `;

    let replacements = {
        urIDs: urIDs
    };
    return this.query(sql, replacements);
}
module.exports.querydel = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.DELETE
    });
}