// Food class

class Food {

    //Class Constructor
    constructor(scene, x, y) {
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.sprite;
        this.graphics = this.scene.graphics
        this.name = "food"
        this.initialize();
    }

    //Initializes food
    initialize() {
        this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'food')
        this.sprite.setTint(Math.floor(Math.random()*16777215))
    }

    //Destroys food object and create another food object if the game needs more food
    destroy() {
        this.name = "eat"
        this.sprite.destroy(true);
        if(allfood.length < 2000) {

            //Random coordinates in the bounds of the game
            let x = Math.floor(Math.random() * (2 * width)) - width;
            let y = Math.floor(Math.random() * (2 * height)) - height;
            createFood(this.scene, x, y);
        }
    }

}