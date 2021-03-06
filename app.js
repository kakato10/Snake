var Point = function(xCoord, yCoord, size, context) {
  this.draw = function(color, image) {
    if (image === undefined){
      context.fillStyle = color || "blue";
      context.fillRect(xCoord * size, yCoord * size, 10, 10);
    } else {
      context.drawImage(image, xCoord*size, yCoord*size, 10, 10);
    }
  };
  this.getxCoord = function(){
    return xCoord;
  };
  this.getyCoord = function(){
    return yCoord;
  };
  this.equals = function(secondPoint) {
    return xCoord === secondPoint.getxCoord() && yCoord === secondPoint.getyCoord();
  };
};

var disableButtons = function() {
  $("#start-game").prop("disabled", true);
  $("#difficulty").prop("disabled", true);
};

var enableButtons = function() {
  $("#start-game").removeAttr("disabled");
};

var keyCodes  = {
  37 : "left",
  38 : "up",
  39 : "right",
  40 : "down"
};

var speeds = {
  easy: 200,
  normal: 150,
  hard: 100
};


$(document).ready(function(){

  var speed;
  var score = 0;
  var snakeBoard = document.getElementById("snakeBoard");
  var context = snakeBoard.getContext("2d");
  var snakeBoardHeight = $("#snakeBoard").height();
  var snakeBoardWidth= $("#snakeBoard").width();
  var gameLoop;
  var difficulty;
  var clearBoard = function() {
      context.clearRect(0, 0, snakeBoardHeight, snakeBoardWidth);
  };

  var updateHighscore = function() {
    if (score > parseInt(localStorage[difficulty],10) || localStorage[difficulty] === undefined) {
      localStorage[difficulty] = score;
    } else {
      return false;
    }
  };

  var drawHighScore = function() {
    var highscoreRowSource = $("#highscore-template").html();
    var highscoreRowTemplate = Handlebars.compile(highscoreRowSource);
    $("#highscore").replaceWith(highscoreRowTemplate({
      score: localStorage[difficulty],
      difficulty: difficulty
    }));
    console.log(highscoreRowTemplate({
      score: localStorage[difficulty],
      difficulty: difficulty
    }));
  };

  var drawCurrentScore = function() {
    var currentScoreRowSource = $("#current-score-template").html();
    var currentScoreRowTemplate = Handlebars.compile(currentScoreRowSource);
    $("#current-score").replaceWith(currentScoreRowTemplate({
      score:score
    }));
  };


  var food = (function(context) {
    var image = document.getElementById("food");
    var point = new Point(Math.round(((Math.random() * (snakeBoardHeight -1)) + 1)/10), Math.round(((Math.random() * (snakeBoardWidth -1)) + 1)/10) ,10, context);

    var draw = function() {

      point.draw(undefined, image);
    };

    var changePosition = function() {
      var xCoord = Math.round((Math.random() * (snakeBoardHeight -10))/10);
      var yCoord = Math.round((Math.random() * (snakeBoardWidth -10))/10);
      point = new Point(xCoord, yCoord ,10, context);
    };
    var getFood = function() {
      return point;
    };
    return {
      draw : draw,
      changePosition : changePosition,
      getFood : getFood
    };
  }(context));

  var snake = (function(context) {

    var body = [];
    [1,2,3].forEach(function(i){
      body.push(new Point(i, 0, 10, context))
    });
    var currentHead = body[body.length - 1];
    var direction = "right";
    var ate = false;
    var draw = function() {
      body.forEach(function(point) {
        point.draw();
      });
    };

    var checkForColision = function() {
      var headToTale = body.some(function(element, index){
        return (index !== body.length - 1 && element.equals(currentHead));
      });
      var outOfBoard = currentHead.getyCoord() * 10 === snakeBoardWidth || currentHead.getxCoord() * 10 === snakeBoardHeight || currentHead.getxCoord() < 0 || currentHead.getyCoord() < 0;
      var colision = headToTale || outOfBoard;
      return colision;
    };

    var resetSnake = function(){
      body = [];
      [1,2,3].forEach(function(i){
        body.push(new Point(i, 0, 10, context))
      });
      updateHighscore();
      score = 0;
      currentHead = body[body.length - 1];
      direction = "right";
    };

    var setDirection = function(newDirection) {
      if(newDirection === "left" && direction === "right") {
        return false;
      }
      if(newDirection === "up" && direction === "down") {
        return false;
      }
      if(newDirection === "right" && direction === "left") {
        return false;
      }
      if(newDirection === "down" && direction === "up") {
        return false;
      }
      direction = newDirection;
    };

    var eating = function(){
      if (currentHead.equals(food.getFood())) {
        food.changePosition();
        drawCurrentScore();
        score = score + 50;
        ate = true
      } else {
        return false;
      }
    };

    var move = function() {
      var newHead;
      if(direction === "left") {
        newHead = new Point (currentHead.getxCoord() - 1, currentHead.getyCoord(), 10, context);
      } else if(direction === "right") {
        newHead = new Point (currentHead.getxCoord() + 1, currentHead.getyCoord(), 10, context);
      } else if(direction === "down") {
        newHead = new Point (currentHead.getxCoord(), currentHead.getyCoord() + 1, 10, context);
      } else if(direction === "up") {
        newHead = new Point (currentHead.getxCoord(), currentHead.getyCoord() - 1, 10, context);
      }
      body.push(newHead);
      if (ate === false ){
      body.shift();
      } else {
        ate = false;
      }
      currentHead = newHead;
    };
    return {
      draw: draw,
      move: move,
      setDirection: setDirection,
      eating: eating,
      checkForColision: checkForColision,
      resetSnake: resetSnake
    };
  }(context));

  var requestDifficulty = function() {
    context.font = "25px Arial";
    context.fillText("Please choose a difficulty!", 50, 200);
  };

  var startGame = function() {
    if (speed === undefined) {
      requestDifficulty();
    } else {
        disableButtons();
        drawCurrentScore();
        gameLoop = setInterval(function() {
        context.clearRect(0, 0, snakeBoardWidth, snakeBoardHeight)
        snake.move();
        if(snake.checkForColision()){
          clearInterval(gameLoop);
          context.font = "30px Arial";
          context.fillText("GAME OVER!!!!!", 50, 200);
          snake.resetSnake();
          speed = undefined;
          enableButtons();

        } else {
        snake.eating();
        snake.draw();
        food.draw();
        }
      }, speed);
    }
  };

  $(document).keydown(function(event){
    snake.setDirection(keyCodes[event.keyCode]);
  });

  $(".difficulty").on("click", function() {
    difficulty = $(this).data("difficulty")
    speed = speeds[difficulty];
    drawHighScore();
  });

  $("#start-game").on("click", function(){
    snake.resetSnake();
    clearBoard();
    startGame();
  });
});
