const cFun = require('../utils/commonFunc')
const provinceDal = require('../dals/b_provinceDal')
const cityDal = require('../dals/b_cityDal')
const districtDal = require('../dals/b_districtDal')
const streetDal = require('../dals/b_streetDal')
const committeeDal = require('../dals/b_committeeDal')
const villageDal = require('../dals/b_villageDal')
const VillageEntity = require('../entitys/b_villageEntity')
const buildingDal = require('../dals/b_buildingDal')
const houseDal = require('../dals/b_houseDal')
const BuildingEntity = require('../entitys/b_buildingEntity')
const HouseEntity = require('../entitys/b_houseEntity')
const authorityEntity = require('../entitys/s_authorityEntity')
const authorityDal = require('../dals/s_authorityDal')
const userDal = require('../dals/s_userDal')
const token = require('../user/token')
const redisKey = require('../utils/redisKey');
const redis = require('blueplus-redis');
var get = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body

  //获取所有小区
  if (!cFun.isNullOrEmpty(reqBody.committeeID)) {
    var villages = await villageDal.getByCommitteeID(reqBody.committeeID)
    return res.json(
      cFun.responseStatus(0, 'success', {
        villages: villages
      })
    )
  }

  //获取所有居委
  if (!cFun.isNullOrEmpty(reqBody.streetID)) {
    var committees = await committeeDal.getByStreetID(reqBody.streetID)
    return res.json(
      cFun.responseStatus(0, 'success', {
        committees: committees
      })
    )
  }

  //获取所有街道
  if (!cFun.isNullOrEmpty(reqBody.districtID)) {
    var streets = await streetDal.getByDistrictID(reqBody.districtID)
    return res.json(
      cFun.responseStatus(0, 'success', {
        streets: streets
      })
    )
  }

  //获取所有区
  if (!cFun.isNullOrEmpty(reqBody.cityID)) {
    var districts = await districtDal.getByCityID(reqBody.cityID)
    return res.json(
      cFun.responseStatus(0, 'success', {
        districts: districts
      })
    )
  }

  //获取所有城市
  if (!cFun.isNullOrEmpty(reqBody.provinceID)) {
    var citys = await cityDal.getByProvinceID(reqBody.provinceID)
    return res.json(
      cFun.responseStatus(0, 'success', {
        citys: citys
      })
    )
  }

  //获取所有省份
  if (
    cFun.isNullOrEmpty(reqBody.provinceID) &&
    cFun.isNullOrEmpty(reqBody.cityID) &&
    cFun.isNullOrEmpty(reqBody.districtID) &&
    cFun.isNullOrEmpty(reqBody.streetID) &&
    cFun.isNullOrEmpty(reqBody.committeeID) &&
    cFun.isNullOrEmpty(reqBody.villageID)
  ) {
    var provinces = await provinceDal.getAll()
    return res.json(
      cFun.responseStatus(0, 'success', {
        provinces: provinces
      })
    )
  }
})
module.exports.get = get
var addVillage = cFun.awaitHandlerFactory(async (req, res, next) => {
  let userID = token.decryptUserID(req.body.userID)
  var userEntity = await userDal.getByID(userID)
  if (userEntity == null) {
    return res.json(cFun.responseStatus(-1, '不存在用户'))
  }
  var vill = await villageDal.query(
    "select * from b_village where committeeID='" +
    req.body.committeeID +
    " ' GROUP BY villageNo DESC limit 1"
  )
  // let villArr = []
  // let villinfo = vill
  let num = vill.map(v => v.villageNo)
  // })
  // villArr.sort((a, b) => b - a)
  // let villno = villArr[0]
  // let num = villno.slice(villno.length - 3)
  var village = new VillageEntity()
  village.villageID = cFun.guid()
  village.districtID = req.body.districtID
  village.streetID = req.body.streetID
  village.committeeID = req.body.committeeID
  village.name = req.body.name
  village.address = req.body.address
  village.longitude = req.body.longitude
  village.latitude = req.body.latitude
  village.peopleCount = req.body.peopleCount
  village.fence = req.body.fence
  village.villageNo = parseInt(num[0]) + 1
  village.parkingCount = req.body.parkingCount
  village.picUrl = req.body.picUrl
  await villageDal.insert(village)
  var authorityEntitys = new authorityEntity()
  authorityEntitys.authorityID = cFun.guid()
  authorityEntitys.urType = 0
  authorityEntitys.urID = userID
  authorityEntitys.areaCode = village.villageNo
  authorityEntitys.areaName = req.body.areaName
  await authorityDal.insert(authorityEntitys)
  var userAuthorityVillageInfoKey = redisKey.userAuthorityVillageInfos(userID);
  redis.del(userAuthorityVillageInfoKey);
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.addVillage = addVillage

var bulkCreateBuildings = cFun.awaitHandlerFactory(async (req, res, next) => {
  //批量建楼栋
  var reqBody = req.body
  var buildings = []
  var houses = []
  let errorInfo = { buildingError: [], housesError: [] }
  let buildingError = []
  let housesError = []
  var buildingNum = await buildingDal.query(
    "select * from b_building GROUP BY buildingNo+'" + 0 + "' desc limit 1"
  )
  let num = buildingNum.map(v => v.buildingNo)
  let numNo = parseInt(num[0])
  if (reqBody.buildingNos.length <= 0 || reqBody.floorTotals.length <= 0) {
    return res.json(cFun.responseStatus(-1, '关键字段为空'))
  }
  for (const itemBuilding of reqBody.buildingNos) {
    let buildingIsNo = await buildingDal.buildingIsNo(
      itemBuilding,
      reqBody.villageID
    )
    if (!buildingIsNo) {
      let building = new BuildingEntity()
      building.buildingID = cFun.guid()
      building.villageID = reqBody.villageID
      building.name = itemBuilding + '号楼'
      numNo++
      building.buildingNo =numNo   //88
      
      building.floorTotal = reqBody.floorTotals.length
      building.houseTotal =
        Number(reqBody.floorTotals.length) * Number(reqBody.floorHouseTotal)
      building.latitude = 0
      building.longitude = 0
      buildings.push(building)
      for (const itemfloor of reqBody.floorTotals) {
        let floorIsNo = await houseDal.floorIsNo(itemfloor, building.buildingID)
        if (!floorIsNo) {
          for (let h = 1; h <= reqBody.floorHouseTotal; h++) {
            let house = new HouseEntity()
            house.houseID = cFun.guid()
            house.buildingID = building.buildingID
            house.buildingNo = building.buildingNo
            house.houseNo = getHouseNo(reqBody.houseName, itemfloor, h)
            // house.houseLabel = reqBody.houseLabel;
            // house.type = reqBody.houseType;
            // house.houseUse = reqBody.houseUse;
            // house.peopleNumber = reqBody.peopleNumber;
            house.floor = itemfloor
            houses.push(house)
          }
        } else {
          housesError.push(floorIsNo)
        }
      }
    } else {
      buildingError.push(itemBuilding)
    }
  }
  errorInfo.buildingError = buildingError
  errorInfo.housesError = housesError
  buildingDal.insertList(buildings)
  houseDal.insertList(houses)
  /**
     * 楼栋名称规则 
     * eg:  田林12村A<101>楼
     * 
     * <> 中
     * 1.不能带中文
     * 2.第一位和最后一位必须是数字
     */

  /**
     * 楼层名称规则 
     * 1.必须是数字，不能带中文
     * 
     */

  /**
     * 房屋名称规则 
     * 1.不能带中文
     * 2.第一位和最后一位必须是数字
     * 
     */

  // for (let i = 1; i <= reqBody.buildingTotal; i++) {
  //     let building = new BuildingEntity();
  //     building.buildingID = cFun.guid();
  //     building.villageID = reqBody.villageID;
  //     building.name = getBuildingName(reqBody.buildingName, reqBody.buildingTotal, i);
  //     building.buildingNo = getBuildingNo(reqBody.buildingName, reqBody.buildingTotal, i);
  //     building.floorTotal = reqBody.floorTotal;
  //     building.houseTotal = reqBody.floorTotal * reqBody.floorHouseTotal;
  //     building.latitude = 0;
  //     building.longitude = 0;
  //     buildings.push(building);

  //     for (let f = 1; f <= reqBody.floorTotal; f++) {

  //         for (let h = 1; h <= reqBody.floorHouseTotal; h++) {
  //             let house = new HouseEntity();
  //             house.houseID = cFun.guid();
  //             house.buildingID = building.buildingID;
  //             house.buildingNo = building.buildingNo;
  //             house.houseNo = getHouseNo(reqBody.houseName, f, h);
  //             house.houseLabel = reqBody.houseLabel;
  //             house.type = reqBody.houseType;
  //             house.houseUse = reqBody.houseUse;
  //             // house.peopleNumber = reqBody.peopleNumber;
  //             house.floor = f;
  //             houses.push(house);

  //         }

  //     }
  // }

  // buildingDal.insertList(buildings);
  // houseDal.insertList(houses);

  return res.json(cFun.responseStatus(0, 'success', { errorInfo: errorInfo }))
})
module.exports.bulkCreateBuildings = bulkCreateBuildings

var getBuildingName = function (buildingName, buildingTotal, currentBuildingNo) {
  let arrs = _.split(buildingName, '<')
  let arr2s = _.split(arrs[1], '>')

  return arrs[0] + currentBuildingNo + arr2s[1]
}

var getBuildingNo = function (buildingName, buildingTotal, currentBuildingNo) {
  let arrs = _.split(buildingName, '<')
  let arr2s = _.split(arrs[1], '>')

  return currentBuildingNo
}

var getHouseNo = function (houseName, currentFloorNo, currentHouseNo) {
  if (houseName.length == 2) {
    return currentFloorNo + currentHouseNo
  }

  if (houseName.length == 1) {
    return currentHouseNo
  }

  return (
    currentFloorNo + houseName.substr(1, houseName.length - 2) + currentHouseNo
  )
}

var delsVillage = cFun.awaitHandlerFactory(async (req, res, next) => {
  //删除小区
  var reqBody = req.body
  var buildingIDs = await buildingDal.getByVillageIDs(reqBody.villageIDs) //根据小区ID获取所有楼栋id
  for (const buildingInfo of buildingIDs) {
    var houseDel = await houseDal.deleteByBuildingID(buildingInfo.buildingID) //根据楼栋id删除所有房屋
    var buildingDel = await buildingDal.delete(buildingInfo.buildingID) //根据小区id删除楼栋
    // }
  }
  await villageDal.deletes(reqBody.villageIDs) //根据小区id删除
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.delsVillage = delsVillage

var updateVillage = cFun.awaitHandlerFactory(async (req, res, next) => {
  //修改小区
  var reqBody = req.body

  let villageInfo = await villageDal.getByVillageID(reqBody.villageID)
  if (villageInfo == null) {
    return res.json(cFun.responseStatus(2, '小区不存在！'))
  }
  // villageInfo.districtID = reqBody.districtID;
  // villageInfo.streetID = reqBody.streetID;
  // villageInfo.committeeID = reqBody.committeeID;
  villageInfo.name = reqBody.name
  villageInfo.address = reqBody.address
  villageInfo.longitude = reqBody.longitude
  villageInfo.latitude = reqBody.latitude
  villageInfo.picUrl = reqBody.picUrl
  villageInfo.fence = reqBody.fence
  villageDal.update(villageInfo)
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.updateVillage = updateVillage

var updatebuilding = cFun.awaitHandlerFactory(async (req, res, next) => {
  //修改楼栋
  var reqBody = req.body

  let buildingInfo = await buildingDal.getByID(reqBody.buildingID)
  if (buildingInfo == null) {
    return res.json(cFun.responseStatus(2, '楼栋不存在！'))
  }
  buildingInfo.name = reqBody.buildingName
  buildingInfo.buildingNo = reqBody.buildingNo
  // buildingInfo.floorTotal = reqBody.floorTotal;
  // buildingInfo.houseTotal = reqBody.houseTotal;
  buildingInfo.latitude = 0
  buildingInfo.longitude = 0
  buildingDal.update(buildingInfo)
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.updatebuilding = updatebuilding

var addBuilding = cFun.awaitHandlerFactory(async (req, res, next) => {
  //添加楼栋
  var reqBody = req.body
  var buildings = []
  var houses = []

  reqBody.buildingTotal = 1
  for (let i = 1; i <= reqBody.buildingTotal; i++) {
    //创建楼栋
    let building = new BuildingEntity()
    building.buildingID = cFun.guid()
    building.villageID = reqBody.villageID
    building.name = reqBody.buildingName
    building.buildingNo = reqBody.buildingNo
    building.floorTotal = reqBody.floorTotal
    building.houseTotal = reqBody.floorTotal * reqBody.houseTotal
    building.latitude = 0
    building.longitude = 0
    buildings.push(building)
    for (let f = 1; f <= reqBody.floorTotal; f++) {
      //循环楼层
      for (let h = 1; h <= reqBody.houseTotal; h++) {
        //创建房屋
        let house = new HouseEntity()
        house.houseID = cFun.guid()
        house.buildingID = building.buildingID
        house.buildingNo = building.buildingNo
        house.houseNo = getHouseNo(reqBody.houseName, f, h)
        house.houseLabel = reqBody.houseLabel
        house.type = reqBody.houseType
        house.houseUse = reqBody.houseUse
        // house.peopleNumber = reqBody.peopleNumber;
        house.floor = f
        houses.push(house)
      }
    }
  }

  buildingDal.insertList(buildings)
  houseDal.insertList(houses)
  // building.buildingID = cFun.guid();
  // building.villageID = reqBody.villageID;
  // building.name = reqBody.buildingName;
  // building.buildingNo = reqBody.buildingNo;
  // building.floorTotal = reqBody.floorTotal;
  // building.houseTotal = reqBody.houseTotal;
  // building.latitude = 0;
  // building.longitude = 0;
  // buildingDal.insert(building);
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.addBuilding = addBuilding

var getBuilding = cFun.awaitHandlerFactory(async (req, res, next) => {
  //获取楼栋
  var reqBody = req.body
  let uid = cFun.guid()
  var buildings = await buildingDal.getByPage(
    Number(reqBody.pageNum),
    Number(reqBody.pageSize),
    reqBody.villageID
  )
  let buidingAll = []
  for (const buildingList of buildings) {
    let house = await houseDal.getByBuildingID(buildingList.buildingID)
    let houseNum = house.length
    let floor = await houseDal.getByBuildingIDFloor(buildingList.buildingID)
    let floorNum = floor.length
    buidingAll.push({
      houseNum: houseNum,
      floorNum: floorNum,
      buildingID: buildingList.buildingID,
      insertTime: buildingList.insertTime,
      name: buildingList.name,
      buildingNo: buildingList.buildingNo,
      villageID: buildingList.villageID
    })
  }

  if (buildings == null || buildings.length == 0) {
    return res.json(cFun.responseStatus(0, '无数据'))
  }
  var buildingCount = await buildingDal.count(reqBody.villageID)
  return res.json(
    cFun.responseStatus(0, 'success', {
      buildings: buidingAll,
      buildingCount: buildingCount
    })
  )
})
module.exports.getBuilding = getBuilding

var getVillage = cFun.awaitHandlerFactory(async (req, res, next) => {
  //获取小区
  var reqBody = req.body
  var villagelists = await villageDal.getByStreetIDvillage(reqBody.streetID)
  return res.json(
    cFun.responseStatus(0, 'success', {
      villagelists: villagelists
    })
  )
})
module.exports.getVillage = getVillage

var getPageVillageIDsList = cFun.awaitHandlerFactory(async (req, res, next) => {
  //根据小区ID获取小区
  var reqBody = req.body
  var villagelists = null
  var count = await villageDal.getByVillageIDs(reqBody.villageIDs)
  if (reqBody.pageNum && reqBody.pageSize) {
    villagelists = await villageDal.getPageByVillagIDs(
      reqBody.villageIDs,
      Number(reqBody.pageNum),
      Number(reqBody.pageSize)
    )
  } else {
    villagelists = await villageDal.getByVillageIDs(reqBody.villageIDs)
  }
  if (villagelists == null || villagelists.length <= 0) {
    return res.json(cFun.responseStatus(-1, '无数据'))
  }
  return res.json(
    cFun.responseStatus(0, 'success', {
      villagelists: villagelists,
      count: count.length
    })
  )
})
module.exports.getPageVillageIDsList = getPageVillageIDsList

var getVillageCount = cFun.awaitHandlerFactory(async (req, res, next) => {
  //获取小区楼栋数量
  var reqBody = req.body
  let VillageHouseCount = 0
  let VillageHouseOutCount = 0
  let VillageHouseOwnCount = 0
  let VillageHouseXzCount = 0
  let VillageBuildingCount = 0
  VillageBuildingCount = await buildingDal.getBybuno(reqBody.villageID)
  VillageHouseCount = await houseDal.getByHouses(reqBody.villageID)
  VillageHouseOutCount = await houseDal.getByHousesOut(reqBody.villageID)
  VillageHouseOwnCount = await houseDal.getByHousesOwn(reqBody.villageID)
  VillageHouseXzCount = await houseDal.getByHousesXz(reqBody.villageID)
  let VillageCounts = {
    VillageBuildingCount: VillageBuildingCount, //小区楼栋数量
    VillageHouseCount: VillageHouseCount, //小区房屋数量
    VillageHouseOutCount: VillageHouseOutCount, //小区房屋租赁数量
    VillageHouseOwnCount: VillageHouseOwnCount, //小区房屋自主数量
    VillageHouseXzCount: VillageHouseXzCount //小区闲置数量
  }
  return res.json(
    cFun.responseStatus(0, 'success', {
      VillageCounts: VillageCounts
    })
  )
})
module.exports.getVillageCount = getVillageCount

var deleteBuilding = cFun.awaitHandlerFactory(async (req, res, next) => {
  //删除楼栋
  var reqBody = req.body
  let buildingHouseDel = await houseDal.deleteByBuildingID(reqBody.buildingID) //根据楼栋id删除所有房屋
  let buildingDel = await buildingDal.delete(reqBody.buildingID) //根据楼栋id删除
  if (buildingHouseDel <= 0 || buildingDel <= 0) {
    return res.json(cFun.responseStatus(2, '删除失败！'))
  }
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.deleteBuilding = deleteBuilding

var deleteHouse = cFun.awaitHandlerFactory(async (req, res, next) => {
  //删除房屋
  var reqBody = req.body
  if (reqBody.houseID.length > 0) {
    var houseDel = await houseDal.deleteByBuildingID(reqBody.houseID) //根据id删除房屋
    return res.json(cFun.responseStatus(0, 'success'))
  }
  return res.json(cFun.responseStatus(-2, '参数有误！'))
})
module.exports.deleteHouse = deleteHouse

var updateHouse = cFun.awaitHandlerFactory(async (req, res, next) => {
  //修改房屋
  var reqBody = req.body

  let houseInfo = await houseDal.getByHouseID(reqBody.houseID)
  if (houseInfo == null) {
    return res.json(cFun.responseStatus(2, '返回异常'))
  }
  houseInfo.houseNo = reqBody.houseNo
  houseInfo.houseLabel = reqBody.houseLabel
  houseInfo.floor = reqBody.floor
  houseInfo.peopleNumber = reqBody.peopleNumber
  houseInfo.houseUse = reqBody.houseUse
  houseInfo.type = reqBody.type
  houseInfo.houseSquare = reqBody.houseSquare
  houseDal.update(houseInfo)
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.updateHouse = updateHouse

var addBatchHouse = cFun.awaitHandlerFactory(async (req, res, next) => {
  //批量添加房屋
  var reqBody = req.body
  // let floor = await houseDal.getByFloor(reqBody.floor);
  // if (floor) {
  //     return res.json(cFun.responseStatus(-2, '楼层已存在！'));
  // }
  for (const item of reqBody.houseList) {
    let house = new HouseEntity()
    house.houseID = cFun.guid()
    house.buildingID = item.buildingID
    house.buildingNo = item.buildingNo
    house.houseNo = item.houseNo
    house.houseLabel = item.houseLabel
    house.houseUse = item.houseUse
    house.floor = item.floor
    house.type = item.type
    house.houseSquare = item.houseSquare
    house.peopleNumber = item.peopleNumber
    houseDal.insert(house)
  }
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.addBatchHouse = addBatchHouse

var getHouse = cFun.awaitHandlerFactory(async (req, res, next) => {
  //获取房屋
  var reqBody = req.body
  var houselists = await houseDal.getByBuildingID(reqBody.buildingID)
  return res.json(
    cFun.responseStatus(0, 'success', {
      houselists: houselists
    })
  )
})
module.exports.getHouse = getHouse

var delsBuilding = cFun.awaitHandlerFactory(async (req, res, next) => {
  //批量删除楼栋
  var reqBody = req.body

  for (const key of reqBody.buildingIDs) {
    var building = await buildingDal.getByID(key) //根据楼栋ID查看是否存在
    if (building == null) {
      return res.json(cFun.responseStatus(1, '楼栋为空！'))
    } else {
      let buildingDels = await buildingDal.delete(key) //根据楼栋id删除楼栋
      let buildingHouseDels = await houseDal.deleteByBuildingID(key) //根据楼栋id删除房屋
      if (buildingHouseDels <= 0 || buildingDels <= 0) {
        return res.json(cFun.responseStatus(2, '删除失败！'))
      }
    }
  }
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.delsBuilding = delsBuilding

var delsHouse = cFun.awaitHandlerFactory(async (req, res, next) => {
  //批量删除房屋
  var reqBody = req.body
  var houseIDs = reqBody.houseIDs //获取楼栋所有ID数组
  for (const key1 of houseIDs) {
    var BuildingsIDs = await houseDal.delete(key1) //根据楼栋ID删除
  }
  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.delsHouse = delsHouse

var addFloorbuilding = cFun.awaitHandlerFactory(async (req, res, next) => {
  //添加楼层
  var reqBody = req.body
  let building = await buildingDal.getByID(reqBody.buildingID)
  if (!building) {
    return res.json(cFun.responseStatus(2, '楼栋不存在！'))
  }
  // building.floorTotal = reqBody.floorTotal;
  // building.houseTotal = reqBody.floorTotal * reqBody.houseTotal;
  // buildings.push(building);
  reqBody.floorTotal = 1
  for (let f = 1; f <= reqBody.floorTotal; f++) {
    //循环楼层
    for (let h = 1; h <= reqBody.floorHouseTotal; h++) {
      //创建房屋
      let house = new HouseEntity()
      house.houseID = cFun.guid()
      house.buildingID = building.buildingID
      house.buildingNo = building.buildingNo
      house.houseNo = getHouseNo(reqBody.houseName, f, h)
      house.houseLabel = reqBody.houseLabel
      house.type = reqBody.houseType
      house.houseUse = reqBody.houseUse
      // house.peopleNumber = reqBody.peopleNumber;
      house.floor = f
      houses.push(house)
    }
  }

  buildingDal.update(buildings)
  houseDal.insertList(houses)

  return res.json(cFun.responseStatus(0, 'success'))
})
module.exports.addFloorbuilding = addFloorbuilding

var getVillageLikeName = cFun.awaitHandlerFactory(async (req, res, next) => {
  //根据小区名称模糊搜索

  var reqBody = req.body

  var villagelists = await villageDal.getVillageLikeName(
    reqBody.villageName,
    reqBody.villageID
  )
  return res.json(
    cFun.responseStatus(0, 'success', {
      villagelists: villagelists
    })
  )
})
module.exports.getVillageLikeName = getVillageLikeName

var getScvList = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body
  let committees = null
  let streets = null
  let villages = null

  if (cFun.isNullOrEmpty(reqBody.districtID)) {
    return res.json(cFun.responseStatus(-1, '辖区为空！'))
  }

  //根据辖区获取所有街道
  streets = await streetDal.getByDistrictIDs(reqBody.districtID)

  for (const itemStreet of streets) {
    committees = await committeeDal.getByStreetID(itemStreet.streetID)
    for (const itemCommittees of committees) {
      villages = await villageDal.getByCommitteeID(itemCommittees.committeeID)
      itemCommittees.pinyin = villages
    }
    itemStreet.pinyin = committees
  }
  //根据街道获取所有的居委
  // committees = await committeeDal.getByStreetIDs(_.map(streets, x => x.streetID));
  // //根据居委获取所有小区
  // villages = await villageDal.getByCommitteeIDs(_.map(committees, x => x.committeeID));
  return res.json(
    cFun.responseStatus(0, 'success', {
      villages: streets
    })
  )
})
module.exports.getScvList = getScvList
