let socket = new WebSocket("ws://localhost:9991");
socket.onopen = function (e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    socket.binaryType = "arraybuffer";
    //socket.send(`{"action": "getState", "parameters": {"stateOwner": "WeatherSensor"}}`);
    socket.send(`{"action": "subscribe", "parameters": {"stateOwner": "ApiDemoSensor"}}`);

};


socket.onmessage = function (event) {
    const data = JSON.parse(new TextDecoder("utf-8").decode(event.data)).messageContent.state
    console.log(data)
    addTo("home", data.home.join("<br>"));
    addTo("logged", data.logged.join("<br>"));


};

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
    }
};

socket.onerror = function (error) {
    console.log(`[error]`);
};

function addTo(name, text) {
    console.log(`${name}: ${text}`)
    document.getElementById(name).innerHTML = text;
}
