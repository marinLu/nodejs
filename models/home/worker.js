const cFun = require('../utils/commonFunc');
const authorityDal = require('../dals/s_authorityDal');
const villageDal = require('../dals/b_villageDal');
const optionDal = require('../dals/s_optionDal');
const rosterDal = require('../dals/p_rosterDal');
const streetDal = require('../dals/b_streetDal');
const resourceDal = require('../dals/s_resourceDal');
const userDal = require('../dals/s_userDal');
const userExtendDal = require('../dals/s_user_extendDal');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');

var getMarquee =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var rosters = await rosterDal.getRoster(reqBody.villageID);
        if (rosters == null || rosters.length == 0) {
            return res.json(cFun.responseStatus(0, 'success'));
        }

        var marquee = "";
        for (let i = 0; i < rosters.length; i++) {
            let roster = rosters[i];
            let phone = cFun.isNullOrEmpty(roster.phoneNo) ? roster.tel : roster.phoneNo;
            if (roster.political_Code == 2) {
                marquee += "<span>" + "<i class=\"iconfont\">&#xe66e</i>" +
                    "<i class=\"iconfont inco_color\">&#xe602;</i>" +
                    "<span>" + roster.peopleName + "</span>" +
                    "<span>" + roster.position + "</span>" +
                    "<span>" + phone + "</span>" +
                    "</span>";


            } else {
                marquee += "<span>" + "<i class=\"iconfont\">&#xe66e</i>" +
                    "<span>" + roster.peopleName + "</span>" +
                    "<span>" + roster.position + "</span>" +
                    "<span>" + phone + "</span>" +
                    "</span>";
            }
        }

        return res.json(cFun.responseStatus(0, 'success', {
            marquee: marquee
        }));
    });
module.exports.getMarquee = getMarquee;

var getDutyWorkers =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var rosters = await rosterDal.getRoster(reqBody.villageID);
        if (rosters == null || rosters.length == 0) {
            return res.json(cFun.responseStatus(0, 'success'));
        }

        var workers = [];
        for (let i = 0; i < rosters.length; i++) {
            let roster = rosters[i];

            if (cFun.isNullOrEmpty(roster.phoneNo)) {
                continue;
            }

            var worker = {
                workerID: roster.workerID,
                name: roster.peopleName,
                position: roster.position,
                phoneNo: roster.phoneNo,
                political_Code: roster.political_Code,
            }

            var user = await userDal.getByPhoneTel(roster.phoneNo);
            if (user != null) {
                var userExtend = await userExtendDal.getByUserID(user.userID);
                if (userExtend != null) {
                    worker.longitude = userExtend.longitude;
                    worker.latitude = userExtend.latitude;
                }
            }

            workers.push(worker);
        }

        return res.json(cFun.responseStatus(0, 'success', {
            workers: workers
        }));
    });
module.exports.getDutyWorkers = getDutyWorkers;