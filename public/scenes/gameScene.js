/*--------------------------------------------------------------------------------------------------//
                            Game Scene
//--------------------------------------------------------------------------------------------------*/
let scene;
let scoreText;
let width = 5000;
let height = 5000;
let end = false;

class GameScene extends Phaser.Scene {

    //Constructor
    constructor() {
        super("gameScene")
    }

    preload() {

    }

    //Function called when scene is created
    create() {

        //Set world bounds and graphics
        this.physics.world.setBounds(-width, -height, width, height)
        let background = this.add.tileSprite(-width, -height, 4*width, 4*height, "tile")
        this.graphics = this.add.graphics();
        
        window.scene = this;
        scene = this;
       
        initializeFood();

        //Initialize player snake
        snake = new Snake(this, 0, 0, 10, true);
        snake.initialize();
        snakes[username] = snake;
        snake.getSegments().forEach(function(segment) {
            allSegments.push(segment)
        })

        //Creates 10 bot snakes
        createBotSnakes(10, this);

        //Setup camera
        this.cameras.main.startFollow(snake.getHead())
        this.cameras.main.setBounds(-width, -height, 2*width, 2*height)

        //Setup snake collisions with bot snakes
        allSegments.forEach(function(segment) {
            scene.physics.add.overlap(snake.head.sprite, segment.sprite, function() {
                if(snake.head.name != segment.name) {
                    end = true;
                    snake.destroy();
                 }
            })
        })

        //Setup snake collisions with food
        allfood.forEach(function(food) {
             scene.physics.add.overlap(snake.head.sprite, food.sprite, function() {
                 food.destroy();
                 snake.grow();
                 score= snake.mass;
             })
         })

        //Setup scoreboard
        scoreText = this.add.text(this.cameras.main.worldView.x + (this.cameras.main.width / 2), this.cameras.main.worldView.y - (this.cameras.main.height/2), "Length", { fontSize: '32px', fill: '#FF0000' })
        drawScoreboard(this);

        //Start timer to update collisions
        window.setInterval( function() {
            updateCollisions(scene);
        }, 2000)

        //Start background music
        this.sound.play('background-music', {volume: 0.1, loop: true})
    }

    //Function called every frame update
    update() {
        scene = this;
        if(!end) {

            //Move snake during game
            snake.moveHead()

            //Update player score
            scoreText.x = this.cameras.main.worldView.x
            scoreText.y = this.cameras.main.worldView.y
            scoreText.text = "Mass: " + score;
            saveScore = score;
        } else {

            //End game
            if(sendScore) {

                //Send score and stop music
                this.game.sound.stopAll();
                socket.emit('send-score-to-server', {username: username, score: score})
                sendScore = false;

                //Show user the desired end modal
                if(token != '') {
                    showLoggedInModalDeath(score);
                } else {
                    showEndModal(score);
                }

                this.sound.play('death', {volume: 1, loop: false})
            }

            score = saveScore;
        }

        //Restart the game
        if(restart) {
            sendScore = true;
            this.sys.game.destroy(true);
            restart = false;
            hideAllModals();
            startGame();
        }

        //Move all bot snakes
        snakeBots.forEach(function(snake) {
            if(snake.name != 'dead') {
                snake.moveHead();
            }
        })
  
        //Update scoreboard
        updateScoreboard(this);

        //Update food clusters
        updateFoodClusters();
    }
}