const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: process.env.ELS_HOST,
    log: 'trace'
});
const cFun = require('../utils/commonFunc');
const log = require('../log/logRecord');
const resourceDal = require('../dals/s_resourceDal');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');
const verifyAuthority = require('../authority/verifyAuthority');

module.exports = async function (head, condition, pageNum, pageSize) {
    var searchBody = {
        query: {
            bool: {
                must: []
            }
        },
        sort: [{
            peopleinserttime: {
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

    if (!cFun.isNullOrEmpty(condition.peopleLabels) && condition.peopleLabels.length > 0) {

        var labelQuery = {
            bool: {
                should: []
            }
        }

        for (let i = 0; i < condition.peopleLabels.length; i++) {
            let peopleLabel = condition.peopleLabels[i];
            labelQuery.bool.should.push({
                wildcard: {
                    peoplelabel: '*' + peopleLabel + '*'
                }
            })
        }
        searchBody.query.bool.must.push(labelQuery);
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

    if (!cFun.isNullOrEmpty(condition.peopleName)) {

        condition.peopleName = cFun.removeSpace(condition.peopleName);

        searchBody.query.bool.must.push({
            match_phrase: {
                peoplename: condition.peopleName.toLowerCase()
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

    if (!cFun.isNullOrEmpty(condition.houseNo)) {
        searchBody.query.bool.must.push({
            match: {
                houseno: condition.houseNo
            }
        });
    }

    var searchParams = {
        index: 'peopleindex',
        from: (pageNum - 1) * pageSize,
        size: pageSize,
        body: searchBody
    };

    console.log(JSON.stringify(searchBody));

    var result = await client.search(searchParams);

    //记录日志
    log.info('search', 'people', JSON.stringify({
        title: 'searchParams',
        content: JSON.stringify(searchParams)
    }))

    var resData = [];
    if (result != null && result.hits != null && result.hits.total > 0) {
        var resBody = {
            total: result.hits.total
        }

        var userFunctions = await redis.getAsync(redisKey.userAuthorityFunctions(head.userID));
        for (let i = 0; i < result.hits.hits.length; i++) {
            let data = result.hits.hits[i];
            if (data != null) {
                resData.push(data._source);
            }
        }

        resBody.data = resData;


        var villageResources = await resourceDal.getBusinessType('peoplePic');

        if (resBody.data != null && resBody.data.length > 0) {
            for (let i = 0; i < resBody.data.length; i++) {

                //头像Url拼接
                if (!cFun.isNullOrEmpty(resBody.data[i].headpic)) {
                    var peoplePicResource = villageResources.filter(x => x.businessID == resBody.data[i].villageid)[0];
                    if (peoplePicResource == null) {
                        peoplePicResource = villageResources.filter(x => cFun.isNullOrEmpty(x.businessID))[0];
                    }

                    if (peoplePicResource != null) {
                        resBody.data[i].headpic = peoplePicResource.filePath + resBody.data[i].headpic;
                    }
                }



                //掩码
                resBody.data[i].credentialno = cFun.maskCredentialNo(resBody.data[i].credentialno, verifyAuthority.viewCredentialNo(userFunctions));
                resBody.data[i].phoneno = cFun.maskPhoneNo(resBody.data[i].phoneno, verifyAuthority.viewMobile(userFunctions));
            }
        }

        return resBody;
    }

    return {
        total: 0,
        data: []
    };
}