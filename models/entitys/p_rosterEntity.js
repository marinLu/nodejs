module.exports = class p_rosterEntity {
    constructor(rosterID, villageID, workerID, workWeek, workStartTime, workEndTime, rosterStartTime, rosterEndTime, insertTime, updateTime) {
        this.rosterID = rosterID;
        this.villageID = villageID;
        this.workerID = workerID;
        this.workWeek = workWeek;
        this.workStartTime = workStartTime;
        this.workEndTime = workEndTime;
        this.rosterStartTime = rosterStartTime;
        this.rosterEndTime = rosterEndTime;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}