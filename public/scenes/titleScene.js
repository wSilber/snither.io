//Title Scene - Only loads game assets
class TitleScene extends Phaser.Scene {

    //Scene constructor
    constructor() {
        super("titleScreen")
    }

    //Load all assets to client - Called before create function
    preload() {
        this.load.image('tile', 'assets/tile.png');
        this.load.image('food', 'assets/food.png')
        this.load.image('head', 'assets/snake-head.png')
        this.load.image('segment', 'assets/segment.png')
        this.load.audio('background-music', 'assets/background-music.mp3')
        this.load.audio('death', 'assets/death.wav')
    }

    //Switch to game scene once assets are fully loaded - called after preload function
    create() {
        this.scene.start("gameScene")
    }

    update() {
        
    }
}