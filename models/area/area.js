var cFun = require('../utils/commonFunc');
var buildingDal = require('../dals/b_buildingDal');
var peopleHouseDal = require('../dals/p_people_houseDal');
var peopleDal = require('../dals/p_peopleDal');
const parkingDal = require('../dals/e_parkingDal');
const houseDal = require('../dals/b_houseDal');
const accessLogDal = require('../dals/e_access_logDal');
const deviceDal = require('../dals/e_deviceDal');
const resourceDal = require('../dals/s_resourceDal');
const bikeshedDal = require('../dals/e_bikeshedDal');
const cameraDal = require('../dals/e_cameraDal');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');
const verifyAuthority = require('../authority/verifyAuthority');

var getBuildingList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var buildingList = await buildingDal.getByVillageIDs(reqBody.villageIDs);
        if (buildingList == null || buildingList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关信息'));
        }

        var resBody = {
            buildingList: buildingList
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getBuildingList = getBuildingList;

var getBuildingPeopleCount =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var peopleHouseList = await peopleHouseDal.getByBuildingID(reqBody.buildingID);
        if (peopleHouseList == null || peopleHouseList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关信息'));
        }

        var houseTotal = Array.from(new Set(peopleHouseList.map(x => x.houseNo))).length;
        var peopleTotal = peopleHouseList.length;
        var agedTotal = peopleHouseList.filter(x => x.isAged == 1).length;
        var childTotal = peopleHouseList.filter(x => x.isChildren == 1).length;
        var careTotal = peopleHouseList.filter(x => x.isCare == 1).length;
        var focusTotal = peopleHouseList.filter(x => x.isFocus == 1).length;

        var resBody = {
            peopleInfo: {
                houseTotal: houseTotal,
                peopleTotal: peopleTotal,
                agedTotal: agedTotal,
                childTotal: childTotal,
                careTotal: careTotal,
                focusTotal: focusTotal

            }
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getBuildingPeopleCount = getBuildingPeopleCount;

var getBuildingPeopleInfo =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        //获取用户权限
        var userFunctions = await redis.getAsync(redisKey.userAuthorityFunctions(reqBody.head.userID));

        var houseList = []; //房屋
        var houseNos = [];
        if (reqBody.houseNos != null && reqBody.houseNos.length > 0) {

            houseNos = Array.from(new Set(houseNos.concat(reqBody.houseNos)));

            houseList = await houseDal.getByBuildingIDHouseNo(reqBody.buildingID, houseNos);
            if (houseList == null || houseList.length == 0) {
                return res.json(cFun.responseStatus(-1, '楼栋信息不正确'));
            }
        } else {
            if (reqBody.floorNos != null && reqBody.floorNos.length > 0) {
                houseList = await houseDal.getByBuildingIDAndFloorNos(reqBody.buildingID, reqBody.floorNos);
                if (houseList == null || houseList.length == 0) {
                    return res.json(cFun.responseStatus(-1, '楼栋信息不正确'));
                }

                houseNos = houseNos.concat(houseList.map(x => x.houseNo));
            } else {
                //楼栋号 房屋号均为空
                houseList = await houseDal.getByBuildingID(reqBody.buildingID);
                if (houseList == null || houseList.length == 0) {
                    return res.json(cFun.responseStatus(-1, '楼栋信息不正确'));
                }

                houseNos = houseList.map(x => x.houseNo);
            }
        }


        var peopleList = await peopleDal.getByBuildingIDHouseNos(reqBody.buildingID, houseNos);
        if (peopleList == null || peopleList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关信息'));
        }

        //获取peoplePicUrl
        var villageResources = await resourceDal.getByBusinessIDs('peoplePic', 'url', [peopleList[0].villageID]);
        var peoplePicUrl = '';
        if (villageResources != null && villageResources.length > 0) {
            peoplePicUrl = villageResources[0].filePath;
        } else {
            var resources = await resourceDal.getBusinessType('peoplePic');
            peoplePicUrl = resources[0].filePath;
        }

        var resPeopleList = [];
        for (let i = 0; i < peopleList.length; i++) {
            const element = peopleList[i];
            let house = houseList.filter(x => cFun.removeSpace(x.houseNo) ==
                cFun.removeSpace(element.houseNo))[0];

            resPeopleList.push({
                peopleID: element.peopleID,
                name: cFun.maskPeopleName(element.peopleName, verifyAuthority.viewPeopleName(userFunctions)),
                sex: element.gender,
                age: cFun.getAge(element.birthDate),
                phoneNo: element.phoneNo,
                floorNo: house == null ? '' : house.floor,
                houseNo: element.houseNo,
                relation: element.relationshipWithHouseHold == 1 ||
                    element.relationshipWithHouseHold == 2 ? 1 : 0,
                headPic: cFun.isNullOrEmpty(element.headPic) ? '' : (peoplePicUrl + element.headPic),
                lastOpenDoorTime: cFun.formatDateTime(element.lastOpenDoorTime)
            })
        }

        var resBody = {
            peopleList: resPeopleList
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getBuildingPeopleInfo = getBuildingPeopleInfo;


var getParkingList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var parkingList = await parkingDal.getByVillageIDs(reqBody.villageIDs);
        if (parkingList == null || parkingList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有停车场'));
        }

        var resParkingList = [];
        for (let i = 0; i < parkingList.length; i++) {
            let parking = parkingList[i];
            resParkingList.push({
                parkingID: parking.parkingID,
                name: parking.name,
                longitude: parking.longitude,
                latitude: parking.latitude,
                type: parking.type
            })
        }

        var resBody = {
            parkingList: resParkingList
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getParkingList = getParkingList;

var getPeoplePass =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var peoples = await peopleDal.getByPeopleIDs(reqBody.peopleIDs);
        if (peoples == null || peoples.length == 0) {
            return res.json(cFun.responseStatus(-1, '不存在相关人员信息'));
        }


        var resDatas = [];
        for (let i = 0; i < peoples.length; i++) {
            let people = peoples[i];

            if (people.credentialNo != null && people.credentialType != null &&
                people.credentialNo != '' && people.credentialType != '') {
                var passSum = await accessLogDal.getPassCount(people.credentialNo, people.credentialType);
                if (passSum > 0) {
                    var data = {
                        peopleID: people.peopleID,
                        passSum: passSum
                    };

                    var latest = await accessLogDal.getLatest(people.credentialNo, people.credentialType);
                    var accessDeviceIDs = await accessLogDal.getPassAccess(people.credentialNo, people.credentialType);

                    if (latest != null) {
                        data.lastPassTime = latest.openTime;
                    }

                    if (accessDeviceIDs != null) {
                        var devices = await deviceDal.getByDeviceIDs(accessDeviceIDs.map(x => x.deviceID));
                        data.accessName = devices.map(x => x.name);
                    }

                    resDatas.push(data);
                }
            }
        }


        var resBody = {
            datas: resDatas
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });

module.exports.getPeoplePass = getPeoplePass;

var getBikeshedList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var bikeshedList = await bikeshedDal.getByVillageIDs(reqBody.villageIDs);
        if (bikeshedList == null || bikeshedList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有车棚'));
        }



        var resBikeshedList = [];
        for (let i = 0; i < bikeshedList.length; i++) {
            let bikeshed = bikeshedList[i];

            var cameraInfos = [];
            if (!cFun.isNullOrEmpty(bikeshed.cameraIDs)) {
                let cameraIDs = cFun.jsonTryParse(bikeshed.cameraIDs);

                if (cameraIDs != null && cameraIDs.length > 0) {
                    let cameras = await cameraDal.getByCameraIDs(cameraIDs);
                    let devices = await deviceDal.getByDeviceIDs(cameras.map(x => x.deviceID));

                    for (let j = 0; j < cameraIDs.length; j++) {
                        let camera = cameras.filter(x => x.cameraID == cameraIDs[j])[0];
                        let device = devices.filter(x => x.deviceID == camera.deviceID)[0];
                        if (device == null) {
                            continue;
                        }

                        var cameraInfo = {
                            deviceID: device.deviceID,
                            cameraID: camera.cameraID,
                            streamSource: camera.streamSource,
                            name: device.name
                        }

                        cameraInfos.push(cameraInfo);
                    }
                }
            }


            resBikeshedList.push({
                bikeshedID: bikeshed.bikeshedID,
                villageID: bikeshed.villageID,
                longitude: bikeshed.longitude,
                latitude: bikeshed.latitude,
                type: bikeshed.type,
                name: bikeshed.name,
                gisArea: bikeshed.gisArea,
                cameras: cameraInfos,
            });
        }

        var resBody = {
            bikesheds: resBikeshedList
        };
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getBikeshedList = getBikeshedList;