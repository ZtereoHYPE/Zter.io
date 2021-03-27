const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(3000);
const io = socket(server);

app.use(express.static('public'))

console.log('Le server is running...')

// When a socket connects, run connectionEvent
io.sockets.on('connect', connectionEvent);

// Create the map object containing players, food, and size
let map = {
    foodArray: [],
    playerContainer: {},
    size: {
        x: 300,
        y: 300
    }
}

// Push food to the foodArray
for (i = 0; i < map.size.x / 10 + 20; i++) {
    map.foodArray.push({
        x: Math.floor(Math.random() * map.size.x),
        y: Math.floor(Math.random() * map.size.y),
        colour: '#' + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6)
    })
}

// When a new client connects
function connectionEvent(socket) {
    // Console.log it
    console.log('New connection: ' + socket.id);

    // Add a player object in the playerContainer
    map["playerContainer"][socket.id] = {
        x: map.size.x / 2,
        y: map.size.x / 2,
        size: 20
    }

    // Send to the player their own id so they know what player of the container they are
    socket.emit('playerId', socket.id)

    // Send the player the entire map
    socket.emit('mapData', map)

    // Broadcast to other players the new player object
    socket.broadcast.emit('newPlayer', socket.id)

    // Add an event listener for position, which executes updatePlayer
    socket.on('position', updatePlayer);

    // TODO change the system to be server side maybe? idk
    socket.on('foodEaten', broacastFoodEaten)

    socket.on('disconnect', disconnectPlayer)

    socket.on('sizeDifference', updateSizes)

    // Update the player position in the server-side map and broadcast it to others
    function updatePlayer(positionData) {
        let id = positionData.id

        if (!map["playerContainer"][id]) return;

        map["playerContainer"][id]["x"] = positionData.x;
        map["playerContainer"][id]["y"] = positionData.y;

        socket.broadcast.emit('playerPosition', positionData);
    }

    // Broadcast the eaten food index. While there are less than 70 foods, push to the food array the new food and broadcast it
    function broacastFoodEaten(eatenFoodIndex) {
        socket.broadcast.emit('foodEaten', eatenFoodIndex);
        map.foodArray.splice(eatenFoodIndex, 1);
        while (map.foodArray.length < map.size.x / 10) {
            let food = {
                x: Math.floor(Math.random() * map.size.x),
                y: Math.floor(Math.random() * map.size.y),
                colour: '#' + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6)
            };
            map.foodArray.push(food);
            io.sockets.emit('foodGenerated', food)
        }
    }

    function updateSizes(size) {
        map['playerContainer'][this.id]['size'] = size;
    }
}

// Delete from the map the player and broadcast the deletion
function disconnectPlayer() {
    console.log('New disconnection: ' + this.id);
    delete map['playerContainer'][this.id]
    io.sockets.emit('playerDisconnected', this.id)
}