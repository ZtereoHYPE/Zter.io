const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(3000);
const io = socket(server);

app.use(express.static('public'));

console.log('Le server is running...');

// When a socket connects, run connectionEvent
io.sockets.on('connect', connectionEvent);

// Create the map object containing players, food, and size
let foodArray = []

let size = {
	x: 300,
	y: 300
}

let playerContainer = {};

// Push food to the foodArray
for (i = 0; i < size.x / 5; i++) {
	foodArray.push({
		x: Math.floor(Math.random() * size.x),
		y: Math.floor(Math.random() * size.y),
		colour: '#' + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6)
	})
};

// When a new client connects
function connectionEvent(socket) {
	console.log('New connection: ' + socket.id);

	playerContainer[socket.id] = {
		x: size.x / 2,
		y: size.y / 2,
		size: 20,
		velocity: {
			x: 0,
			y: 0
		}
	};

	socket.emit('playerId', socket.id);

	socket.emit('mapData', { foodArray, playerContainer, size });

	socket.broadcast.emit('newPlayer', socket.id);

	socket.on('disconnect', disconnectPlayer);

	socket.on('rotation', updateVelocity)

	function updateVelocity(velocity) {
		if (!playerContainer[this.id]) return;
		playerContainer[this.id]['velocity'] = velocity;
	}
};

// Delete from the map the player and broadcast the deletion
function disconnectPlayer() {
	console.log('Player disconnected: ' + this.id);
	delete playerContainer[this.id];
	io.sockets.emit('playerDisconnected', this.id)
};


setInterval(tickLoop, 50);

function tickLoop() {
	// update locations aka move 'em
	for (player in playerContainer) {
		// TODO: change this 'algorithm' to keep slowing down but less and less idk find a balance
		playerContainer[player]['x'] += playerContainer[player]['velocity']['x'] / playerContainer[player]['size'] * 300
		playerContainer[player]['y'] += playerContainer[player]['velocity']['y'] / playerContainer[player]['size'] * 300
		
		if (playerContainer[player].x > size.x) {
			playerContainer[player].x = size.x
		}
		if (playerContainer[player].x < 0) {
			playerContainer[player].x = 0
		}
		if (playerContainer[player].y > size.y) {
			playerContainer[player].y = size.y
		}
		if (playerContainer[player].y < 0) {
			playerContainer[player].y = 0
		}
	};
	
	// check for food eating
	for (player in playerContainer) {
		for (food of foodArray) {
			if (calculateDistance(playerContainer[player], food) < playerContainer[player].size / 2 - 2) {
				playerContainer[player].size += 200 / playerContainer[player].size;
				
				var data = {
					foodIndex: foodArray.indexOf(food),
					playerId: player,
					size: playerContainer[player].size
				};
				
				foodArray.splice(data.foodIndex, 1);
				
				io.sockets.emit('foodEaten', data);
				
				while (foodArray.length < size.x / 5) {
					let food = {
						x: Math.floor(Math.random() * size.x),
						y: Math.floor(Math.random() * size.y),
						colour: '#' + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6)
					};
					foodArray.push(food);
					io.sockets.emit('foodGenerated', food);
				};
			};
		};
	};
	
	
	
	// TODO: send this after everything and find more efficient method to update only the ones that moved/ate or only the data we care about
	io.sockets.emit('playersUpdate', playerContainer);
	
	// TODO find a way to order the array in size in order to skip check for bigger or smaller player later (if it's faster)
	// Maybe to not sort it everytime check if the number changed and if yes then redo and sort and if no then check if every element is same and then if yes reuse old (if ever sorting is slow)
	let playerCache = Object.keys(playerContainer);
	
	for (let i = 0; i < playerCache.length - 1; i++) {
		for (let j = i + 1; j < playerCache.length; j++) {
			
			// TODO remove this when the array is ordered and do smart stuff to know the bigger one
			if (playerContainer[playerCache[i]].size > playerContainer[playerCache[j]].size) {
				largerPlayer = playerCache[i];
				smallerPlayer = playerCache[j];
				
			} else if (playerContainer[playerCache[i]].size < playerContainer[playerCache[j]].size) {
				smallerPlayer = playerCache[i];
				largerPlayer = playerCache[j];
				
			} else {
				console.log('identical players found, skipping')
				continue;
			};
			
			if (calculateDistance(playerContainer[smallerPlayer], playerContainer[largerPlayer]) < playerContainer[largerPlayer].size / 2) {
				console.log(smallerPlayer + ' got eaten')
				
				let data = {
					eatenPlayerId: smallerPlayer,
					eatingPlayerId: largerPlayer,
					eatenPlayerSize: playerContainer[smallerPlayer].size
				};
				
				
				playerContainer[largerPlayer].size += playerContainer[smallerPlayer].size
				
				delete playerContainer[smallerPlayer];
				
				io.sockets.emit('eatenPlayer', data);
				playerCache.splice(playerCache.indexOf(playerCache.filter(playerId => playerId == smallerPlayer)), 1);
				continue;
			};
		};
	};
};

function calculateDistance(object1, object2) {
	let differenceX = object1.x - object2.x;
	let differenceY = object1.y - object2.y;
	return Math.sqrt(differenceX * differenceX + differenceY * differenceY);
};