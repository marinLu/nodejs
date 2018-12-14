const dbConnection = require('../dbConnection');
const Sequelize = require('sequelize');
const Op = dbConnection.Op;
const cFun = require('../utils/commonFunc');
const e_cameraDal = require("./e_cameraDal");
const e_AccessDal = require("./e_accessDal")

var e_device = dbConnection.define('e_device', {
    deviceID: {
        type: Sequelize.CHAR,
        primaryKey: true,
        allowNull: false
    },
    streetID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    committeeID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    villageID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    buildingID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    houseID: {
        type: Sequelize.CHAR,
        allowNull: true
    },
    ioID: {
        type: Sequelize.CHAR,
        allowNull: false
    },
    addNo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    path: {
        type: Sequelize.STRING,
        allowNull: true
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    longitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    latitude: {
        type: Sequelize.STRING,
        allowNull: true
    },
    installAdd: {
        type: Sequelize.STRING,
        allowNull: true
    },
    prducetBrand: {
        type: Sequelize.STRING,
        allowNull: true
    },
    productModel: {
        type: Sequelize.STRING,
        allowNull: true
    },
    productCode: {
        type: Sequelize.STRING,
        allowNull: true
    },
    manufactorName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    deviceImage: {
        type: Sequelize.STRING,
        allowNull: true
    },
    sceneImage: {
        type: Sequelize.STRING,
        allowNull: true
    },
    state: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    stateTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('stateTime'));
        }
    },
    isDisable: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    isDelete: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    deviceParams: {
        type: Sequelize.STRING,
        allowNull: true
    },
    installTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('installTime'));
        }
    },
    expireTime: {
        type: Sequelize.DATE,
        allowNull: true,
        get() {
            return cFun.formatDateTime(this.getDataValue('expireTime'));
        }
    },
    insertTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
    updateTime: {
        type: Sequelize.DATE,
        allowNull: true
    },
}, {
    freezeTableName: true,
    tableName: 'e_device',
    timestamps: false
});


module.exports.insert = function (data) {
    return e_device.create({
        deviceID: cFun.guid(),
        streetID: data.streetID,
        committeeID: data.committeeID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        houseID: data.houseID,
        ioID: data.ioID,
        addNo: data.addNo,
        name: data.name,
        code: data.code,
        path: data.path,
        type: data.type,
        longitude: data.longitude,
        latitude: data.latitude,
        installAdd: data.installAdd,
        prducetBrand: data.prducetBrand,
        productModel: data.productModel,
        productCode: data.productCode,
        manufactorName: data.manufactorName,
        deviceImage: data.deviceImage,
        sceneImage: data.sceneImage,
        state: data.state,
        stateTime: data.stateTime,
        isDisable: data.isDisable,
        isDelete: data.isDelete,
        deviceParams: data.deviceParams,
        installTime: data.installTime,
        expireTime: data.expireTime,
    });
}

/**
 * 
 * 
 *     
 * 
 * 
 * 
 */




module.exports.getByDeviceID = function (deviceID) {
    return e_device.find({
        where: {
            deviceID: deviceID
        }
    });
}

