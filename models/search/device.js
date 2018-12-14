const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: process.env.ELS_HOST,
    log: 'trace'
});
const cFun = require('../utils/commonFunc');
const log = require('../log/logRecord');

module.exports = async function (head, condition, pageNum, pageSize) {
    var searchBody = {
        query: {
            bool: {
                must: []
            }
        },
        sort: [{
            installtime: {
                order: 'desc'
            }
        }]
    };

    searchBody.query.bool.must.push({
        isdelete: 0
    })

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

    if (!cFun.isNullOrEmpty(condition.buildingNos) && condition.buildingNos.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                buildingno: cFun.toLowers(condition.buildingNos)
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.deviceModel)) {
        searchBody.query.bool.must.push({
            terms: {
                productmodel: cFun.toLowers(condition.deviceModel)
            }
        });
    }


    if (!cFun.isNullOrEmpty(condition.deviceName)) {

        condition.deviceName = cFun.removeSpace(condition.deviceName);

        searchBody.query.bool.must.push({
            match_phrase: {
                name: cFun.toLowers(condition.deviceName)
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.deviceCode)) {
        searchBody.query.bool.must.push({
            wildcard: {
                code: '*' + cFun.toLowers(condition.deviceCode) + '*'
            }
        });
    }


    if (!cFun.isNullOrEmpty(condition.deviceStates) && condition.deviceStates.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                state: condition.deviceStates
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.startTime)) {
        searchBody.query.bool.must.push({
            range: {
                updatetime: {
                    from: cFun.timestamp(condition.startTime)
                }
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.endTime)) {
        searchBody.query.bool.must.push({
            range: {
                updatetime: {
                    to: cFun.timestamp(condition.endTime)
                }
            }
        });
    }


    var searchParams = {
        index: 'deviceindex',
        from: (pageNum - 1) * pageSize,
        size: pageSize,
        body: searchBody
    };

    console.log(JSON.stringify(searchBody));
    var result = await client.search(searchParams);

    //记录日志
    log.info('search', 'device', JSON.stringify({
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

        return resBody;
    }

    return {
        total: 0,
        data: []
    };
}