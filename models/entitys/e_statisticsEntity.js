module.exports = class e_statisticsEntity {
    constructor(statisticID, path, name, data, timeInterval, insertTime, updateTime) {
        this.statisticID = statisticID;
        this.path = path;
        this.name = name;
        this.data = data;
        this.timeInterval = timeInterval;
        this.insertTime = insertTime;
        this.updateTime = updateTime;
    }
}