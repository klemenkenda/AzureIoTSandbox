// Ported to Azure Function App (lambda).

const fetch = require('node-fetch');

// Display the message content - telemetry and properties.
// - Telemetry is sent in the message body
// - The device can add arbitrary application properties to the message
// - IoT Hub adds system properties, such as Device Id, to the message.
function processMessage(context, message) {
    try {
        context.log('Telemetry received: ');        
        let json = message;        
        let val = json.temperature;

        let d = new Date();
        let ts = d.toISOString();

        let url = 'https://app.qlector.com/api-wrapper/datasources/';

        let apiKey = '74d6c12b5f3e44c5b700319773945ff0';  // DS API key
        let dsUUID = 'a75c19eb7a04407d9d632fd9246c69f1';
        let apiUUID = '6e2862c471694cd8aa2cfdfdd8517b7a';

        url += dsUUID + "-" + apiKey;

        let data = {
            "data_source": dsUUID,
            "ts": ts,
            "val": val
        }

        let headers = {
        'Content-type': 'application/json', 'Accept': 'text/plain',
        'Authorization': 'Basic ' + Buffer.from(dsUUID + ":" + apiKey).toString('base64')
        }

        let param = {
            headers: headers,
            body: JSON.stringify(data),
            method: "POST"
        }

        context.log(JSON.stringify(data));

        fetch(url, param)
        .then(data => { return data.json })
        .then(res => {console.log(JSON.stringify(res))})
        .catch(error => console.log(error));

    } catch (err) {
        context.log(err);
    }

};

module.exports = function (context, IoTHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array: ${IoTHubMessages}`);
    
    IoTHubMessages.forEach(message => {
        context.log("Start:" + JSON.stringify(message));
        processMessage(context, message);
    });

    context.done();
};
