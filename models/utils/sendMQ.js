const mqtt = require('mqtt');

module.exports = function sentMQ(publishURL , data)
{
    //消息队列
    var mqttClient = mqtt.connect(process.env.MQTT_HOST);
    mqttClient.on('connect',function(){
       console.log('connected');
        mqttClient.publish(publishURL, JSON.stringify(data));
        mqttClient.end();
    });
}

