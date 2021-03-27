class Player {
  constructor(playerObject, playerId) {
    this.location = createVector(playerObject.x, playerObject.y);
    this.size = playerObject.size;
    this.renderedSize = 0
    this.id = playerId;
    this.velocity = createVector(400, 400);
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
    this.velocity.normalize();

    if (this.size > 100) {
      this.velocity.x = this.velocity.x / (100 / 5) * 14
      this.velocity.y = this.velocity.y / (100 / 5) * 14
    } else {
      this.velocity.x = this.velocity.x / (this.size / 4) * 14
      this.velocity.y = this.velocity.y / (this.size / 4) * 14
    }

    if (createVector(mouseX, mouseY).dist(this.location) > 4) {
      this.location.add(this.velocity.mult(2))
    }

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
      let foodVector = createVector(food.x, food.y)
      if (foodVector.dist(this.location) < this.size / 2) {
        var data = foodArray.indexOf(food)
    
        socket.emit('foodEaten', data)

        foodArray.splice(foodArray.indexOf(food), 1);
        this.size += 200 / this.size;

        socket.emit('sizeDifference', this.size)
      }
    });
  }

  // checkPlayerEat(secondPlayer) {
  //   if (secondPlayer.size > this.size) {
  //     if (secondPlayer.location.dist(this.location) <= secondPlayer.size/2) {
  //       this.location.x = 10000;
  //       this.location.y = 10000;
  //     }
  //   } else if (secondPlayer.size < this.size) {
  //     if (secondPlayer.location.dist(this.location) <= this.size/2) {
  //       secondPlayer.location.x = 10000;
  //       secondPlayer.location.y = 10000;
  //     }
  //   }
  // }
}