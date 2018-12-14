const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: process.env.ELS_HOST,
    log: 'trace'
});
const cFun = require('../utils/commonFunc');


module.exports = async function (head, condition, pageNum, pageSize) {
    var searchBody = {
        query: {
            bool: {
                must: []
            }
        },
        sort: [{
            time: {
                order: 'desc'
            }
        }]
    };

    if (!cFun.isNullOrEmpty(condition.type)) {
        searchBody.query.bool.must.push({
            match: {
                type: condition.type
            }
        });   
    }
    
    if (!cFun.isNullOrEmpty(condition.title)) {
        searchBody.query.bool.must.push({
            match_phrase: {
                title: condition.title.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.message)) {
        searchBody.query.bool.must.push({
            match_phrase: {
                message: condition.message.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.excontent)) {
        searchBody.query.bool.must.push({
            match_phrase: {
                excontent: condition.excontent.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.ip)) {
        searchBody.query.bool.must.push({
            match_phrase: {
                ip: condition.ip.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.hostname)) {
        searchBody.query.bool.must.push({
            match_phrase: {
                hostname: condition.hostname.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.serviceName)) {
        searchBody.query.bool.must.push({
            match_phrase: {
                serviceName: condition.serviceName.toLowerCase()
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.startTime)) {
        searchBody.query.bool.must.push({
            range: {
                time: {
                    from: cFun.timestamp(condition.startTime)
                }
            }
        });
    }

    if (!cFun.isNullOrEmpty(condition.endTime)) {
        searchBody.query.bool.must.push({
            range: {
                time: {
                    to: cFun.timestamp(condition.endTime)
                }
            }
        });
    }

    //tag 查询条件
    if (condition.tags != null && condition.tags.length > 0) {
        for (let t = 0; t < condition.tags.length; t++) {
            let tag = condition.tags[t];
            let code=tag.code.toLowerCase();
            let content=tag.content;

            let match={};
            match[code]=content;

            searchBody.query.bool.must.push({
                match_phrase: match
            });
        }
    }

    var searchParams = {
        index: 'logindex',
        from: (pageNum - 1) * pageSize,
        size: pageSize,
        body: searchBody
    };

    console.log(JSON.stringify(searchBody));
    var result = await client.search(searchParams);

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