module.exports.queryByDeviceID = function (deviceID) {
    let queryString = `SELECT bb.name buildingName,bh.houseNo houseNo, bc.name committeeName, bs.name streetName, bv.name villageName,ed.*
    FROM e_device AS ed
    LEFT JOIN b_committee AS bc
    ON bc.committeeID = ed.committeeID
    LEFT JOIN b_street AS bs
    ON bs.streetID = ed.streetID
    LEFT JOIN b_village AS bv
    ON bv.villageID = ed.villageID
    LEFT JOIN b_building AS bb
    ON bb.buildingID = ed.buildingID
    LEFT JOIN b_house AS bh
    ON bh.houseID = ed.houseID
    WHERE deviceID = ?`
    return dbConnection.query(queryString, {
        replacements: [deviceID],
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.getByBuildingID = function (buildingID) {
    return e_device.findAll({
        where: {
            buildingID: buildingID
        }
    });
}

module.exports.getByBuildingIDType = function (buildingID, type) {
    return e_device.findAll({
        where: {
            buildingID: buildingID,
            type: type
        }
    });
}

module.exports.getByDeviceIDs = function (deviceIDs) {
    return e_device.findAll({
        where: {
            deviceID: {
                [Op.in]: deviceIDs
            }
        },
        order: [
            ['updateTime', 'DESC']
        ]
    });
}

module.exports.getByCodes = function (codes) {
    return e_device.findAll({
        where: {
            code: {
                [Op.in]: codes
            }
        }
    });
}

module.exports.update = function (data) {
    if (data.longitude == "") {
        data.longitude = null
    } else {
        data.longitude = parseFloat(data.longitude)
    }

    if (data.latitude == "") {
        data.latitude = null
    } else {
        data.latitude = parseFloat(data.latitude)
    }
    return e_device.update({
        deviceID: data.deviceID,
        streetID: data.streetID,
        committeeID: data.committeeID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        houseID: data.houseID,
        ioID: data.ioID,
        addNo: data.addNo,
        name: data.name,
        code: data.code,
        path: data.path,
        type: data.type,
        longitude: data.longitude,
        latitude: data.latitude,
        installAdd: data.installAdd,
        prducetBrand: data.prducetBrand,
        productModel: data.productModel,
        productCode: data.productCode,
        manufactorName: data.manufactorName,
        deviceImage: data.deviceImage,
        sceneImage: data.sceneImage,
        stateTime: data.stateTime,
        isDisable: parseInt(data.isDisable),
        deviceParams: data.deviceParams,
        installTime: data.installTime,
        expireTime: data.expireTime,
    }, {
        where: {
            deviceID: data.deviceID
        }
    });
}


module.exports.delete = function (deviceID) {
    return e_device.destroy({
        where: {
            deviceID: deviceID
        }
    });
}


module.exports.query = function (queryString, replacements) {
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}

module.exports.getlist = function (villageIDs, types, pageNum, pageSize, state) {

    var where = {
        isDelete: 0,
        isDisable: 0,
        villageID: {
            [Op.in]: villageIDs
        }
    };

    if (types != null) {
        where.type = {
            [Op.in]: types
        };
    }

    if (state != null) {
        where.state = {
            [Op.in]: state
        }
    }

    if (pageNum != null && pageNum >= 1 && pageSize != null && pageSize >= 1) {
        return e_device.findAll({
            where: where,
            order: [
                ["insertTime", "DESC"]
            ],
            limit: pageSize,
            offset: (pageNum - 1) * pageSize
        });
    } else {
        return e_device.findAll({
            where: where
        });
    }
}


module.exports.getlistByPaging = function (villageIDs, types, pageNum, pageSize, state, order) {

    var where = {
        isDelete: 0,
        villageID: {
            [Op.in]: villageIDs
        }
    };

    if (types != null) {
        where.type = {
            [Op.in]: types
        };
    }

    if (state != null) {
        where.state = {
            [Op.in]: state
        }
    }

    if (order == "") {
        order = [
            ["insertTime", "DESC"]
        ]
    } else {
        order = order
    }

    if (pageNum != null && pageNum >= 1 && pageSize != null && pageSize >= 1) {
        return e_device.findAll({
            where: where,
            order: order,
            limit: pageSize,
            offset: (pageNum - 1) * pageSize
        });
    } 
}

module.exports.getDeviceListCountBypaging = function (villageIDs, types, state) {
    var where = {
        isDelete: 0,
        villageID: {
            [Op.in]: villageIDs
        }
    };

    if (types != null) {
        where.type = {
            [Op.in]: types
        };
    }

    if (state != null) {
        where.state = {
            [Op.in]: state
        }
    }

    return e_device.count({
        where: where
    })
}

module.exports.getDeviceListCount = function (villageIDs, types) {
    var where = {
        isDelete: 0,
        isDisable: 0,
        villageID: {
            [Op.in]: villageIDs
        }
    };

    if (types != null) {
        where.type = {
            [Op.in]: types
        };
    }
    return e_device.count({
        where: where
    })
}

module.exports.deviceNameExist = function(deviceID, name) {
    var where = {
        isDelete: 0,
        name: name,
    }

    if (deviceID != "") {
        where.deviceID = {
            [Op.ne]: deviceID
        }
    }

    return e_device.count({
        where: where
    })
}

module.exports.changeDeviceDisable = function (replacements) {
    let queryString = `UPDATE e_device AS ed
    INNER JOIN  (SELECT CASE isDisable WHEN 1 THEN 0 ELSE 1 END AS isDisable  FROM e_device WHERE deviceID = ?) tmp
    SET ed.isDisable= tmp.isDisable
    WHERE ed.deviceID = ?`
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.UPDATE
    });
}

module.exports.addDevice = async function (data) {
    if (data.longitude == "") {
        data.longitude = null
    } else {
        data.longitude = parseFloat(data.longitude)
    }

    if (data.latitude == "") {
        data.latitude = null
    } else {
        data.latitude = parseFloat(data.latitude)
    }
    let insertObj = {
        deviceID: cFun.guid(),
        streetID: data.streetID,
        committeeID: data.committeeID,
        villageID: data.villageID,
        buildingID: data.buildingID,
        houseID: data.houseID,
        ioID: data.ioID,
        addNo: data.addNo,
        name: data.name,
        code: data.code,
        path: data.path,
        type: data.type,
        longitude: data.longitude,
        latitude: data.latitude,
        installAdd: data.installAdd,
        prducetBrand: data.prducetBrand,
        productModel: data.productModel,
        productCode: data.productCode,
        manufactorName: data.manufactorName,
        deviceImage: data.deviceImage,
        sceneImage: data.sceneImage,
        state: 1,
        stateTime: data.stateTime,
        isDisable: parseInt(data.isDisable),
        isDelete: 0,
        deviceParams: data.deviceParams,
        installTime: data.installTime,
        expireTime: data.expireTime,
    }

    return await e_device.create(insertObj)
}

module.exports.addCameraDevice = async function (deviceData, cameraData) {
    if (deviceData.longitude == "") {
        deviceData.longitude = null
    } else {
        deviceData.longitude = parseFloat(deviceData.longitude)
    }

    if (deviceData.latitude == "") {
        deviceData.latitude = null
    } else {
        deviceData.latitude = parseFloat(deviceData.latitude)
    }
    let deviceID = cFun.guid()
    let insertDeviceObj = {
        deviceID: deviceID,
        streetID: deviceData.streetID,
        committeeID: deviceData.committeeID,
        villageID: deviceData.villageID,
        buildingID: deviceData.buildingID,
        houseID: deviceData.houseID,
        ioID: deviceData.ioID,
        addNo: deviceData.addNo,
        name: deviceData.name,
        code: deviceData.code,
        path: deviceData.path,
        type: deviceData.type,
        longitude: deviceData.longitude,
        latitude: deviceData.latitude,
        installAdd: deviceData.installAdd,
        prducetBrand: deviceData.prducetBrand,
        productModel: deviceData.productModel,
        productCode: deviceData.productCode,
        manufactorName: deviceData.manufactorName,
        deviceImage: deviceData.deviceImage,
        sceneImage: deviceData.sceneImage,
        state: 1,
        stateTime: deviceData.stateTime,
        isDisable: parseInt(deviceData.isDisable),
        isDelete: 0,
        deviceParams: deviceData.deviceParams,
        installTime: deviceData.installTime,
        expireTime: deviceData.expireTime,
    }
    
    let insertCameraObj = {
        cameraID: cFun.guid(),
        deviceID: deviceID,
        cameraIP: cameraData.cameraIP,
        cameraPort: cameraData.cameraPort == "" ? null : parseInt(cameraData.cameraPort),
        loginUser: cameraData.loginUser,
        loginPassword: cameraData.loginPassword,
        streamSource: cameraData.streamSource,
        installAngle: cameraData.installAngle == "" ? null : parseInt(cameraData.installAngle),
        inOutFlag: cameraData.inOutFlag == "" ? null : parseInt(cameraData.inOutFlag),
        useType: cameraData.useType,
    }


    await  dbConnection.transaction(function (t) {
            // 在事务中执行操作
            return e_device.create(insertDeviceObj, {
                    transaction: t
                })
                .then(function (param) {
                    return e_cameraDal.e_camera.create(insertCameraObj, {
                        transaction: t
                    });
                });
        }).then(function (result) {
            /* 操作成功，事务会自动提交 */
        }).catch(function (err) {
            console.log(err)
            /* 操作失败，事件会自动回滚 */
        });
    
}

module.exports.addAccessDevice = async function (deviceData, accessData) {
    if (deviceData.longitude == "") {
        deviceData.longitude = null
    } else {
        deviceData.longitude = parseFloat(deviceData.longitude)
    }

    if (deviceData.latitude == "") {
        deviceData.latitude = null
    } else {
        deviceData.latitude = parseFloat(deviceData.latitude)
    }
    let deviceID = cFun.guid()
    let insertDeviceObj = {
        deviceID: deviceID,
        streetID: deviceData.streetID,
        committeeID: deviceData.committeeID,
        villageID: deviceData.villageID,
        buildingID: deviceData.buildingID,
        houseID: deviceData.houseID,
        ioID: deviceData.ioID,
        addNo: deviceData.addNo,
        name: deviceData.name,
        code: deviceData.code,
        path: deviceData.path,
        type: deviceData.type,
        longitude: deviceData.longitude,
        latitude: deviceData.latitude,
        installAdd: deviceData.installAdd,
        prducetBrand: deviceData.prducetBrand,
        productModel: deviceData.productModel,
        productCode: deviceData.productCode,
        manufactorName: deviceData.manufactorName,
        deviceImage: deviceData.deviceImage,
        sceneImage: deviceData.sceneImage,
        state: 1,
        stateTime: deviceData.stateTime,
        isDisable: parseInt(deviceData.isDisable),
        isDelete: 0,
        deviceParams: deviceData.deviceParams,
        installTime: deviceData.installTime,
        expireTime: deviceData.expireTime,
    }

    let insertAccessObj = {
        accessID: cFun.guid(),
        accessName: accessData.accessName,
        deviceID: deviceID,
        mac: accessData.mac,
        type: accessData.type == "" ? null : parseInt(accessData.type),
        lockState: 0,
        lockStateTime: cFun.formatDateTime(),
        inCameraID: accessData.inCameraID,
        outCameraID: accessData.outCameraID,
        faceGatewayMac: accessData.faceGatewayMac,
        faceGatewayState: 1,
        inCameraID: accessData.inCameraID,
        outCameraID: accessData.outCameraID
    }

     await dbConnection.transaction(function (t) {
            // 在事务中执行操作
            return e_device.create(insertDeviceObj, {
                    transaction: t
                })
                .then(function (param) {
                    return e_AccessDal.e_access.create(insertAccessObj, {
                        transaction: t
                    });
                });
        }).then(function (result) {
            /* 操作成功，事务会自动提交 */
        }).catch(function (err) {
            console.log(err)
            /* 操作失败，事件会自动回滚 */
        });
    
}


module.exports.updateAccessDevice = async function (deviceData, accessData) {
    if (deviceData.longitude == "") {
        deviceData.longitude = null
    } else {
        deviceData.longitude = parseFloat(deviceData.longitude)
    }

    if (deviceData.latitude == "") {
        deviceData.latitude = null
    } else {
        deviceData.latitude = parseFloat(deviceData.latitude)
    }
    let updateDeviceObj = {
        deviceID: deviceData.deviceID,
        streetID: deviceData.streetID,
        committeeID: deviceData.committeeID,
        villageID: deviceData.villageID,
        buildingID: deviceData.buildingID,
        houseID: deviceData.houseID,
        ioID: deviceData.ioID,
        addNo: deviceData.addNo,
        name: deviceData.name,
        code: deviceData.code,
        path: deviceData.path,
        type: deviceData.type,
        longitude: deviceData.longitude,
        latitude: deviceData.latitude,
        installAdd: deviceData.installAdd,
        prducetBrand: deviceData.prducetBrand,
        productModel: deviceData.productModel,
        productCode: deviceData.productCode,
        manufactorName: deviceData.manufactorName,
        deviceImage: deviceData.deviceImage,
        sceneImage: deviceData.sceneImage,
        stateTime: deviceData.stateTime,
        isDisable: parseInt(deviceData.isDisable),
        deviceParams: deviceData.deviceParams,
        installTime: deviceData.installTime,
        expireTime: deviceData.expireTime,
    }

    let updateAccessObj = {
        accessID: accessData.accessID,
        accessName: accessData.accessName,
        deviceID: accessData.deviceID,
        mac: accessData.mac,
        type: accessData.type == "" ? null : parseInt(accessData.type),
        lockState: accessData.lockState == "" ? null : parseInt(accessData.lockState),
        lockStateTime: accessData.lockStateTime,
        inCameraID: accessData.inCameraID,
        outCameraID: accessData.outCameraID,
        faceGatewayMac: accessData.faceGatewayMac,
        faceGatewayState: accessData.faceGatewayState == "" ? null : parseInt(accessData.faceGatewayState),
    }

    await  dbConnection.transaction(function (t) {
            // 在事务中执行操作
            return e_device.update(updateDeviceObj, {
                    where: {
                        deviceID: updateDeviceObj.deviceID
                    }
                }, {
                    transaction: t
                })
                .then(function (param) {
                    return e_AccessDal.e_access.update(updateAccessObj, {
                        where: {
                            deviceID: updateDeviceObj.deviceID
                        }
                    }, {
                        transaction: t
                    });
                });
        }).then(function (result) {
            /* 操作成功，事务会自动提交 */
        }).catch(function (err) {
            console.log(err)
            /* 操作失败，事件会自动回滚 */
        });
    
}

module.exports.updateCameraDevice = async function (deviceData, cameraData) {
    if (deviceData.longitude == "") {
        deviceData.longitude = null
    } else {
        deviceData.longitude = parseFloat(deviceData.longitude)
    }

    if (deviceData.latitude == "") {
        deviceData.latitude = null
    } else {
        deviceData.latitude = parseFloat(deviceData.latitude)
    }
    let updateDeviceObj = {
        deviceID: deviceData.deviceID,
        streetID: deviceData.streetID,
        committeeID: deviceData.committeeID,
        villageID: deviceData.villageID,
        buildingID: deviceData.buildingID,
        houseID: deviceData.houseID,
        ioID: deviceData.ioID,
        addNo: deviceData.addNo,
        name: deviceData.name,
        code: deviceData.code,
        path: deviceData.path,
        type: deviceData.type,
        longitude: deviceData.longitude,
        latitude: deviceData.latitude,
        installAdd: deviceData.installAdd,
        prducetBrand: deviceData.prducetBrand,
        productModel: deviceData.productModel,
        productCode: deviceData.productCode,
        manufactorName: deviceData.manufactorName,
        deviceImage: deviceData.deviceImage,
        sceneImage: deviceData.sceneImage,
        stateTime: deviceData.stateTime,
        isDisable: parseInt(deviceData.isDisable),
        deviceParams: deviceData.deviceParams,
        installTime: deviceData.installTime,
        expireTime: deviceData.expireTime,
    }

    let updateCameraObj = {
        cameraID: cameraData.cameraID,
        deviceID: cameraData.deviceID,
        cameraIP: cameraData.cameraIP,
        cameraPort: cameraData.cameraPort == "" ? null : parseInt(cameraData.cameraPort),
        loginUser: cameraData.loginUser,
        loginPassword: cameraData.loginPassword,
        streamSource: cameraData.streamSource,
        installAngle: cameraData.installAngle == "" ? null : parseInt(cameraData.installAngle),
        inOutFlag: cameraData.inOutFlag == "" ? null : parseInt(cameraData.inOutFlag),
        useType: cameraData.useType,
    }

    await  dbConnection.transaction(function (t) {
            // 在事务中执行操作
            return e_device.update(updateDeviceObj, {
                    where: {
                        deviceID: updateDeviceObj.deviceID
                    }
                }, {
                    transaction: t
                })
                .then(function (param) {
                    return e_cameraDal.e_camera.update(updateCameraObj, {
                        where: {
                            deviceID: updateDeviceObj.deviceID
                        }
                    }, {
                        transaction: t
                    });
                });
        }).then(function (result) {
            /* 操作成功，事务会自动提交 */
        }).catch(function (err) {
            console.log(err)
            /* 操作失败，事件会自动回滚 */
        });
    
}

module.exports.getCameraInOut = function (replacements) {
    let queryString = `SELECT ec.cameraID,ed.name,ec.inOutFlag
    FROM e_camera AS ec
    LEFT JOIN e_device AS ed
    ON ed.deviceID = ec.deviceID
    WHERE ec.deviceID IN (SELECT deviceID FROM e_device WHERE houseID = ? AND isDelete=0)`
    return dbConnection.query(queryString, {
        replacements: replacements,
        type: Sequelize.QueryTypes.SELECT
    });
}


module.exports.delDevice = function (deviceID) {
    return e_device.update({
        isDelete: 1,
    }, {
        where: {
            deviceID: deviceID
        }
    });
}