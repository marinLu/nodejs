const cFun = require("../utils/commonFunc");
const flowDal = require("../dals/e_sense_alarm_flowDal");
const FlowEntity = require("../entitys/e_sense_alarm_flowEntity");
const userRoleDal = require("../dals/s_user_roleDal");
const alarmOptionDal = require("../dals/e_sense_alarm_optionDal");
const AlarmOptionEntity = require("../entitys/e_sense_alarm_optionEntity");
const alarmModelDal = require("../dals/e_sense_alarm_modelDal");
const roleDal = require("../dals/s_roleDal");
const dicDal = require('../dals/s_dictionaryDal');

var add = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body;
  if (!reqBody.modelID||!reqBody.flowName) {
    return res.json(cFun.responseStatus(-1, "事件模型标识或者时间流程名称参数有误！"));
  }
  var alarmLevelDic = await dicDal.getByPath('alarmLevel');

  var flows = [];
  for (let i = 0; i < reqBody.flows.length; i++) {
    let flow = reqBody.flows[i];

    if (!verifyMessageTemplate(flow.messageTemplate)) {
      return res.json(cFun.responseStatus(-1, "消息模板非法"));
    }

    var userRoles = await userRoleDal.getByRoleIDs(flow.roleIDs);

    let flowRuleEntity = {
      no: i,
      name: "",
      time: 0,
      userIDs: _.map(userRoles, x => x.userID),
      roleIDs: flow.roleIDs,
      duty: [],
      pushType: Number(flow.pushType),
      messageTemplate: flow.messageTemplate,
      messageTitle: flow.messageTitle,
      messagePushTime: flow.messagePushTime
    };

    flows.push(flowRuleEntity);
  }

  var flowRule = {
    flows: flows
  }

  var flowEntity = new FlowEntity();
  flowEntity.flowID = cFun.guid();
  flowEntity.modelID = reqBody.modelID;
  flowEntity.editUser = reqBody.head.userID;
  flowEntity.flowName = reqBody.flowName;
  flowEntity.isDelete = 0;
  flowEntity.isValid = 1;
  flowEntity.flowRule = JSON.stringify(flowRule);

  flowDal.insert(flowEntity);

  for (let i = 0; i < reqBody.villageIDs.length; i++) {
    var alarmOptionEntity = new AlarmOptionEntity();
    alarmOptionEntity.optionID = cFun.guid();
    alarmOptionEntity.villageID = reqBody.villageIDs[i];
    alarmOptionEntity.modelID = reqBody.modelID;
    alarmOptionEntity.flowID = flowEntity.flowID;
    alarmOptionEntity.alarmName = cFun.getTypeName(alarmLevelDic, reqBody.alarmLevel);
    alarmOptionEntity.alarmLevel = reqBody.alarmLevel;
    alarmOptionEntity.isValid = 1;
    alarmOptionEntity.isDelete = 0;
    alarmOptionEntity.startTime = cFun.formatDateTime();
    alarmOptionEntity.endTime = cFun.formatDateTime("2020-01-01");
    alarmOptionEntity.editUser = reqBody.head.userID;

    alarmOptionDal.insert(alarmOptionEntity);
  }

  return res.json(cFun.responseStatus(0, "success"));
});
module.exports.add = add;

var update = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body;
  // var alarmLevelDic = await dicDal.getByPath('alarmLevel');
  if (reqBody.flows == null || reqBody.flows.length == 0) {
    return res.json(cFun.responseStatus(-1, 'flows不能为空'));
  }

  var flow = await flowDal.getByID(reqBody.flowID);
  if (!flow) return res.json(cFun.responseStatus(-1, "flowID不存在！"));
  flow.flowName = reqBody.flowName;
  var alarmOptions = await alarmOptionDal.getByFlowID(reqBody.flowID);
  var villageIDs = alarmOptions.map(x => x.villageID);
  //更新适用范围
  if (villageIDs) {
    let del = await alarmOptionDal.querydel("DELETE from e_sense_alarm_option where flowID in ('" + flow.flowID + "')");
    for (let i = 0; i < reqBody.villageIDs.length; i++) {
      var alarmOptionEntity = new AlarmOptionEntity();
      alarmOptionEntity.optionID = cFun.guid();
      alarmOptionEntity.villageID = reqBody.villageIDs[i];
      alarmOptionEntity.modelID = flow.modelID;
      alarmOptionEntity.flowID = flow.flowID;
      alarmOptionEntity.alarmName = "...";
      alarmOptionEntity.alarmLevel = "...";
      alarmOptionEntity.isValid = 1;
      alarmOptionEntity.isDelete = 0;
      alarmOptionEntity.startTime = cFun.formatDateTime();
      alarmOptionEntity.endTime = cFun.formatDateTime("2020-01-01");
      alarmOptionEntity.editUser = reqBody.head.userID;
      alarmOptionDal.insert(alarmOptionEntity);
    }
  }

  var flowRuleEntity = cFun.jsonTryParse(flow.flowRule);
  if (flowRuleEntity != null) {
    for (let i = 0; i < flowRuleEntity.flows.length; i++) {
      if (reqBody.flows[i] != null) {
        flowRuleEntity.flows[i].roleIDs = reqBody.flows[i].roleIDs;
        flowRuleEntity.flows[i].pushType = reqBody.flows[i].pushType;
        flowRuleEntity.flows[i].messagePushTime = reqBody.flows[i].messagePushTime;
        flowRuleEntity.flows[i].messageTemplate = reqBody.flows[i].messageTemplate;
        flowRuleEntity.flows[i].messageTitle = reqBody.flows[i].messageTitle;
      }

    }

    if (reqBody.flows.length > flowRuleEntity.flows.length) {
      for (let j = flowRuleEntity.flows.length; j < reqBody.flows.length; j++) {
        flowRuleEntity.flows[j].roleIDs = reqBody.flows[j].roleIDs;
        flowRuleEntity.flows[j].pushType = reqBody.flows[j].pushType;
        flowRuleEntity.flows[j].messagePushTime = reqBody.flows[j].messagePushTime;
        flowRuleEntity.flows[j].messageTemplate = reqBody.flows[j].messageTemplate;
        flowRuleEntity.flows[j].messageTitle = reqBody.flows[j].messageTitle;
      }
    }
  }

  flow.flowRule = JSON.stringify(flowRuleEntity);

  flowDal.update(flow);
  return res.json(cFun.responseStatus(0, "success"));
});
module.exports.update = update;

