// Connect to Stream Deck
let websocket = null;
const actionUUID = "be.elab.apint";

function connectElgatoStreamDeckSocket(port, pluginUUID) {
    websocket = new WebSocket(`ws://127.0.0.1:${port}`);

    websocket.onopen = function () {
        console.log("Connected to Stream Deck");
        const json = {
            event: "registerPlugin",
            uuid: pluginUUID
        };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        const message = JSON.parse(evt.data);
        if (message.event === "keyDown") {
            console.log("Button Pressed! Hello, World   ''!");
        }
    };
}
