const cFun = require('../utils/commonFunc');
const senseAlarmModelDal = require('../dals/e_sense_alarm_modelDal');

var getAlarmModels = cFun.awaitHandlerFactory(async (req, res, next) => {
    let reqBody = req.body;

    let models = await senseAlarmModelDal.getByFunctionID()

    var resModels = [];
    for (let i = 0; i < models.length; i++) {
        let model = models[i];
        resModels.push({
            groupName: model.groupName,
            modelName: model.modelName,
            modelID: model.modelID,
            modelCode: model.modelCode
        });
    }

    var safetys = resModels.filter(x => x.groupName == '公共安全');
    var manages = resModels.filter(x => x.groupName == '公共管理');
    var services = resModels.filter(x => x.groupName == '公共服务');

    if (safetys != null && safetys.length > 0 &&
        manages != null && manages.length > 0 &&
        services != null && services.length > 0) {
        resModels = [];

        resModels= resModels.concat(safetys);
        resModels= resModels.concat(manages);
        resModels= resModels.concat(services);
    }

    return res.json(cFun.responseStatus(0, 'success', {
        models: resModels
    }));

});
module.exports.getAlarmModels = getAlarmModels;

var getAllModels = cFun.awaitHandlerFactory(async (req, res, next) => {
    let reqBody = req.body;

    let models = await senseAlarmModelDal.getAll()

    return res.json(cFun.responseStatus(0, 'success', {
        models: models
    }));

});
module.exports.getAllModels = getAllModels;