const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: process.env.ELS_HOST,
    log: 'trace'
});
const cFun = require('../utils/commonFunc');
const log = require('../log/logRecord');

module.exports = async function (head,condition, pageNum, pageSize) {
    var searchBody = {
        query: {
            bool: {
                must: []
            }
        },
        sort: [{
            inserttime: {
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

    if (!cFun.isNullOrEmpty(condition.peopleName)) {

        condition.peopleName = cFun.removeSpace(condition.peopleName)

        searchBody.query.bool.must.push({
            match_phrase: {
                peoplename: condition.peopleName.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.phone)) {
        searchBody.query.bool.must.push({
            wildcard: {
                phoneno: '*' + condition.phone.toLowerCase() + '*'
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.credentialNo)) {
        condition.credentialNo = cFun.removeSpace(condition.credentialNo);

        searchBody.query.bool.must.push({
            wildcard: {
                credentialno: '*' + condition.credentialNo.toLowerCase() + '*'
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.plateNo)) {
        condition.plateNo = cFun.removeSpace(condition.plateNo)

        let chineseChars = cFun.getChinese(condition.plateNo);
        if (chineseChars == null) {
            searchBody.query.bool.must.push({
                wildcard: {
                    plateno: '*' + condition.plateNo.toLowerCase() + '*'
                }
            });
        } else {
            condition.plateNo = cFun.removeChinese(condition.plateNo);
            searchBody.query.bool.must.push({
                wildcard: {
                    plateno: '*' + condition.plateNo.toLowerCase() + '*'
                }
            });

            for (let index = 0; index < chineseChars.length; index++) {
                searchBody.query.bool.must.push({
                    wildcard: {
                        plateno: '*' + chineseChars[index] + '*'
                    }
                });
            }
        }
    }

    if (!cFun.isNullOrEmpty(condition.carType)) {
        searchBody.query.bool.must.push({
            match: {
                cartype: condition.carType.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.buildingNo)) {
        searchBody.query.bool.must.push({
            match: {
                buildingno: condition.buildingNo
            }
        });
    }

    console.log(JSON.stringify(searchBody))
    var searchParams = {
        index: 'carindex',
        from: (pageNum - 1) * pageSize,
        size: pageSize,
        body: searchBody
    };

    console.log(JSON.stringify(searchBody));
    var result = await client.search(searchParams);

    //记录日志
    log.info('search', 'car', JSON.stringify({
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