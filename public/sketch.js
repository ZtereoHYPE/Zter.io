let foodArray = [];
let size;
let id;
let clientPlayerArray = [];
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 3;
let debugInfo = 0;
let renderedFood = 0;
let dead = false;
let disconnected = false;

function setup() {
	frameRate(60);
	createCanvas(windowWidth, windowHeight);
	socket = io.connect('http://localhost:3000');

	socket.on('gameData', (recievedData) => {
		disconnected = false;
		foodArray = recievedData.foodArray;
		size = recievedData.size;
		id = recievedData.id;
		console.log('Recieved game data')

		for (playerId in recievedData.playerContainer) {
			clientPlayerArray.push(new Player(recievedData.playerContainer[playerId], playerId))
		}
		console.log(clientPlayerArray)
	})

	socket.on('newPlayer', (playerObject) => {
		console.log('New player connected, ' + playerObject.playerId)
		clientPlayerArray.push(new Player(playerObject.playerEntity, playerObject.playerId))
		console.log(clientPlayerArray)
	})

	socket.on('foodGenerated', (generatedFood) => {
		foodArray.push(generatedFood)
	})

	socket.on('playerDisconnected', (disconnectedPlayerId) => {
		console.log('A player disconnected, splicing index ' + clientPlayerArray.map((player) => { return player.id; }).indexOf(disconnectedPlayerId))
		clientPlayerArray.splice(clientPlayerArray.map((player) => { return player.id; }).indexOf(disconnectedPlayerId), 1);
		console.log(clientPlayerArray)
	})

	socket.on('eatenPlayer', data => {
		if (data.eatenPlayerId == id) {
			dead = true;
		} 
		console.log(data)
		clientPlayerArray.splice(clientPlayerArray.map((player) => { return player.id; }).indexOf(data.eatenPlayerId), 1);
		clientPlayerArray[clientPlayerArray.map((player) => { return player.id; }).indexOf(data.eatingPlayerId)].size = data.growingSize;
	})
	
	socket.on('foodEaten', (data) => {
		foodArray.splice(data.foodIndex, 1);
		clientPlayerArray[clientPlayerArray.map((player) => { return player.id; }).indexOf(data.playerId)].size = data.size;
	});
	
	socket.on('playersUpdate', playerContainer => {
		for (player in playerContainer) {
			var currentlyUpdatingPlayerIndex = clientPlayerArray.map((player) => { return player.id; }).indexOf(player)

			clientPlayerArray[currentlyUpdatingPlayerIndex].location.x = playerContainer[player].x
			clientPlayerArray[currentlyUpdatingPlayerIndex].location.y = playerContainer[player].y
			clientPlayerArray[currentlyUpdatingPlayerIndex].size = playerContainer[player].size
			clientPlayerArray[currentlyUpdatingPlayerIndex].velocity = playerContainer[player].velocity
		}
	})
	
	socket.on('disconnect', () => disconnected = true)
};

function draw() {
	if (!id) {
		background(255);
		textSize(16);
		fill(0, 102, 153, Math.sin(frameCount / 20) * 128 + 128);
		text('Connecting...', 10, 20);
		return;
	}

	background(220);
	
	fill('white')
	rect((0 - cameraX) * cameraZoom + windowWidth / 2, (0 - cameraY) * cameraZoom + windowHeight / 2, size.x * cameraZoom, size.y * cameraZoom)

	renderedFood = 0;
	foodArray.forEach((food) => {
		if (food.x > cameraX + (windowWidth / 2 + 10) / cameraZoom || food.x < cameraX - (windowWidth / 2 + 10) / cameraZoom || food.y > cameraY + (windowHeight / 2 + 10) / cameraZoom || food.y < cameraY - (windowHeight / 2 + 10) / cameraZoom) {
			return;
		}
		fill(food.colour)
		noStroke()
		circle((food.x - cameraX) * cameraZoom + windowWidth / 2, (food.y - cameraY) * cameraZoom + windowHeight / 2, 10 * cameraZoom);
		renderedFood++;
	});

	clientPlayerArray.sort(function (a, b) { return a.size - b.size })

	for (player of clientPlayerArray) {
		player.interpolateLocation()
		if (player.id == id) {
			player.updateLocalClientData()
			player.display()
		} else {
			player.display()
		}
	}

	if (dead) {
		fill('darkred')
		textSize(50)
		text('You got eaten!', windowWidth / 2 - 160, windowHeight / 2);
		return;
	}

	if (disconnected) {
		fill('black')
		textSize(50)
		text('You are disconnected from the server', windowWidth / 2 - 380, windowHeight / 2);
		return;
	}

	if (cameraZoom < 20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size + 0.7) {
		if (dead) return
		let zoomDifference = ((20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size + 0.7) - cameraZoom) / 20
		if (zoomDifference < 0.0001) {
			cameraZoom = 20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size + 0.7;
		} else {
			cameraZoom += zoomDifference;
		}
	}
	if (cameraZoom > 20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size + 0.7) {
		let zoomDifference = (cameraZoom - (20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size + 0.7)) / 20
		if (zoomDifference < 0.0001) {
			cameraZoom = 20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size + 0.7;
		} else {
			cameraZoom -= zoomDifference;
		}
	}

	if (frameCount % 3 == 0) {
		clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].emitRotation();
	}

	if (debugInfo == 1 || debugInfo == 2) {
		textSize(16);
		fill(0, 102, 153, 255);
		text('Debug Data', 10, 20);
		fill(0, 102, 153, 200);
		text('Zoom: ' + cameraZoom + '/' + (cameraZoom - (20 / clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size + 0.7)), 10, 40);
		text('Camera X, Y: ' + Math.floor(cameraX) + ' , ' + Math.floor(cameraY), 10, 60);
		text('Frame: ' + frameCount, 10, 80);
		text('Other Players Count: ' + clientPlayerArray.length, 10, 100);
		text('Total Food/Rendered Food: ' + foodArray.length + '/' + renderedFood, 10, 120);
		text('Frames: ' + Math.floor(frameRate()), 10, 140);
		text('Size: ' + clientPlayerArray[clientPlayerArray.map((player) => { return player.id }).indexOf(id)].size, 10, 160);
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