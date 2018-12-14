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
                must: [],
                should: []
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

    if (!cFun.isNullOrEmpty(condition.ioID)) {

        searchBody.query.bool.should.push({
            match: {
                inioid: condition.ioID
            }
        })

        searchBody.query.bool.should.push({
            match: {
                outioid: condition.ioID
            }
        })
    }

    if (!cFun.isNullOrEmpty(condition.carType)) {
        searchBody.query.bool.must.push({
            match: {
                cartype: condition.carType.toLowerCase()
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

    if (!cFun.isNullOrEmpty(condition.startTime)) {
        searchBody.query.bool.must.push({
            range: {
                intime: {
                    from: cFun.timestamp(condition.startTime)
                }
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.endTime)) {
        searchBody.query.bool.must.push({
            range: {
                intime: {
                    to: cFun.timestamp(condition.endTime)
                }
            }
        });
    }

    console.log(JSON.stringify(searchBody))
    var searchParams = {
        index: 'parkingreservelogindex',
        from: (pageNum - 1) * pageSize,
        size: pageSize,
        body: searchBody
    };

    console.log(JSON.stringify(searchBody));
    var result = await client.search(searchParams);

    //记录日志
    log.info('search', 'wkcar', JSON.stringify({
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
        var platePicResources = await resourceDal.getBusinessType('parkingLog');

        if (resBody.data != null && resBody.data.length > 0) {
            for (let i = 0; i < resBody.data.length; i++) {

                var peoplePicResource = villageResources.filter(x => x.businessID == resBody.data[i].villageid)[0];
                if (peoplePicResource == null) {
                    peoplePicResource = villageResources.filter(x => cFun.isNullOrEmpty(x.businessID))[0];
                }

                if (peoplePicResource != null) {

                    //头像Url拼接
                    if (!cFun.isNullOrEmpty(resBody.data[i].headpic)) {
                        resBody.data[i].headpic = peoplePicResource.filePath + resBody.data[i].headpic;
                    }

                    if (!cFun.isNullOrEmpty(resBody.data[i].livepic)) {
                        resBody.data[i].livepic = peoplePicResource.filePath + resBody.data[i].livepic;
                    }

                    if (!cFun.isNullOrEmpty(resBody.data[i].idpic)) {
                        resBody.data[i].idpic = peoplePicResource.filePath + resBody.data[i].idpic;
                    }
                }

                var platePicResource = platePicResources.filter(x => x.businessID == resBody.data[i].villageid)[0];
                if (platePicResource == null) {
                    platePicResource = platePicResources.filter(x => cFun.isNullOrEmpty(x.businessID))[0];
                }
                if (platePicResource != null) {

                    if (!cFun.isNullOrEmpty(resBody.data[i].inplatepic)) {
                        resBody.data[i].inplatepic = platePicResource.filePath + resBody.data[i].inplatepic;
                    }

                    if (!cFun.isNullOrEmpty(resBody.data[i].outplatepic)) {
                        resBody.data[i].outplatepic = platePicResource.filePath + resBody.data[i].outplatepic;
                    }

                    if (!cFun.isNullOrEmpty(resBody.data[i].inminplatepic)) {
                        resBody.data[i].inminplatepic = platePicResource.filePath + resBody.data[i].inminplatepic;
                    }

                    if (!cFun.isNullOrEmpty(resBody.data[i].outminplatepic)) {
                        resBody.data[i].outminplatepic = platePicResource.filePath + resBody.data[i].outminplatepic;
                    }
                }

                //掩码
                resBody.data[i].credentialno = cFun.maskCredentialNo(resBody.data[i].credentialno, verifyAuthority.viewCredentialNo(userFunctions));
                resBody.data[i].phoneno = cFun.maskPhoneNo(resBody.data[i].phoneno, verifyAuthority.viewMobile(userFunctions));
                resBody.data[i].peoplename = cFun.maskPeopleName(resBody.data[i].peoplename, verifyAuthority.viewPeopleName(userFunctions));

            }
        }

        return resBody;
    }

    return {
        total: 0,
        data: []
    };
}