module.exports = class s_job_configEntity {
    constructor(jobID, name, prority, group, status, path, rule, remark, param, lastEndTime, owner, insertTime, updateTime) {
        this.jobID = jobID;
        this.name = name;
        this.prority = prority;
        this.group = group;
        this.status = status;
        this.path = path;
        this.rule = rule;
        this.remark = remark;
        this.param = param;
        this.lastEndTime = lastEndTime;
        this.owner = owner;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}