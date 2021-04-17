let map;
let id;
let clientPlayerArray = [];
let mainPlayer;
var socket;
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 3;
let debugInfo = 0;
let renderedFood = 0;
let dead = false;
let disconnected = false;

function setup() {
	frameRate(60)
	socket = io.connect('http://localhost:3000')

	socket.on('playerId', (recievedId) => {
		disconnected = false;
		id = recievedId
		console.log('Recieved ID: ' + id)
	})

	socket.on('mapData', (recievedMap) => {
		map = recievedMap;
		console.log('Recieved game map')
		createCanvas(windowWidth, windowHeight);

		for (playerObject in map.playerContainer) {
			if (playerObject != id) {
				clientPlayerArray.push(new Player(map['playerContainer'][playerObject], playerObject))
			} else {
				mainPlayer = new Player(map['playerContainer'][playerObject], playerObject)
			}
		}
		delete map['playerContainer'];
	})

	socket.on('newPlayer', (playerObject) => {
		console.log('New player connected')
		clientPlayerArray.push(new Player(
			{
				x: playerObject.playerEntity.x,
				y: playerObject.playerEntity.y,
				size: playerObject.playerEntity.size,
				velocity: {
					x: playerObject.playerEntity.velocity.x,
					y: playerObject.playerEntity.velocity.y
				}
			},
			playerObject.playerId))
	})

	socket.on('foodGenerated', (generatedFood) => {
		map.foodArray.push(generatedFood)
	})

	socket.on('playerDisconnected', (disconnectedPlayerId) => {
		clientPlayerArray.splice(clientPlayerArray.indexOf(clientPlayerArray.filter(player => player.id == disconnectedPlayerId)), 1);
	})

	socket.on('eatenPlayer', data => {
		console.log(data.eatenPlayerId + ' got eaten')

		if (data.eatenPlayerId == id) {
			mainPlayer = false;
			dead = true;
		} else {
			if (data.eatingPlayerId == id) {
				mainPlayer.size += data.growingSize
				console.log(data.growingSize)
			}

			clientPlayerArray.splice(clientPlayerArray.indexOf(clientPlayerArray.filter(player => player.id == data.eatenPlayerId)), 1);
		}
	})

	socket.on('disconnect', () => disconnected = true)

	socket.on('foodEaten', (data) => {
		map.foodArray.splice(data.foodIndex, 1);

		if (data.playerId == id) {
			mainPlayer.size == data.size;
		} else {
			clientPlayerArray[clientPlayerArray.map((player) => { return player.id; }).indexOf(data.playerId)].size = data.size;
		}
	});

	socket.on('playersUpdate', playerContainer => {
		if (!dead) {
			mainPlayer.location.x = playerContainer[id].x
			mainPlayer.location.y = playerContainer[id].y
			mainPlayer.size = playerContainer[id].size
			delete playerContainer[id]
		}

		for (player in playerContainer) {
			var currentlyUpdatingPlayerIndex = clientPlayerArray.map((player) => { return player.id }).indexOf(player);

			clientPlayerArray[currentlyUpdatingPlayerIndex].location.x = playerContainer[player].x
			clientPlayerArray[currentlyUpdatingPlayerIndex].location.y = playerContainer[player].y
			clientPlayerArray[currentlyUpdatingPlayerIndex].size = playerContainer[player].size
			clientPlayerArray[currentlyUpdatingPlayerIndex].velocity = playerContainer[player].velocity
		}
	})
};

function draw() {
	if (!map || !id) {
		background(255);
		textSize(16);
		fill(0, 102, 153, Math.sin(frameCount / 20) * 128 + 128);
		text('Connecting...', 10, 20);
		return;
	}

	background(220);

	fill('white')
	rect((0 - cameraX) * cameraZoom + windowWidth / 2, (0 - cameraY) * cameraZoom + windowHeight / 2, map.size.x * cameraZoom, map.size.y * cameraZoom)

	renderedFood = 0;
	map.foodArray.forEach((food) => {
		if (food.x > cameraX + (windowWidth / 2 + 10) / cameraZoom || food.x < cameraX - (windowWidth / 2 + 10) / cameraZoom || food.y > cameraY + (windowHeight / 2 + 10) / cameraZoom || food.y < cameraY - (windowHeight / 2 + 10) / cameraZoom) {
			return;
		}
		fill(food.colour)
		noStroke()
		circle((food.x - cameraX) * cameraZoom + windowWidth / 2, (food.y - cameraY) * cameraZoom + windowHeight / 2, 10 * cameraZoom);
		renderedFood++;
	})

	// TODO: this is an attempt at sorting... does it work?
	clientPlayerArray.sort(function (a, b) { return b.size - a.size })

	// TODO: find a way to render the mainplayer in this loop... maybe add it in the clientplayerarray and do some magic to recognise it.
	for (player of clientPlayerArray) {
		player.interpolateLocation()
		player.display("red", cameraX, cameraY, cameraZoom)
	}

	if (mainPlayer) {
		cameraX = mainPlayer.location.x
		cameraY = mainPlayer.location.y
		mainPlayer.move()
		mainPlayer.display("blue", cameraX, cameraY, cameraZoom)
	}

	// TODO add shrinking zoom code
	if (cameraZoom > 20 / mainPlayer.size + 0.7) {
		let zoomDifference = (cameraZoom - (20 / mainPlayer.size + 0.7)) / 20
		if (zoomDifference < 0.0001) {
			cameraZoom = 20 / mainPlayer.size + 0.7;
		} else {
			cameraZoom -= zoomDifference;
		}
	}

	if (frameCount % 3 == 0 && mainPlayer) {
		mainPlayer.emitRotation();
	}

	if (debugInfo == 1 || debugInfo == 2) {
		textSize(16);
		fill(0, 102, 153, 255);
		text('Debug Data', 10, 20);
		fill(0, 102, 153, 200);
		text('Zoom: ' + cameraZoom + '/' + (cameraZoom - (20 / mainPlayer.size + 0.7)), 10, 40);
		text('Camera X, Y: ' + Math.floor(cameraX) + ' , ' + Math.floor(cameraY), 10, 60);
		text('Frame: ' + frameCount, 10, 80);
		text('Other Players Count: ' + clientPlayerArray.length, 10, 100);
		text('Total Food/Rendered Food: ' + map.foodArray.length + '/' + renderedFood, 10, 120);
		text('Frames: ' + Math.floor(frameRate()), 10, 140);
		text('Size: ' + mainPlayer.size, 10, 160);
	}
	if (dead) {
		fill('black')
		textSize(50)
		text('You got eaten!', windowWidth / 2 - 160, windowHeight / 2);
	}
	if (disconnected) {
		fill('black')
		textSize(50)
		text('You are disconnected from the server', windowWidth / 2 - 260, windowHeight / 2);
	}
}

function keyPressed() {
	if (keyCode === SHIFT) {
		if (debugInfo == 1) {
			debugInfo = 0;
		} else {
			debugInfo = 1;
		}
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function normalizeCoordinates(object) {
	let magnitude = Math.sqrt(object.x * object.x + object.y * object.y)
	return {
		x: object.x / magnitude,
		y: object.y / magnitude
	};
}

function calculateDistance(object1, object2) {
	let differenceX = object1.x - object2.x;
	let differenceY = object1.y - object2.y;

	return Math.sqrt(differenceX * differenceX + differenceY * differenceY);
}