class Client {
    constructor(id, size) {
        this.id = id;
        this.size = size;
        this.status = 0;
        this.camera = {
            x: 0,
            y: 0,
            zoom: 5
        };
        this.foodArray = [];
        this.playerArray = [];
        this.debugMode = false;
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
        let idealZoom = 30 / client.playerArray[client.playerArray.map((player) => { return player.id }).indexOf(client.id)].size + 0.7
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
		text('Zoom/zoomDifference: ' + this.camera.zoom + '/' + (this.camera.zoom - (20 / this.playerArray[this.playerArray.map((player) => { return player.id }).indexOf(this.id)].size + 0.7)), 10, 40);
		text('Camera X, Y: ' + Math.floor(this.camera.x) + ' , ' + Math.floor(this.camera.y), 10, 60);
		text('Frame: ' + frameCount, 10, 80);
		text('Players count: ' + this.playerArray.length, 10, 100);
		text('Total Food/Rendered Food: ' + this.foodArray.length + '/' + renderedFood, 10, 120);
		text('Frames: ' + Math.floor(frameRate()), 10, 140);
		text('Size: ' + this.playerArray[this.playerArray.map((player) => { return player.id }).indexOf(this.id)].size, 10, 160);
    };

    drawMap() {
        background(220);
	    fill('white')
	    rect((0 - this.camera.x) * this.camera.zoom + windowWidth / 2, (0 - this.camera.y) * this.camera.zoom + windowHeight / 2, this.size.x * this.camera.zoom, this.size.y * this.camera.zoom);
    }
}