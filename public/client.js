class Client {
    constructor(id, size) {
        this.id = id;
        this.size = size;
        this.status = 0;
        this.camera = {
            x: 0,
            y: 0,
            zoom: 3
        };
        this.foodArray = [];
        this.playerArray = [];
        this.debugMode = 0;
    };

    checkStatus() {
        if (this.status == 1) {
            fill('darkred')
            textSize(50)
            text('You got eaten!', windowWidth / 2 - 160, windowHeight / 2);
            return true;
        } else if (client.status == 2) {
            background(255);
            fill('black')
            textSize(50)
            text('You are disconnected from the server', windowWidth / 2 - 380, windowHeight / 2);
            textSize(26);
            fill(0, 102, 153, Math.sin(frameCount / 10) * 128 + 127);
            text('Connecting...', windowWidth / 2 - 50, windowHeight / 2 + 60);
            return true;
        }
    };

    adjustZoom() {
        let idealZoom = 20 / client.playerArray[client.playerArray.map((player) => { return player.id }).indexOf(client.id)].size + 0.7
        let zoomDifference = Math.abs((idealZoom - client.camera.zoom) / 20)
        if (client.camera.zoom < idealZoom) {
            if (zoomDifference < 0.0000001) {
                client.camera.zoom = idealZoom;
            } else {
                client.camera.zoom += zoomDifference;
            }
        } else if (client.camera.zoom > idealZoom) {
            if (zoomDifference < 0.0000001) {
                client.camera.zoom = idealZoom;
            } else {
                client.camera.zoom -= zoomDifference;
            }
        }
    };

    renderDebugMode() {
		textSize(16);
		fill(0, 102, 153, 255);
		text('Debug Data', 10, 20);
		fill(0, 102, 153, 200);
		text('Zoom: ' + client.camera.zoom + '/' + (client.camera.zoom - (20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(client.id)].size + 0.7)), 10, 40);
		text('Camera X, Y: ' + Math.floor(client.camera.x) + ' , ' + Math.floor(client.camera.y), 10, 60);
		text('Frame: ' + frameCount, 10, 80);
		text('Other Players Count: ' + client.playerArray.length, 10, 100);
		text('Total Food/Rendered Food: ' + client.foodArray.length + '/' + renderedFood, 10, 120);
		text('Frames: ' + Math.floor(frameRate()), 10, 140);
		text('Size: ' + client.playerArray[client.playerArray.map((player) => { return player.id }).indexOf(id)].size, 10, 160);
    }
}