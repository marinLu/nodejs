const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: process.env.ELS_HOST,
    log: 'trace'
});;
const cFun = require('../utils/commonFunc');
const log = require('../log/logRecord');
const deviceDal = require('../dals/e_deviceDal');
const buildingDal = require('../dals/b_buildingDal');
const houseDal = require('../dals/b_houseDal');
const villageDal = require('../dals/b_villageDal');

module.exports = async function (head, condition, pageNum, pageSize) {
    var searchBody = {
        query: {
            bool: {
                must: []
            }
        },
        sort: [{
            alarmtime: {
                order: 'desc'
            }
        }]
    };

    if (!cFun.isNullOrEmpty(condition.villageIDs) && condition.villageIDs.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                villageid: cFun.toLowers(condition.villageIDs)
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.deviceTypes) && condition.deviceTypes.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                devicetype: cFun.toLowers(condition.deviceTypes)
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.alarmTypes) && condition.alarmTypes.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                alarmtype: cFun.toLowers(condition.alarmTypes)
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.alarmStates) && condition.alarmStates.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                alarmstate: condition.alarmStates
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.startTime)) {
        searchBody.query.bool.must.push({
            range: {
                alarmtime: {
                    from: cFun.timestamp(condition.startTime)
                }
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.endTime)) {
        searchBody.query.bool.must.push({
            range: {
                alarmtime: {
                    to: cFun.timestamp(condition.endTime)
                }
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.alarmReason)) {

        condition.alarmReason = cFun.removeSpace(condition.alarmReason)

        searchBody.query.bool.must.push({
            match_phrase: {
                processedcontent: condition.alarmReason.toLowerCase()
            }
        });

    }

    if (!cFun.isNullOrEmpty(condition.alarmDetail)) {

        condition.alarmDetail = cFun.removeSpace(condition.alarmDetail)

        searchBody.query.bool.must.push({
            match_phrase: {
                alarmcontent: condition.alarmDetail.toLowerCase()
            }
        });

    }

    var searchParams = {
        index: 'alarmlogindex',
        from: (pageNum - 1) * pageSize,
        size: pageSize,
        body: searchBody
    };
    console.log(JSON.stringify(searchBody));
    var result = await client.search(searchParams);

    log.info('search', 'alarm', JSON.stringify({
        title: 'searchParams',
        content: JSON.stringify(searchParams)
    }))

    var resData = [];
    if (result != null && result.hits != null && result.hits.total > 0) {
        var resBody = {
            total: result.hits.total
        }

        for (let i = 0; i < result.hits.hits.length; i++) {
            let data = result.hits.hits[i];
            if (data != null) {
                resData.push(data._source);
            }
        }

        resBody.data = resData;

        for (let i = 0; i < resBody.data.length; i++) {

            var alarmContentEntity = cFun.jsonTryParse(resBody.data[i].alarmcontent);
            if (alarmContentEntity != null) {

                if (alarmContentEntity.alarmTitle != null) {
                    resBody.data[i].alarmcontent = alarmContentEntity.alarmTitle;
                } else {
                    resBody.data[i].alarmcontent = resBody.data[i].alarmtypename;
                }

            } else {
                resBody.data[i].alarmcontent = resBody.data[i].alarmtypename;
            }


            resBody.data[i].address = '';
            var device = await deviceDal.getByDeviceID(resBody.data[i].deviceid);
            if (device != null) {
                var village = await villageDal.getByVillageID(device.villageID);
                var building = await buildingDal.getByID(device.buildingID);
                var house = await houseDal.getByHouseID(device.houseID);

                if (village != null) {
                    resBody.data[i].address = village.name;

                    if (building != null && building.buildingNo != null && building.buildingNo != '') {
                        resBody.data[i].address += building.buildingNo + '号';
                    }

                    if (house != null && house.houseNo != null && house.houseNo != '') {
                        resBody.data[i].address += house.houseNo;
                    }
                }
            }


        }


        return resBody;
    }

    return {
        total: 0,
        data: []
    };
}