var get = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body;

  var resMessages = [];
  var allFlows = await flowDal.getByPage(Number(reqBody.pageNum), Number(reqBody.pageSize));
  if (allFlows == null || allFlows.length == 0) {
    return res.json(
      cFun.responseStatus(0, "无数据", {
        messages: resMessages
      })
    );
  }

  var allOptions = await alarmOptionDal.getByFlowIDs(
    allFlows.map(x => x.flowID)
  );
  var allModels = await alarmModelDal.getByModelIDs(
    Array.from(new Set(allOptions.map(x => x.modelID)))
  );

  for (let i = 0; i < allFlows.length; i++) {
    let flow = allFlows[i];
    let flowOptions = _.filter(allOptions, x => x.flowID == flow.flowID);
    if (flowOptions.length > 0) {
      let flowVillageIDs = Array.from(new Set(flowOptions.map(x => x.villageID)));
      let model = _.find(allModels, x => flowOptions[0] != null && x.modelID == flowOptions[0].modelID);

      let flowRuleEntity = cFun.jsonTryParse(flow.flowRule);
      let message = {
        flowID: flow.flowID,
        villageIDs: flowVillageIDs,
        flowName: flow.flowName,
        isValid: flow.isValid,
        isDelete: flow.isDelete,
        insertTime: cFun.formatDateTime(flow.insertTime),
        level: flowOptions[0].alarmLevel,
        ruleName: model == null ? '' : model.modelName,
        flows: []
      };

      if (flowRuleEntity != null) {
        for (let j = 0; j < flowRuleEntity.flows.length; j++) {
          let flow = flowRuleEntity.flows[j];

          var resFlow = {
            pushType: flow.pushType,
            messageTemplate: flow.messageTemplate,
            messageTitle: flow.messageTitle,
            messagePushTime: flow.messagePushTime,
            roles: []
          };

          if (flow.roleIDs != null) {
            let roles = await roleDal.getByRoleIDs(flow.roleIDs);
            if (roles) {
              for (let i = 0; i < roles.length; i++) {
                resFlow.roles.push({
                  roleID: roles[i].roleID,
                  roleName: roles[i].roleName
                });

              }

            }

          }

          message.flows.push(resFlow);
        }
      }


      resMessages.push(message);
    }
  }

  return res.json(
    cFun.responseStatus(0, "success", {
      messages: resMessages
    })
  );
});
module.exports.get = get;

var verifyMessageTemplate = function (messageTemplate) {
  if (cFun.isNullOrEmpty(messageTemplate)) {
    return false;
  }

  return true;
};

var getCount = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body;

  var messageCount = await flowDal.count();

  return res.json(
    cFun.responseStatus(0, "success", {
      count: messageCount
    })
  );
});
module.exports.getCount = getCount;

var updateDelete = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body;

  for (let i = 0; i < reqBody.messages.length; i++) {
    let message = reqBody.messages[i];

    let flow = await flowDal.getByID(message.flowID);
    let options = await alarmOptionDal.getByFlowID(message.flowID);

    if (flow != null) {
      flow.isDelete = 1;
      flowDal.update(flow);
    }

    for (let j = 0; j < options.length; j++) {
      options[j].isDelete = 1;
      alarmOptionDal.update(options[j]);
    }
  }

  return res.json(cFun.responseStatus(0, "success"));
});
module.exports.updateDelete = updateDelete;

var updateValid = cFun.awaitHandlerFactory(async (req, res, next) => {
  var reqBody = req.body;

  for (let i = 0; i < reqBody.messages.length; i++) {
    let message = reqBody.messages[i];

    let flow = await flowDal.getByID(message.flowID);
    let options = await alarmOptionDal.getByFlowID(message.flowID);

    if (flow != null) {
      flow.isValid = Number(message.isValid);
      flowDal.update(flow);
    }

    for (let j = 0; j < options.length; j++) {
      options[j].isValid = Number(message.isValid);
      alarmOptionDal.update(options[j]);
    }
  }

  return res.json(cFun.responseStatus(0, "success"));
});
module.exports.updateValid = updateValid;