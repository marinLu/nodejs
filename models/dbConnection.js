const Sequelize = require('sequelize');
module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        operatorsAliases: false,
        pool: {
            max: 5000,
            min: 0,
            idle: 10000
        },
        timezone: '+08:00',
        benchmark: true
    })