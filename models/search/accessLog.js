const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: process.env.ELS_HOST,
    log: 'trace'
});
const cFun = require('../utils/commonFunc');
const log = require('../log/logRecord');
const accessDal = require('../dals/e_accessDal');
const deviceHelper = require('../device/helper');
const cameraDal = require('../dals/e_cameraDal');
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
            opentime: {
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

    if (!cFun.isNullOrEmpty(condition.buildingNos) && condition.buildingNos.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                buildingno: cFun.toLowers(condition.buildingNos)
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.cardNo)) {
        searchBody.query.bool.must.push({
            wildcard: {
                cardno: '*' + condition.cardNo.toLowerCase() + '*'
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.openTypes) && condition.openTypes.length > 0) {
        searchBody.query.bool.must.push({
            terms: {
                opentype: cFun.toLowers(condition.openTypes)
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.startTime)) {
        searchBody.query.bool.must.push({
            range: {
                opentime: {
                    from: cFun.timestamp(condition.startTime)
                }
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.endTime)) {
        searchBody.query.bool.must.push({
            range: {
                opentime: {
                    to: cFun.timestamp(condition.endTime)
                }
            }
        });
    }

    var searchParams = {
        index: 'accesslogindex',
        from: (pageNum - 1) * pageSize,
        size: pageSize,
        body: searchBody
    };
    console.log(JSON.stringify(searchBody));
    var result = await client.search(searchParams);

    //记录日志
    log.info('search', 'accessLog', JSON.stringify({
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

        var smallVideoResources = await resourceDal.getBusinessType('smallVideo');
        for (let i = 0; i < resBody.data.length; i++) {

            //开门小视频拼接
            resBody.data[i].instreamsource = '';
            resBody.data[i].outstreamsource = '';


            var smallVideoResource = smallVideoResources.filter(x => x.businessID == resBody.data[i].villageid)[0];
            if (smallVideoResource == null) {
                smallVideoResource = smallVideoResources.filter(x => cFun.isNullOrEmpty(x.businessID))[0];
            }

            if (smallVideoResource != null) {
                var smallVideoUrl = smallVideoResource.filePath;
                var accessInfo = await accessDal.getByDeviceID(resBody.data[i].deviceid);

                var accessCameras = [];
                if (!cFun.isNullOrEmpty(accessInfo.inCameraID)) {
                    let camera = await cameraDal.getByCameraID(accessInfo.inCameraID);

                    if (camera != null) {
                        accessCameras.push(camera);
                    }
                }
                if (!cFun.isNullOrEmpty(accessInfo.outCameraID)) {
                    let camera = await cameraDal.getByCameraID(accessInfo.outCameraID);

                    if (camera != null) {
                        accessCameras.push(camera);
                    }
                }

                if (accessCameras.length > 0) {

                    var inSmallVideoCamera = accessCameras.filter(x => x.inOutFlag == 0)[0];
                    var outSmallVideoCamera = accessCameras.filter(x => x.inOutFlag == 1)[0];

                    if (inSmallVideoCamera != null) {
                        var inSmallVideoCameraId = inSmallVideoCamera.cameraID;
                        resBody.data[i].instreamsource = deviceHelper.buildSmallVideoUrl(smallVideoUrl, inSmallVideoCameraId,
                            resBody.data[i].opentime)
                    }

                    if (outSmallVideoCamera != null) {
                        var outSmallVideoCameraId = outSmallVideoCamera.cameraID;
                        resBody.data[i].outstreamsource = deviceHelper.buildSmallVideoUrl(smallVideoUrl, outSmallVideoCameraId,
                            resBody.data[i].opentime)
                    }
                }
            }

            //掩码
            resBody.data[i].credentialno = cFun.maskCredentialNo(resBody.data[i].credentialno, verifyAuthority.viewCredentialNo(userFunctions));
            resBody.data[i].phoneno = cFun.maskPhoneNo(resBody.data[i].phoneno, verifyAuthority.viewMobile(userFunctions));
            resBody.data[i].peoplename = cFun.maskPeopleName(resBody.data[i].peoplename, verifyAuthority.viewPeopleName(userFunctions));
        }

        return resBody;
    }

    return {
        total: 0,
        data: []
    };
}