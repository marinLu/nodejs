const express = require('express');
var router = express.Router();
module.exports = router;

const cFun = require('../utils/commonFunc');
const roleDal = require('../dals/s_roleDal');
const userRoleDal = require('../dals/s_user_roleDal');
const RoleEntity = require("../entitys/s_roleEntity");
const authorityEntity = require("../entitys/s_authorityEntity");
const authorityDal = require("../dals/s_authorityDal");
const functionDal = require("../dals/s_functionDal");


/**
 * 添加角色
 */
router.post(
    "/add",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req.body.role == null) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }

        // var userRoleMaps = await userRoleDal.getByUserID(req.body.head.userID);
        // var userRoles = await roleDal.getByRoleIDs(_.map(userRoleMaps, x => x.roleID));
        // if (item.roleName != '管理员' || userRoles.roleName.length <= 0) {
        //     return res.json(cFun.responseStatus(0, '非管理员无法添加角色'));
        // }
        var role = await roleDal.getByName(req.body.role.roleName);
        if (role != null) {
            return res.json(cFun.responseStatus(-1, '该角色名已存在'));
        }
        //新增角色
        var roleEntity = new RoleEntity();
        roleEntity.roleID = cFun.guid();
        roleEntity.roleName = req.body.role.roleName;
        roleEntity.orderNum = req.body.role.orderNum;
        roleEntity.description = req.body.role.description;
        await roleDal.insert(roleEntity);
        if (req.body.authorityList.functionID) {
            for (const item of req.body.authorityList.functionID) {
                var authorityEntitys = new authorityEntity();
                authorityEntitys.authorityID = cFun.guid();
                authorityEntitys.urType = 1;
                authorityEntitys.urID = roleEntity.roleID;
                authorityEntitys.functionID = item;
                await authorityDal.insert(authorityEntitys);
            }
        }
        
        return res.status(200).json(
            cFun.responseStatus(0, 'success')
        );
    })
);
/**
 * 删除角色
 */
router.post(
    "/delete",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }
        // var userRoleMaps = await userRoleDal.getByUserID(req.body.head.userID);
        // var userRoles = await roleDal.getByRoleIDs(_.map(userRoleMaps, x => x.roleID));
        // if (userRoles.roleName != '管理员' || userRoles.roleName.length <= 0) {
        //     return res.json(cFun.responseStatus(0, '非管理员无法删除角色'));
        // }
        //删除指定角色
        for (const item of req.body.roleIDs) {
            await roleDal.delete(item);
        }
        await authorityDal.delRoles(req.body.roleIDs);
        return res.json(
            cFun.responseStatus(0, 'success')
        );
    })
);
/**
 * 更新角色
 */
router.post(
    "/update",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }
        var updateRole = await roleDal.getByRoleID(req.body.roles.roleID);
        if (updateRole == null) {
            return res.json(cFun.responseStatus(-1, '不存在该角色'));
        }

        if (updateRole.roleName != req.body.roles.roleName) {
            var sameNameRole = await roleDal.getByName(req.body.roles.roleName);
            if (sameNameRole != null) {
                return res.json(cFun.responseStatus(-1, '已存在相同角色名称'));
            }
        }
        // var userRoleMaps = await userRoleDal.getByUserID(req.body.head.userID);
        // var userRoles = await roleDal.getByRoleIDs(_.map(userRoleMaps, x => x.roleID));
        // if (userRoles.roleName != '管理员' || userRoles.roleName.length <= 0) {
        //     return res.json(cFun.responseStatus(0, '非管理员无法添加角色'));
        // }

        //更新角色
        updateRole.roleName = req.body.roles.roleName;
        updateRole.orderNum = req.body.roles.orderNum;
        updateRole.description = req.body.roles.description;
        updateRole.orderNum = req.body.roles.orderNum;
        await roleDal.update(updateRole);
        await authorityDal.querydels("DELETE from s_authority where urID in ('" + req.body.roles.roleID + "')");
        if (req.body.authorityList) {
            for (const item of req.body.authorityList.functionID) {
                var authorityEntitys = new authorityEntity();
                authorityEntitys.authorityID = cFun.guid();
                authorityEntitys.urType = 1;
                authorityEntitys.urID = req.body.roles.roleID;
                authorityEntitys.functionID = item;
                await authorityDal.insert(authorityEntitys);
            }
        }
       
        return res.json(cFun.responseStatus(0, 'success'));
    })
);

/**
 * 获取所有角色
 */
router.post(
    "/getAllRoles",
    cFun.awaitHandlerFactory(async (req, res, next) => {
        if (req == null || req.body == null ||
            cFun.headEmpty(req.body.head)) {
            return res.json(cFun.responseStatus(-1, '非法请求'));
        }
        var allRoles = [];
        //查找所有角色
        allRoles = await roleDal.getAll();
        if (allRoles == null || allRoles.length == 0) {
            return res.json(cFun.responseStatus(0, '无角色'));
        }

       
        var allUserRoles = await authorityDal.gets_authorityByRoleIDs(_.map(allRoles, x => x.roleID));//根据角色获取FunctionID的详情
        var resUserInfos = [];
        for (let i = 0; i < allRoles.length; i++) {
            let userInfo = allRoles[i];
            var areaAuthoritys = [];
            var areaInfos = await authorityDal.getByUrIDAll(userInfo.roleID); //根据角色ID获取区域
            for (let i = 0; i < areaInfos.length; i++) {
                    areaAuthoritys.push({
                        areaCodes: areaInfos[i].areaCode,
                        areaNames: areaInfos[i].areaName
                    })
            }
            let userRoles = _.filter(allUserRoles, x => x.urID == userInfo.roleID);//取到一个FunctionID数值

            let resUserRoles = [];
            for (let i = 0; i < userRoles.length; i++) {
                if (_.findIndex(resUserRoles, x => x.functionID == userRoles[i].functionID) < 0) {
                    resUserRoles.push({
                        functionID: userRoles[i].functionID,
                        functionName: userRoles[i].functionName
                    })
                }
            }
            resUserInfos.push({
                roleID: userInfo.roleID,
                roleName: userInfo.roleName,
                description: userInfo.description,
                displayName: userInfo.displayName,
                insertTime: userInfo.insertTime,
                updateTime: userInfo.updateTime,
                areaInfos: areaAuthoritys,
                resUserRoles: resUserRoles
            });
        }
        var resBody = {
            roleList: resUserInfos
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    })
);