const cFun = require('../utils/commonFunc');
const peopletagDal = require('../dals/p_people_tagDal');
const peopletagEntity = require('../entitys/p_people_tagEntity');

var getPeopletag = cFun.awaitHandlerFactory(async (req, res, next) => {//根据人员获取标签
    var reqBody = req.body;

    var peopletagInfo = await peopletagDal.getByPeopleID(reqBody.peopleID);

    return res.json(cFun.responseStatus(0, 'success', {
        peopletagInfo: peopletagInfo
    }));

});
module.exports.getPeopletag = getPeopletag;

var updateAddPeopletag = cFun.awaitHandlerFactory(async (req, res, next) => {//批量修改添加标签
    var reqBody = req.body;
    if (reqBody.peopleIDs && reqBody.peopleIDs.length > 0)
        for (const itemupdate of reqBody.peopleIDs) {
            await peopletagDal.byPeopleIDdelete(itemupdate);
        }
    for (const item of reqBody.peopletagList) {
        for (const iteminfo of item.label) {
            var peopletagentity = new peopletagEntity();
            peopletagentity.peopleID = item.peopleID;
            peopletagentity.label = iteminfo;
            peopletagentity.ptID = cFun.guid();
            peopletagentity.isDelete = 0;
            await peopletagDal.insert(peopletagentity);
        }
    }
    return res.json(cFun.responseStatus(0, 'success'));

});
module.exports.updateAddPeopletag = updateAddPeopletag;

