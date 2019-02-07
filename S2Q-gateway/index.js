const fetch = require('node-fetch');

let url = 'https://app.qlector.com/api-wrapper/datasources/';

let apiKey = '74d6c12b5f3e44c5b700319773945ff0';  // DS API key
let dsUUID = 'a75c19eb7a04407d9d632fd9246c69f1';
let apiUUID = '6e2862c471694cd8aa2cfdfdd8517b7a';

url += dsUUID + "-" + apiKey;

let val = 26.0 + (Math.random() - 0.5) * 2;

let d = new Date();
let ts = d.toISOString();

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