let renderedFood = 0;
let client;

function setup() {
	frameRate(60);
	createCanvas(windowWidth, windowHeight);
	socket = io.connect('http://localhost:3000');

	socket.on('gameData', (recievedData) => {
		console.log('Recieved game data')

		// maybe size should go to map class?
		client = new Client(recievedData.id, recievedData.size)
		console.log('Generated client')
		
		for (playerId in recievedData.playerContainer) {
			client.playerArray.push(new Player(recievedData.playerContainer[playerId], playerId))
		}
		console.log('Pushed players')

		for (food of recievedData.foodArray) {
			client.foodArray.push(new Food(food))
		}
		console.log('Pushed food')
	})

	socket.on('newPlayer', (playerObject) => {
		console.log('New player connected, ' + playerObject.playerId);
		client.playerArray.push(new Player(playerObject.playerEntity, playerObject.playerId));
	})

	socket.on('foodGenerated', (generatedFood) => {
		client.foodArray.push(new Food(generatedFood))
	})

	socket.on('playerDisconnected', (disconnectedPlayerId) => {
		console.log('A player disconnected')
		client.playerArray.splice(client.playerArray.map((player) => { return player.id; }).indexOf(disconnectedPlayerId), 1);
	})

	socket.on('eatenPlayer', data => {
		if (data.eatenPlayerId == client.id) {
			client.status = 1;
		}
		client.playerArray.splice(client.playerArray.map((player) => { return player.id; }).indexOf(data.eatenPlayerId), 1);
		client.playerArray[client.playerArray.map((player) => { return player.id; }).indexOf(data.eatingPlayerId)].size += data.growingSize;
	})

	socket.on('foodEaten', (data) => {
		client.foodArray.splice(data.foodIndex, 1);
		client.playerArray[client.playerArray.map((player) => { return player.id; }).indexOf(data.playerId)].size = data.size;
	});

	socket.on('playersUpdate', playerContainer => {
		for (player in playerContainer) {
			var currentlyUpdatingPlayerIndex = client.playerArray.map((player) => { return player.id; }).indexOf(player)

			client.playerArray[currentlyUpdatingPlayerIndex].location.x = playerContainer[player].x
			client.playerArray[currentlyUpdatingPlayerIndex].location.y = playerContainer[player].y
			client.playerArray[currentlyUpdatingPlayerIndex].size = playerContainer[player].size
			client.playerArray[currentlyUpdatingPlayerIndex].velocity = playerContainer[player].velocity
		}
		client.playerArray.sort(function (a, b) { return a.size - b.size })
	})

	socket.on('disconnect', () => client.status = 2)
};

function draw() {
	if (!client) {
		background(255);
		textSize(26);
		fill(0, 102, 153, Math.sin(frameCount / 10) * 128 + 127);
		text('Connecting...', windowWidth / 2 - 50, windowHeight / 2 + 60);
		return;
	}

	// add to map class maybe?
	background(220);
	fill('white')
	rect((0 - client.camera.x) * client.camera.zoom + windowWidth / 2, (0 - client.camera.y) * client.camera.zoom + windowHeight / 2, client.size.x * client.camera.zoom, client.size.y * client.camera.zoom);
	
	renderedFood = 0;
	for (food of client.foodArray) {
		food.display()
		renderedFood++;
	}

	for (player of client.playerArray) {
		player.interpolateLocation()
		if (player.id == client.id) {
			player.updateLocalClientData()
			player.display()
		} else {
			player.display()
		}
	}
	
	if (client.checkStatus()) return;
	
	client.adjustZoom();
	
	if (frameCount % 3 == 0) {
		client.playerArray[client.playerArray.map((player) => { return player.id }).indexOf(client.id)].emitRotation();
	};

	if (client.debugMode == 1) {
		client.renderDebugMode();
	};
}

function keyPressed() {
	if (keyCode === SHIFT) {
		if (client.debugMode == 1) {
			client.debugMode = 0;
		} else {
			client.debugMode = 1;
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