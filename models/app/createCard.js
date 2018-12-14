const cFun = require('../utils/commonFunc');
const peopleHouseDal = require('../dals/p_people_houseDal');
const authorityDal = require('../dals/s_authorityDal');
const villageDal = require('../dals/b_villageDal');
const houseDal = require('../dals/b_houseDal');
const numChinese = require('../utils/numChinese');
const peopleDal = require('../dals/p_peopleDal');

var getCardAreaList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var authoritys = await authorityDal.getByUserID(reqBody.head.userID);
        var areaCodes = Array.from(new Set(authoritys.map(x => x.areaCode)));

        var streetCodes = areaCodes.filter(x => cFun.isStreetCode(x));
        var committeeCodes = areaCodes.filter(x => cFun.isCommitteeCode(x));
        var villageCodes = areaCodes.filter(x => cFun.isVillageCode(x));

        var villageInfos = [];
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

        if (villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '未配置区域访问权限'));
        }
        var resBody = {
            villages: []
        };

        for (let i = 0; i < villageInfos.length; i++) {
            let villageInfo = villageInfos[i];
            resBody.villages.push({
                villageID: villageInfo.villageID,
                villageName: villageInfo.name
            });
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getCardAreaList = getCardAreaList;

var getBuildingList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var resArea = [];
        var peopleHouseList = await peopleHouseDal.getByVillageIDs([reqBody.villageID]);
        var villageBuildingIDs = Array.from(new Set(peopleHouseList.map(x => x.buildingID)));

        var resBuilding = [];
        for (let i = 0; i < villageBuildingIDs.length; i++) {
            let buildingID = villageBuildingIDs[i];
            let buildingPeopleHouses = peopleHouseList.filter(x => x.buildingID == buildingID);
            if (buildingPeopleHouses.length > 0) {
                resBuilding.push({
                    buildingNo: buildingPeopleHouses[0].buildingNo,
                    peopleSum: buildingPeopleHouses.length,
                    buildingID: buildingID
                })
            }
        }

        resArea.push({
            name: '',
            buildings: resBuilding
        });


        var resBody = {
            areas: resArea
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getBuildingList = getBuildingList;

var getHouseList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var resAreas = [];
        var peopleHouseList = await peopleHouseDal.getByBuildingID(reqBody.buildingID);
        var houseList = await houseDal.getByBuildingID(reqBody.buildingID);

        var floorList = Array.from(new Set(houseList.map(x => x.floor))).sort();
        for (let i = 0; i < floorList.length; i++) {
            const item = floorList[i];
            var floorHouses = houseList.filter(x => x.floor == item);

            floorHouses = floorHouses.sort(function (a, b) {
                return a.houseNo - b.houseNo;
            });

            var houses = [];
            for (let i = 0; i < floorHouses.length; i++) {
                let floorHouse = floorHouses[i];
                houses.push({
                    houseNo: floorHouse.houseNo,
                    houseID: floorHouse.houseID,
                    houseSum: peopleHouseList.filter(x => x.houseNo == floorHouse.houseNo).length
                })
            }

            if (houses.length > 0) {
                resAreas.push({
                    name: numChinese.numberToChinese(item) + '层',
                    houses: houses
                });
            }

        }

        var resBody = {
            areas: resAreas
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getHouseList = getHouseList;

var getHousePeopleList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var peopleHouseList = await peopleHouseDal.getByHouseID(reqBody.houseID);
        if (peopleHouseList == null || peopleHouseList.length == 0) {
            return res.json(cFun.responseStatus(0, 'success'));
        }

        var peopleIDs = Array.from(new Set(peopleHouseList.map(x => x.peopleID)));

        var peopleList = await peopleDal.getByPeopleIDs(peopleIDs);
        if (peopleList == null || peopleList.length == 0) {
            return res.json(cFun.responseStatus(0, 'success'));
        }

        var resPeoples = [];
        for (let i = 0; i < peopleList.length; i++) {
            let people = peopleList[i];

            var resPeople = {
                name: people.peopleName,
                phone: people.phoneNo,
                cardNo: '',
                photo: people.idPic,
                createTime: people.insertTime,
                birthday: people.birthDate,
                address: people.residenceAddress,
                idCardNo: people.credentialNo,
                ID: people.peopleID
            };

            resPeoples.push(resPeople);
        }

        var resBody = {
            peoples: resPeoples
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getHousePeopleList = getHousePeopleList;

var createCard =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;


        return res.json(cFun.responseStatus(0, 'success'));
    });
module.exports.createCard = createCard;