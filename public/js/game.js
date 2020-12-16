//Game class - Contains functions to be used by Phaser Game

let snakes = {};
let allfood = [];
let foodPositions = [];
let allSegments = [];
let newSegments = [];
let foodClusters = [];
let snake;
let saveScore = 10;
let score = 10;
let food;
let sendScore = true;
let leaderboard = [];
let scoreboard = [];
let snakeBots = [];
let cursor;
let game;

//Function to start game
function startGame() {

    //Initialize all game parameters
    var config = {
        width: $(window).width(),
        height: $(window).height(),
        backgroundColor: 0x000000,
        scene: [TitleScene, GameScene],
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        }
    }
    end = false;
    game = new Phaser.Game(config);
    cursor = game.input.mousePointer;
    snakes = {};
    allfood = [];
    allSegments = [];
    score = 10;
    snakeBots = [];
}

//Function to initialize all food
function initializeFood() {
    foodPositions.forEach(function(food) {
        allfood.push(new Food(scene, food[0], food[1]))
    })
}

//Function to create bot snakes
function createBotSnakes(amount, scene) {
    for(let i = 0; i < amount; i++) {
        let x = Math.floor(Math.random() * (2 * width)) - width;
        let y = Math.floor(Math.random() * (2 * height)) - height;
        let snakeBot = new SnakeBot(scene, x, y, 10, false);
        snakeBots.push(snakeBot);
        snakeBot.initialize();
        snakes[snakeBot.name] = snakeBot;
        snakeBot.getSegments().forEach(function(segment) {
            allSegments.push(segment);
        })

        //Add colliders with food sprites
        allfood.forEach(function(food) {
             scene.physics.add.overlap(snakeBot.head.sprite, food.sprite, function() {
                 food.destroy();
                 snakeBot.grow();
             })
         })

         //Add colliders with other snakes
         allSegments.forEach(function(segment) {
             scene.physics.add.overlap(snakeBot.head.sprite, segment.sprite, function() {
                 if(snakeBot.head.name != segment.name) {
                    snakeBot.destroy();
                 }
             })
         })
    }
}

//Function to create food object
function createFood(scene, x, y) {
    let food = new Food(scene, x, y);
    allfood.push(food);

    //Add colliders with player
    scene.physics.add.overlap(snake.head.sprite, food.sprite, function() {
        food.destroy();
        snake.grow();
        score = snake.mass;
    })

    //Add colliders with bot snakes
    snakeBots.forEach(function(snake) {
        scene.physics.add.overlap(snake.head.sprite, food.sprite, function() {
            food.destroy();
            snake.grow();
            score= snake.mass;
        })
    })
    return food;
}

//Function to draw scoreboard
function drawScoreboard(scene) {
   scoreboard[0] = scene.add.text(scene.cameras.main.worldView.x  + ($(window).width()/2) - 100, scene.cameras.main.worldView.y - (scene.cameras.main.height/2), "Scoreboard", { fontSize: '32px', fill: '#A64545' })
   for(let i = 1; i < 6; i++) {
    scoreboard[i] = scene.add.text(scene.cameras.main.worldView.x  + ($(window).width()/2) - 100, scene.cameras.main.worldView.y - (scene.cameras.main.height/2) + (25 * i), "Score: ", { fontSize: '20px', fill: '#A64545' })
   }
}

//Function to update Scoreboard with current scores
function updateScoreboard(scene) {
   leaderboard = [];
    for(let snake in snakes) {
        if(leaderboard.length < 5) {
            let arr = [snake, snakes[snake].mass];
            leaderboard.push(arr);
        } else {
            let changeScore = true;
            leaderboard.forEach(function(player) {
                if(snakes[snake].mass > player[1] && changeScore) {
                    changeScore = false;
                    leaderboard.pop();
                    leaderboard.push([snake, snakes[snake].mass])
                }
            })
        }
    }
    leaderboard.sort(function(a, b) {
        return b[1] - a[1];
    })

    //Update position of scoreboard
    scoreboard[0].x = scene.cameras.main.worldView.x + (scene.cameras.main.width) - 250
    scoreboard[0].y = scene.cameras.main.worldView.y + 25;

    //Update position of scoreboard text
    for(let i = 0; i < leaderboard.length; i++) {
        scoreboard[i+1].text = leaderboard[i][0] + ": " + leaderboard[i][1];
        scoreboard[i+1].x = scene.cameras.main.worldView.x + (scene.cameras.main.width) - 250;
        scoreboard[i+1].y = scene.cameras.main.worldView.y + (25 * (i+1)) + 50;
    }
}

//Updates all Snake collisions
function updateCollisions(scene) {

    //Update snake bot collisions
    snakeBots.forEach(function(snakeBot) {
        newSegments.forEach(function(segment) {
            scene.physics.add.overlap(snakeBot.head.sprite, segment.sprite, function() {
                if(segment != null && snakeBot.head.name != segment.name) {
                   snakeBot.destroy();
                }
            })
        })
    })

    //Update player collisions
    newSegments.forEach(function(segment) {
        scene.physics.add.overlap(snake.head.sprite, segment.sprite, function() {
            if(segment != null && snake.head.name != segment.name) {
                end = true;
                snake.destroy();
             }
        })

        allSegments.push(segment)
    })

    //Clear all added segments from new segment array
    newSegments = [];
}

//Function to update food clusters
function updateFoodClusters() {
    for(let k = 0; k < foodClusters.length; k++) {
        let counter = 2;

        //Check how much food is gone
        for(let i = 2; i < foodClusters[k].length; i++) {
            if(foodClusters[k][i].name == 'eat') {
                counter++;
            }
            
        }

        //Remove food cluster if most of the food is gone
        if(counter >= foodClusters[k].length - 1) {
            foodClusters.splice(k, 1)
        }
    }
}



