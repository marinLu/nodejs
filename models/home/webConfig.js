const cFun = require('../utils/commonFunc');
const authorityDal = require('../dals/s_authorityDal');
const villageDal = require('../dals/b_villageDal');
const optionDal = require('../dals/s_optionDal');
const districtDal = require('../dals/b_districtDal');
const provinceDal = require('../dals/b_provinceDal');
const cityDal = require('../dals/b_cityDal');
const streetDal = require('../dals/b_streetDal');
const resourceDal = require('../dals/s_resourceDal');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');
const functionDal = require('../dals/s_functionDal');
const role_userDal=require('../dals/s_user_roleDal');
var getWebGlobalConfig =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        /* #region 区域权限 */
        var authoritys = await authorityDal.getByUserID(reqBody.head.userID);
        var villageInfos = [];
        var userAuthorityVillageInfos = await redis.getAsync(redisKey.userAuthorityVillageInfos(reqBody.head.userID));
        if (userAuthorityVillageInfos == null) {

            var areaCodes = Array.from(new Set(authoritys.map(x => x.areaCode)));

            var streetCodes = areaCodes.filter(x => cFun.isStreetCode(x));
            var committeeCodes = areaCodes.filter(x => cFun.isCommitteeCode(x));
            var villageCodes = areaCodes.filter(x => cFun.isVillageCode(x));

            if (committeeCodes != null && committeeCodes.length > 0) {
                var villageInfo1 = await villageDal.getByCommitteeCodes(committeeCodes);
                villageInfos = villageInfos.concat(villageInfo1);
            }

            if (streetCodes != null && streetCodes.length > 0) {
                var villageInfo2 = await villageDal.getByStreetCodes(streetCodes);

                villageInfo2 = villageInfo2.filter(x => villageInfos.findIndex(y => y.villageID == x.villageID) < 0);
                villageInfos = villageInfos.concat(villageInfo2);
            }

            if (villageCodes != null && villageCodes.length > 0) {
                var villageInfo3 = await villageDal.getByVillageNos(villageCodes);
                villageInfo3 = villageInfo3.filter(x => villageInfos.findIndex(y => y.villageID == x.villageID) < 0);
                villageInfos = villageInfos.concat(villageInfo3);
            }

            if (villageInfos.length > 0) {
                redis.set(redisKey.userAuthorityVillageInfos(reqBody.head.userID), JSON.stringify(villageInfos));
            }
        } else {
            villageInfos = cFun.jsonTryParse(userAuthorityVillageInfos);
        }

        if (villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '未配置区域访问权限'));
        }
        /* #endregion */

      

        /* #region 功能权限 */

        // var authorityss = await authorityDal.getByUserIDAndurType(reqBody.head.userID);
        // var ID = Array.from(new Set(authorityss.map(x => x.urID)));
        var roleUserList = await role_userDal.getByUserID(reqBody.head.userID)
        let roleIDs = _.map(roleUserList,x=>x.roleID)
        var allFunctions = await functionDal.getByUserID(roleIDs);
        if (allFunctions != null && allFunctions.length > 0) {
            // var systemCodes = Array.from(new Set(allFunctions.map(x => x.systemCode)));
            // var moduleCodes = Array.from(new Set(allFunctions.map(x => x.moduleCode)));

            var topFunctions = _.filter(allFunctions, x => cFun.isNullOrEmpty(x.parentFunctionCode));

            if (topFunctions != null && topFunctions.length > 0) {
                var topFunctionCodes = Array.from(new Set(allFunctions.map(x => x.functionCode)));
            }
          

        }

        /* #endregion */
        var streetInfo = await streetDal.getByStreetID(villageInfos[0].streetID);
        // var villagePicResources = await resourceDal.getByBusinessIDs('villagePic', 'url', villageInfos.map(x => x.villageID));

        var districtInfo = await districtDal.getByDistrictID(villageInfos[0].districtID);
        if (districtInfo != null) {
            var districtInfos = { //辖区
                districtID: districtInfo.districtID,
                name: districtInfo.name
            }

            var cityInfo = await cityDal.getByCityID(districtInfo.cityID);
            if (cityInfo != null) {
                var cityInfos = {
                    cityID: cityInfo.cityID,
                    name: cityInfo.name
                }
            }

            var provinceInfo = await provinceDal.getByProvinceID(cityInfo.provinceID);
            if (provinceInfo != null) {
                var provinceInfos = {
                    provinceID: provinceInfo.provinceID,
                    name: provinceInfo.name
                }
            }
        }

        //获取地图参数
        var mapParams = '';
        var mapOption = await optionDal.getByKeyUserID('mapParams', reqBody.head.userID);
        if (mapOption != null) {
            mapParams = mapOption.value;
        }

        var maxLongitude = -Number.MAX_VALUE;
        var minLongitude = Number.MAX_VALUE;
        var maxLatitude = -Number.MAX_VALUE;
        var minLatitude = Number.MAX_VALUE;

        var resVillageInfos = [];

        villageInfos = _.orderBy(villageInfos, function (param) {
            return cFun.timestamp(param.updateTime)
        }, ['desc']);

        for (let i = 0; i < villageInfos.length; i++) {
            let item = villageInfos[i];
            let fence = cFun.jsonTryParse(item.fence);
            console.log(item.name);
            //计算总的坐标范围
            if (!cFun.isNullOrEmpty(fence)) {
                for (let i = 0; i < fence.length; i++) {
                    const element = fence[i];
                    if (element[0] > maxLongitude) {
                        maxLongitude = element[0];
                    }

                    if (element[0] < minLongitude) {
                        minLongitude = element[0];
                    }

                    if (element[1] > maxLatitude) {
                        maxLatitude = element[1];
                    }

                    if (element[1] < minLatitude) {
                        minLatitude = element[1];
                    }
                }
            }

            //计算每个小区的坐标范围
            var villageMaxLongitude = -Number.MAX_VALUE;
            var villageMinLongitude = Number.MAX_VALUE;
            var villageMaxLatitude = -Number.MAX_VALUE;
            var villageMinLatitude = Number.MAX_VALUE;

            if (!cFun.isNullOrEmpty(fence)) {
                for (let i = 0; i < fence.length; i++) {
                    const element = fence[i];
                    if (element[0] > villageMaxLongitude) {
                        villageMaxLongitude = element[0];
                    }

                    if (element[0] < villageMinLongitude) {
                        villageMinLongitude = element[0];
                    }

                    if (element[1] > villageMaxLatitude) {
                        villageMaxLatitude = element[1];
                    }

                    if (element[1] < villageMinLatitude) {
                        villageMinLatitude = element[1];
                    }
                }
            }

            // let villagePic = '';
            // let villagePicResource = villagePicResources.filter(x => x.businessID == item.villageID)[0];
            // if (villagePicResource != null) {
            //     villagePic = villagePicResource.filePath + item.picUrl;
            // }

            let resVillage = {
                villageID: item.villageID,
                villageName: item.name,
                fence: item.fence,
                districtID: item.districtID,
                streetID: item.streetID,
                committeeID: item.committeeID,
                address: item.address,
                villagePic: item.picUrl,
                insertTime: cFun.formatDateTime(item.insertTime),
                updateTime: cFun.formatDateTime(item.updateTime),
                mapExtent: {
                    maxLongitude: villageMaxLongitude,
                    minLongitude: villageMinLongitude,
                    maxLatitude: villageMaxLatitude,
                    minLatitude: villageMinLatitude
                }
            }

            resVillage.mapParams = mapParams;
            //计算每个小区地图参数
            if (villageInfos.length > 1) {
                let villageMapOptions = await optionDal.getByKey('mapParams_' + item.villageID);
                if (villageMapOptions != null && villageMapOptions.length > 0) {
                    resVillage.mapParams = villageMapOptions[0].value;
                }
            }
            resVillageInfos.push(resVillage);

        }

        //获取平台名称
        var prodcutName = '蓝+平台';
        var prodcutInfos = await optionDal.getByKey('webProductName');
        if (prodcutInfos.length > 0) {
            var userProduct = prodcutInfos.filter(x => x.userID == reqBody.head.userID);
            if (userProduct.length > 0) {
                prodcutName = userProduct[0].value;
            } else {
                let userProduct = prodcutInfos.filter(x => x.userID == null || x.userID == '');
                if (userProduct != null) {
                    prodcutName = userProduct[0].value;
                }
            }
        }

        var resBody = {
            prodcutName: prodcutName,
            cityInfo: cityInfos,
            districtInfo: districtInfos,
            provinceInfo: provinceInfos,
            villageInfos: resVillageInfos,
            roleIDs:roleIDs,
            mapParams: mapParams,
            mapExtent: {
                maxLongitude: maxLongitude,
                minLongitude: minLongitude,
                maxLatitude: maxLatitude,
                minLatitude: minLatitude
            },
            streetName: streetInfo == null ? '' : streetInfo.name,
            authorityFunction: {
                // systemCodes: systemCodes,
                // moduleCodes: moduleCodes,
                topFunctionCodes: topFunctionCodes == null ? [] : topFunctionCodes
            }
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });

module.exports.getWebGlobalConfig = getWebGlobalConfig;