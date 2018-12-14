const express = require('express')
const router = express.Router()
module.exports = router
const cFun = require('../utils/commonFunc')

const message = require('./message')
router.post('/message/add', message.add)
router.post('/message/update', message.update)
router.post('/message/get', message.get)
router.post('/message/getCount', message.getCount)
router.post('/message/updateValid', message.updateValid)
router.post('/message/updateDelete', message.updateDelete)

const area = require('./area')
router.post('/area/get', area.get)
router.post('/area/addVillage', area.addVillage)
router.post('/area/bulkCreateBuildings', area.bulkCreateBuildings)
router.post('/area/delsVillage', area.delsVillage) //批量删除小区楼栋房屋
router.post('/area/updateVillage', area.updateVillage) //修改小区
router.post('/area/getVillage', area.getVillage) //获取小区
router.post('/area/deleteBuilding', area.deleteBuilding) //删除楼栋以及房屋
router.post('/area/deleteHouse', area.deleteHouse) //删除房屋
router.post('/area/delsBuilding', area.delsBuilding) //批量删除楼栋
router.post('/area/delsHouse', area.delsHouse) //批量删除房屋
router.post('/area/updateHouse', area.updateHouse) //修改房屋
router.post('/area/addBatchHouse', area.addBatchHouse) //添加房屋
router.post('/area/updateBuilding', area.updatebuilding) //修改楼栋
router.post('/area/addFloorbuilding', area.addFloorbuilding) //新增楼层
router.post('/area/addBuilding', area.addBuilding) //添加楼栋
router.post('/area/getBuilding', area.getBuilding) //查看楼栋
router.post('/area/getHouse', area.getHouse) //获取房屋
router.post('/area/getVillageCount', area.getVillageCount) //获取小区楼栋数量
router.post('/area/getVillageLikeName', area.getVillageLikeName) //根据小区名字模糊查询
router.post('/area/getPageVillageIDsList', area.getPageVillageIDsList) //根据小区ID分页获取小区

router.post('/area/getScvList', area.getScvList) //辖区-街道-居委-小区

const parking = require('./parking')
const bikeshed = require('./bikeshed')
const garbage = require('./garbage')
const school = require('./school')
const parkingchannel = require('./parkingchannel')
const faceCar = require('./faceCar')

router.post('/inout/modifyBikeshed', bikeshed.modifyBikeshed)
router.post('/inout/getBikeshedList', bikeshed.getBikeshedList)
router.post('/inout/getBikeshedInfo', bikeshed.getBikeshedInfo)

router.post('/inout/modifyParking', parking.modifyParking)
router.post('/inout/getParkingList', parking.getParkingList)
router.post('/inout/getParkingInfo', parking.getParkingInfo)

router.post('/inout/modifyGarbage', garbage.modifyGarbage)
router.post('/inout/getGarbageList', garbage.getGarbageList)
router.post('/inout/getGarbageInfo', garbage.getGarbageInfo)

router.post('/inout/modifySchool', school.modifySchool)
router.post('/inout/getSchoolList', school.getSchoolList)
router.post('/inout/getSchoolInfo', school.getSchoolInfo)

router.post(
  '/parkingchannel/modifyParkingChannel',
  parkingchannel.modifyParkingChannel
)
router.post(
  '/parkingchannel/getParkingChannelList',
  parkingchannel.getParkingChannelList
)

router.post('/faceCar/modifyface', faceCar.modifyface)
router.post('/faceCar/getfaceList', faceCar.getfaceList)
