let map;
let id;
let clientPlayerArray = [];
let mainPlayer;
var socket;
let frames = 0;
let cameraX = 0;
let cameraY = 0;
let cameraZoom = 1;
let debugInfo = 0;
let renderedFood = 0;

// make camera work using this https://editor.p5js.org/carl-vbn/sketches/L5AFIST1U


function setup() {
  frameRate(60)
  socket = io.connect('http://109.130.192.116:3000')

  socket.on('playerId', (recievedId) => {
    id = recievedId
    console.log('Recieved ID: ' + id)
  })

  socket.on('mapData', (recievedMap) => {
    map = recievedMap;
    console.log('Recieved game map')
    createCanvas(windowWidth, windowHeight);

    console.log(map.playerContainer)
    for (playerObject in map.playerContainer) {
      if (playerObject != id) {
        clientPlayerArray.push(new Player(map['playerContainer'][playerObject], playerObject))
      } else {
        mainPlayer = new Player(map['playerContainer'][playerObject], playerObject)
      }
    }
    console.log(clientPlayerArray)
  })

  socket.on('newPlayer', (playerId) => {
    console.log('New player connected')
    map['playerContainer'][playerId] = {
      x: map.size.x/2,
      y: map.size.x/2,
      size: 20
    }
    clientPlayerArray.push(new Player(map['playerContainer'][playerId], playerId))

  })

  socket.on('playerPosition', (positionData) => {
    // player position in positionData is given in x and y coordinates
    // player position in map.playerContainer same
    // player position in clientPlayerArray is given in vector (location.x and location.y) because they are objects created from classes
    
    map['playerContainer'][positionData.id]['x'] = positionData.x
    map['playerContainer'][positionData.id]['y'] = positionData.y
    map['playerContainer'][positionData.id]['size'] = positionData.size

    var currentlyUpdatingPlayerIndex = clientPlayerArray.map(function(player) { return player.id; }).indexOf(positionData.id);
    
    clientPlayerArray[currentlyUpdatingPlayerIndex]['location']['x'] = positionData.x
    clientPlayerArray[currentlyUpdatingPlayerIndex]['location']['y'] = positionData.y
    clientPlayerArray[currentlyUpdatingPlayerIndex]['size'] = positionData.size
  })

  socket.on('foodEaten', (eatenFoodIndex) => {
    map.foodArray.splice(eatenFoodIndex, 1)
  })

  socket.on('foodGenerated', (generatedFood) => {
    map.foodArray.push(generatedFood)
  })

  socket.on('playerDisconnected', (disconnectedPlayerId) => {
    delete map['playerContainer'][disconnectedPlayerId];
    clientPlayerArray.splice(clientPlayerArray.indexOf(clientPlayerArray.filter(player => player.id == disconnectedPlayerId)), 1);
  })
}

function draw() {
  if (!map || !id) {
    return;
  }

  background(220);

  // failed attempt at doing borders lol

  // fill('black')
  // rect(map.size.x/2, map.size.y, map.size.x, 20)
  // rect(map.size.x/2, 0, map.size.x, 20)
  // rect(map.size.x, map.size.y/2, 20, map.size.y)
  // rect(0, map.size.y/2, 20, map.size.y)

  renderedFood = 0;
  map.foodArray.forEach((food) => {
    // cull food out of the screen to keep from lag on large maps
    if (food.x > cameraX + (windowWidth/2 + 10)/cameraZoom || food.x < cameraX - (windowWidth/2 + 10)/cameraZoom || food.y > cameraY + (windowHeight/2 + 10)/cameraZoom || food.y < cameraY - (windowHeight/2 + 10)/cameraZoom) {
      return;
    }
    fill(food.colour)
    noStroke()
    circle((food.x-cameraX)*cameraZoom + windowWidth/2, (food.y-cameraY)*cameraZoom + windowHeight/2, 10*cameraZoom);
    renderedFood++;
  })

  // TODO: render players in order of opposite size so larger players appear on top :P
  clientPlayerArray.forEach((player) => {
    player.display("red", cameraX, cameraY)
  })

  mainPlayer.display("blue", cameraX, cameraY, cameraZoom)
  mainPlayer.move()
  mainPlayer.checkEat(map.foodArray)
  
  cameraX = mainPlayer.location.x
  cameraY = mainPlayer.location.y

  cameraZoom = 20/mainPlayer.size + 0.7

  // broadcasting loop
  if (frames % 3 == 0) {
    mainPlayer.emitPosition()
  }

  if (debugInfo == 1 || debugInfo == 2) {
    textSize(16);
    fill(0, 102, 153, 255);
    text('Debug Data', 10, 20);
    fill(0, 102, 153, 200);
    text('Zoom: ' + cameraZoom, 10, 40);
    text('Camera X, Y: ' + cameraX + ' , ' + cameraY, 10, 60);
    text('Frame: ' + frames, 10, 80);
    text('Other Players Count: ' + clientPlayerArray.length, 10, 100);
    text('Total Food/Rendered Food: ' + map.foodArray.length + '/' + renderedFood, 10, 120);
  }

  frames++
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