class Food {
    constructor(foodObject) {
        this.x = foodObject.x;
        this.y = foodObject.y;
        this.colour = foodObject.colour;
    }

    display() {
        if (food.x > client.camera.x + (windowWidth / 2 + 10) / client.camera.zoom || food.x < client.camera.x - (windowWidth / 2 + 10) / client.camera.zoom || food.y > client.camera.y + (windowHeight / 2 + 10) / client.camera.zoom || food.y < client.camera.y - (windowHeight / 2 + 10) / client.camera.zoom) {
			return;
		}
		fill(this.colour)
		noStroke()
		circle((this.x - client.camera.x) * client.camera.zoom + windowWidth / 2, (this.y - client.camera.y) * client.camera.zoom + windowHeight / 2, 10 * client.camera.zoom);
		renderedFood++;
    }
}