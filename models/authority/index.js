const express = require('express');
var router = express.Router();
module.exports = router;

var cFun = require('../utils/commonFunc');
var token = require('../user/token');
var userRoleDal = require('../dals/s_user_roleDal');
var roleAuthorityDal = require('../dals/s_authorityDal');
var authorityDal = require('../dals/s_authorityDal');
var functionDal = require('../dals/s_functionDal');

/**
 * 模块权限
 */
router.post(
    "/getFunctionList",
    cFun.awaitHandlerFactory(async (req, res, next) => {
            var reqBody = req.body;

            var authoritys = await authorityDal.getByUrIDType(reqBody.head.userID, 0);
            if (authoritys == null) {
                authoritys = [];
            }

            //读取用户角色
            var userRoleInfos = await userRoleDal.getByUserID(reqBody.head.userID);
            if (userRoleInfos != null && userRoleInfos.length > 0) {
                for (let i = 0; i < userRoleInfos.length; i++) {
                    authoritys=authoritys.concat(await authorityDal.getByUrIDType(userRoleInfos[i].roleID,1));
                }
            }

            if (authoritys.length==0) {
                return res.json( cFun.responseStatus(0, '未查询到权限信息'));
            }

            var functions= await functionDal.getByIDs(authoritys.map(x=>x.functionID));

            var returnFunctions=[];
            for (let i = 0; i < functions.length; i++) {
                returnFunctions.push({
                    moduleCode:functions[i].moduleCode,
                    functionCode:functions[i].functionCode,
                    description:functions[i].description,
                    index:functions[i].index
                })                
            }

            var resBody={
                functionList:returnFunctions
            }

            return res.json(
                cFun.mergeJson(cFun.responseStatus(0, 'success'),
                    resBody)
            );
    })
);
