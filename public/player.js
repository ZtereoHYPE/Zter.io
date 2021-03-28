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
      x: 0,
      y: 0
    }
  }

  display(colour, cameraX, cameraY, cameraZoom) {
    if (this.renderedSize < this.size) {
      let sizeDifference = (this.size - this.renderedSize)/7
      if (sizeDifference < 0.001) {
        this.renderedSize = this.size
      } else {
        this.renderedSize += sizeDifference
      }
    }
    fill(colour);
    noStroke();
    circle((this.location.x-cameraX)*cameraZoom + windowWidth/2, (this.location.y-cameraY)*cameraZoom + windowHeight/2, this.renderedSize*cameraZoom);
    
  }

  move() {
    this.velocity.x = mouseX - windowWidth/2;
    this.velocity.y = mouseY - windowHeight/2;
    this.velocity = normalizeCoordinates(this.velocity)

    if (this.size > 100) {
      this.velocity.x = this.velocity.x / (100 / 4) * 28
      this.velocity.y = this.velocity.y / (100 / 4) * 28
    } else {
      this.velocity.x = this.velocity.x / (this.size / 4) * 28
      this.velocity.y = this.velocity.y / (this.size / 4) * 28
    }

    this.location.x += this.velocity.x
    this.location.y += this.velocity.y

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

  emitPosition() {
    var data = {
      id: id,
      x: this.location.x,
      y: this.location.y,
      size: this.size
    }

    socket.emit('position', data)
  }

  checkEat(foodArray) {
    foodArray.forEach((food) => {
      if (calculateDistance(this.location, food) < this.size / 2 - 5) {
        var data = foodArray.indexOf(food)
    
        socket.emit('foodEaten', data)

        foodArray.splice(foodArray.indexOf(food), 1);
        this.size += 200 / this.size;

        socket.emit('sizeDifference', this.size)
      }
    });
  }
}