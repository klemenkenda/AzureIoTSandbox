const fetch = require('node-fetch');

let connectionString = 'HostName=TestLabIoT.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=7N66F5k97GiFubYGI/JuBZyxAUy8bESn+neL3T6tI/Q=';

let deviceId = 'pi-simulator';

let { EventHubClient, EventPosition } = require('@azure/event-hubs');

function printError (err) {
  console.log(err.message);
};

// Display the message content - telemetry and properties.
// - Telemetry is sent in the message body
// - The device can add arbitrary application properties to the message
// - IoT Hub adds system properties, such as Device Id, to the message.
function processMessage(message) {
  try {
    console.log('Telemetry received: ');
    let json = message.body;
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

    console.log(data);

    fetch(url, param)
      .then(data => { return data.json })
      .then(res => {console.log(JSON.stringify(res))})
      .catch(error => console.log(error));

  } catch (err) {
    console.log(err);
  }

};

let ehClient;

EventHubClient.createFromIotHubConnectionString(connectionString).then((client) => {
  console.log("Successfully created the EventHub Client from iothub connection string.");
  ehClient = client;
  return ehClient.getPartitionIds();
}).then((ids) => {
  console.log("The partition ids are: ", ids);
  return ids.map(function(id) {
    return ehClient.receive(id, processMessage, printError, { eventPosition: EventPosition.fromEnqueuedTime(Date.now()) });
  });

}).catch(printError);
