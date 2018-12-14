const dbConnection = require('../dbConnection')
const Sequelize = require('sequelize')
const Op = dbConnection.Op
const b_committee = require('blueplus-dals').b_committeeDal.b_committee
const b_street = require('blueplus-dals').b_streetDal.b_street
const cFun = require('../utils/commonFunc')
const b_village = require('blueplus-dals').b_villageDal.b_village

module.exports.insert = require('blueplus-dals').b_villageDal.insert
module.exports.update = require('blueplus-dals').b_villageDal.update
module.exports.delete = require('blueplus-dals').b_villageDal.delete

module.exports.getByStreetIDvillage = function(streetID) {
  //根据街道查询所有的小区
  return b_village.findAll({
    where: {
      streetID: streetID
    }
  })
}
module.exports.getByVillageName = function(villageID) {
  return b_village.find({
    attributes: ['name'],
    where: {
      villageID: villageID
    }
  })
}

module.exports.deletes = function(villageID) {
  return b_village.destroy({
    where: {
      villageID: {
        [Op.in]: villageID
      }
    }
  })
}

module.exports.getVillageLikeName = function(villageName, villageID) {
  return b_village.findAll({
    where: {
      name: {
        [Op.like]: '%' + villageName + '%'
      },
      villageID: {
        [Op.in]: villageID
      }
    }
  })
}

module.exports.getByVillageID = function(villageID) {
  return b_village.find({
    where: {
      villageID: villageID
    }
  })
}

module.exports.getByCommitteeID = function(committeeID) {
  return b_village.findAll({
    where: {
      committeeID: committeeID
    }
  })
}
module.exports.getByCommitteeIDs = function(committeeIDs) {
  return b_village.findAll({
    where: {
      committeeID: {
        [Op.in]: committeeIDs
      }
    }
  })
}
module.exports.getByVillageIDs = function(villageIDs) {
  return b_village.findAll({
    where: {
      villageID: {
        [Op.in]: villageIDs
      }
    },
    order: [['insertTime', 'DESC']]
  })
}

module.exports.getByVillageNo = function(villageNo) {
  return b_village.find({
    where: {
      villageNo: villageNo
    }
  })
}

module.exports.getPageByVillagIDs = function(villageIDs, pageNum, pageSize) {
  var sql = `
        select * from b_village where villageID in(:villageIDs)
      order by insertTime desc limit :startIndex,:pageSize 
    `

  var replacements = {
    startIndex: (pageNum - 1) * pageSize,
    pageSize: pageSize,
    villageIDs: villageIDs
  }

  return querys(sql, replacements)
}
module.exports.getByVillageNos = function(villageNos) {
  return b_village.findAll({
    where: {
      villageNo: {
        [Op.in]: villageNos
      }
    }
  })
}

module.exports.getByCommitteeCodes = function(committeeCodes) {
  return b_village.findAll(
    {
      include: [
        {
          model: b_committee,
          required: true,
          where: {
            committeeNo: committeeCodes
          }
        }
      ]
    },
    {
      raw: true
    }
  )
}

module.exports.getByStreetCodes = function(streetNos) {
  return b_village.findAll(
    {
      include: [
        {
          model: b_street,
          required: true,
          where: {
            streetNo: streetNos
          }
        }
      ]
    },
    {
      raw: true
    }
  )
}

module.exports.query = function(queryString, replacements) {
  return dbConnection.query(queryString, {
    replacements: replacements,
    type: Sequelize.QueryTypes.SELECT
  })
}

var querys = function(queryString, replacements) {
  return dbConnection.query(queryString, {
    replacements: replacements,
    type: Sequelize.QueryTypes.SELECT
  })
}
module.exports.querys = querys
