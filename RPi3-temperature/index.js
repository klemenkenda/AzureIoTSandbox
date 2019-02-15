const sensor = require('ds18b20-raspi');

const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

const connectionString = 'HostName=TestLabIoT.azure-devices.net;DeviceId=pi-simulator;SharedAccessKey=8ZXRZwgRhO9tXA1JE+9lXElXEdORR4aVRudOlIE31cI=';

var sendingMessage = true;
var messageId = 0;

// round temperature reading to 1 digit
function getMessage(cb) {
    messageId++;
    const tempC = sensor.readSimpleC(1);
    cb(JSON.stringify({
        messageId: messageId,
        deviceId: 'RPi Web Client',
        temperature: tempC,
        humidity: -1.0
    }));
};

// create a client
client = Client.fromConnectionString(connectionString, Protocol);


function onStart(request, response) {
    console.log('Try to invoke method start(' + request.payload + ')');
    sendingMessage = true;

    response.send(200, 'Successully start sending message to cloud', function (err) {
        if (err) {
        console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
        }
    });
}

function onStop(request, response) {
    console.log('Try to invoke method stop(' + request.payload + ')');
    sendingMessage = false;

    response.send(200, 'Successully stop sending message to cloud', function (err) {
        if (err) {
        console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
        }
    });
}

function receiveMessageCallback(msg) {
    var message = msg.getData().toString('utf-8');
    client.complete(msg, function () {
        console.log('Receive message: ' + message);
    });
}

function sendMessage() {
    console.log("Trying to send a message.");
    if (!sendingMessage) { return; }

    getMessage(function (content) {
        var message = new Message(content);
        console.log('Sending message: ' + content);
        client.sendEvent(message, function (err) {
        if (err) {
            console.error('Failed to send message to Azure IoT Hub');
        } else {
            console.log('Message sent to Azure IoT Hub');
        }
        });
    });
}

client.open(function(err) {
    if (err) {
        console.error('[IoT hub Client] Connect error: ' + err.message);
        return;
    }

    // set C2D and device method callback
    client.onDeviceMethod('start', onStart);
    client.onDeviceMethod('stop', onStop);
    client.on('message', receiveMessageCallback);
    setInterval(sendMessage, 15000);
});
