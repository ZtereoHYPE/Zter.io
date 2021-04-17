class Player {
	constructor(playerObject, playerId) {
		this.location = {
			x: playerObject.x,
			y: playerObject.y
		}
		this.size = playerObject.size;
		this.renderedSize = 0
		this.id = playerId;
		this.velocity = {
			x: playerObject.velocity.x,
			y: playerObject.velocity.y
		};
	}

	display(colour, cameraX, cameraY, cameraZoom) {
		if (this.renderedSize < this.size) {
			let sizeDifference = (this.size - this.renderedSize) / 7
			if (sizeDifference < 0.001) {
				this.renderedSize = this.size
			} else {
				this.renderedSize += sizeDifference
			}
		}

		fill(colour);
		noStroke();
		circle((this.location.x - cameraX) * cameraZoom + windowWidth / 2, (this.location.y - cameraY) * cameraZoom + windowHeight / 2, this.renderedSize * cameraZoom);
		fill('black');
		text(this.id, (this.location.x - cameraX) * cameraZoom + windowWidth / 2, (this.location.y - cameraY) * cameraZoom + windowHeight / 2);
	}

	updateClientVelocity() {
		this.velocity.x = (mouseX - windowWidth / 2) / this.size
		this.velocity.y = (mouseY - windowHeight / 2) / this.size
		if (Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) > 1) {
			this.velocity = normalizeCoordinates(this.velocity)
		}
	}

	emitRotation() {
		this.velocity.x = (mouseX - windowWidth / 2) / this.size
		this.velocity.y = (mouseY - windowHeight / 2) / this.size

		if (Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) > 1) {
			this.velocity = normalizeCoordinates(this.velocity)
		}

		socket.emit('rotation', this.velocity)
	}

	interpolateLocation() {
		this.location.x += this.velocity.x / this.size * 100
		this.location.y += this.velocity.y / this.size * 100

		if (this.location.x > map.size.x) {
			this.location.x = map.size.x
		}
		if (this.location.x < 0) {
			this.location.x = 0
		}
		if (this.location.y > map.size.y) {
			this.location.y = map.size.y
		}
		if (this.location.y < 0) {
			this.location.y = 0
		}
	}
}