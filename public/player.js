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
		this.colour = playerObject.colour;
		this.username = playerObject.username;
	}

	display() {
		if (this.renderedSize < this.size) {
			let sizeDifference = (this.size - this.renderedSize) / 7
			if (sizeDifference < 0.001) {
				this.renderedSize = this.size
			} else {
				this.renderedSize += sizeDifference
			}
		}

		fill(this.colour);
		noStroke();
		circle((this.location.x - client.camera.x) * client.camera.zoom + windowWidth / 2, (this.location.y - client.camera.y) * client.camera.zoom + windowHeight / 2, this.renderedSize * client.camera.zoom);
		fill('gray')
		textSize(30)
		text(this.username, ((this.location.x - client.camera.x) * client.camera.zoom + windowWidth / 2) - (this.username.length * 7), (this.location.y - client.camera.y) * client.camera.zoom + windowHeight / 2);
	}

	updateLocalClientData() {
		client.camera.x = player.location.x
		client.camera.y = player.location.y
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

		if (this.location.x > client.size.x) {
			this.location.x = client.size.x
		}
		if (this.location.x < 0) {
			this.location.x = 0
		}
		if (this.location.y > client.size.y) {
			this.location.y = client.size.y
		}
		if (this.location.y < 0) {
			this.location.y = 0
		}
	}
}