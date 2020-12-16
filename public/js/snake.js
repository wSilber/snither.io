//Snake class
/*--------------------------------------------------------------------------------------------------//
                            Segment Class - Individual segments make up a snake
//--------------------------------------------------------------------------------------------------*/
class Segment extends Phaser.GameObjects.Sprite {

    //Segment constructor
    constructor(scene, x, y) {
        super(scene, x, y, 'segment')
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.sprite;
        this.graphics = this.scene.graphics
        this.name = "segment";

    }

    //Initializes segment body and sprite
    create() {
        this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'segment')
    }

    //Sets the location of a segment
    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }

    //Returns the coordinates of the segment
    getLocation() {
        let arr = [];
        arr.push(this.x);
        arr.push(this.y);
        return arr;
    }

    //Moves the segment towards a point
    moveTowardsPoint(x, y, speed) {
        this.scene.physics.moveTo(this.sprite, x, y, speed)
        this.x = this.sprite.x;
        this.y = this.sprite.y;
    }

    //Moves the segment in relation to a rotation vector
    move(speed, rotationSpeed) {
        this.x = this.sprite.x;
        this.y = this.sprite.y;

        this.rotate(rotationSpeed);

       let convertedRotation = 0;

       //Determines rotation vector based on rotation of sprite
       if(this.sprite.body.rotation >= 0) {
            convertedRotation = 90 - this.sprite.body.rotation;
            if(convertedRotation < 0) {
                convertedRotation = 450 - this.sprite.body.rotation
            }
       } else {
           convertedRotation = 90 - this.sprite.body.rotation
       }

       convertedRotation *= Math.PI/180;
       
        
        let y = Math.sin(convertedRotation);
        let x = Math.cos(convertedRotation);
        
        //Sets the velocity to the length of the rotation vector
        this.sprite.body.setVelocity(speed * x, -speed * y)
    }

    //Moves the segment based on the rotation of the sprite in relation to a point
    moveWithPoint(speed, rotationSpeed, x, y) {
        
        this.x = this.sprite.x;
        this.y = this.sprite.y;

        this.rotateWithPoint(rotationSpeed, x, y)

        let convertedRotation = 0;
        if(this.sprite.body.rotation >= 0) {
            convertedRotation = 90 - this.sprite.body.rotation;
            if(convertedRotation < 0) {
                convertedRotation = 450 - this.sprite.body.rotation
            }
        } else {
            convertedRotation = 90 - this.sprite.body.rotation
        }

        convertedRotation *= Math.PI/180;
       
        
        let yRotate = Math.sin(convertedRotation);
        let xRotate = Math.cos(convertedRotation);

        this.sprite.body.setVelocity(speed * xRotate, -speed * yRotate)
    }

    //Rotates a segment towards the mouse position
    rotate(rotationSpeed) {
        var mousePosX = cursor.worldX;
        var mousePosY = cursor.worldY;

        var headX = this.x;
        var headY = this.y;

        var angle = (180*Math.atan2(mousePosX-headX,mousePosY-headY)/Math.PI);

        if (angle > 0) {
            angle = 180-angle;
        }
        else {
            angle = -180-angle;
        }
        var dif = this.sprite.body.rotation - angle;

        //Set sprites rotation velocity
        if (dif < 0 && dif > -180 || dif > 180) {
            this.sprite.body.angularVelocity = rotationSpeed;
        }
        else if (dif > 0 && dif < 180 || dif < -180) {
            this.sprite.body.angularVelocity = -rotationSpeed;
        }
    }

    //Rotates segment towards the location of a point
    rotateWithPoint(rotationSpeed, x, y) {
        var headX = this.x;
        var headY = this.y;
        var angle = (180*Math.atan2(x-headX,y-headY)/Math.PI);
        if (angle > 0) {
            angle = 180-angle;
        }
        else {
            angle = -180-angle;
        }
        var dif = this.sprite.body.rotation - angle;

        //Setse the sprite rotation velocity
        if (dif < 0 && dif > -180 || dif > 180) {
            this.sprite.body.angularVelocity = rotationSpeed;
        }
        else if (dif > 0 && dif < 180 || dif < -180) {
            this.sprite.body.angularVelocity = -rotationSpeed;
        }
    }
}
/*--------------------------------------------------------------------------------------------------//
                                Snake Class - Snake for the player
//--------------------------------------------------------------------------------------------------*/
class Snake {

    //Constructor
    constructor(scene, x, y, length, yours) {
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.length = length
        this.yours = yours;

        this.segments = [];

        this.scale = 0.6;
        this.maxSpeed = 300;
        this.minSpeed = 130;
        this.speed = this.minSpeed;
        this.rotationSpeed = 130;

        //Score
        this.mass = 1000;
        this.sectionDistance = 25 * this.scale;
        this.mousePos = new Phaser.Geom.Point(cursor.x, cursor.y);
        this.food = 0;
        this.counter = 0;

        //Contains an array of points of which the head has traveled through
        this.headPath = [];
        this.head;
        this.tail;

        //Name to differentiate between snakes
        this.name = username
    }

    //Initializes the snake with segments & fills headPath with coordinates of segments
    initialize() {
        for(let i = 0; i < this.length; i++) {
            this.segments.push(new Segment(this.scene, this.x + (this.sectionDistance * i), this.y))
            this.segments[i].name = this.name;
            this.headPath.push(new Phaser.Geom.Point(this.scene, this.x + (this.sectionDistance * i), this.y))
        }
        this.draw();
        this.segments.reverse();
        this.head = this.segments[0];
        this.head.sprite.setTexture('head')
        this.tail = this.segments[this.segments.length-1];
    }

    //Initializes all segments
    draw() {
        this.segments.forEach(function(segment) {
            segment.create();
            segment.sprite.setTint(globalColor.color)
        })
    }

    //Returns the head
    getHead() {
        return this.head.sprite;
    }

    //removes the tail of the snake and updates score and length accordingly
    shrink() {
        if(this.segments.length > 5) {
            this.segments[this.segments.length - 1].sprite.destroy();
            let seg = this.segments.pop();
            length--;
            this.tail = this.segments[this.segments.length-1];
            
            score = this.mass;
        }

    }

    //Moves the head of the snake
    moveHead() {
        if(this.yours) {
            this.headPath.unshift(new Phaser.Geom.Point(this.head.x, this.head.y))
            this.headPath.pop();
            this.head.move(this.speed, this.rotationSpeed);
            this.moveBody();
        }
    }

    //Moves all segments except the head
    moveBody() {
      score = this.mass;

        //Speed up snake if mouse is pressed
        if(cursor.isDown && this.mass > 500) {
            this.speed = this.maxSpeed;
            this.rotationSpeed = 180;
            this.mass--;

            //Create food
            if(this.mass % 10 == 0)
            createFood(this.scene, this.tail.x, this.tail.y)
            
            //Shrink snake
            if(this.mass % 50 == 0)
                this.shrink();
        } else {
            this.speed = this.minSpeed;
            this.rotationSpeed = 130;
        }

        //Update all segment positions
        for(let i = 1; i < this.segments.length; i++) {

            //Make sure distances between segments remain constant
            if(Util.distanceFormula(this.segments[i].x, this.segments[i].y, this.segments[i-1].x, this.segments[i-1].y) >= this.sectionDistance) {
                
                //Update position
                this.segments[i].moveTowardsPoint(this.segments[i-1].x, this.segments[i-1].y, this.speed)
            } else {
                this.segments[i].sprite.body.setVelocity(0,0)
            }
        }
    }

    //Returns locations of all segments of the snake
    getSnake() {
        let arr = [];
        this.segments.forEach(function(segment) {
            arr.push(segment.getLocation())
        })
        
        return arr;
    }

    //Returns all segments of the snake
    getSegments() {
        return this.segments;
    }

    //Adds one segment to the end of the snake and update score
    grow() {
        this.food++;
        this.mass+=20;

        //Add new segment to snake
        if(this.food == 5 && this.food != 0) {
            this.length++;
            let segment = new Segment(this.scene, this.tail.x, this.tail.y);
            this.tail = segment;
            this.tail.name = this.name;
            this.tail.create();
            this.tail.sprite.setTint(globalColor.color)
            newSegments.push(this.tail)
            this.segments.push(this.tail)
            
            this.food = 0;
        }

        
    }

    //Destroys snake
    destroy() {
        this.segments.forEach(function(segment) {
            segment.sprite.destroy();
        })
        
    }
}

/*--------------------------------------------------------------------------------------------------//
                            SnakeBot Class - Class that makes up a snake bot
//--------------------------------------------------------------------------------------------------*/
class SnakeBot {

    //Constructor
    constructor(scene, x, y, length, yours) {
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.length = length
        this.yours = yours;

        this.segments = [];

        this.scale = 0.6;
        this.maxSpeed = 300;
        this.minSpeed = 130;
        this.speed = this.minSpeed;
        this.rotationSpeed = 130;
        this.mass = 1000;
        this.sectionDistance = 25 * this.scale;
        this.mousePos = new Phaser.Geom.Point(cursor.x, cursor.y);
        this.food = 0;

        this.headPath = [];
        this.head;
        this.tail;

        //Create random name for snakebot
        this.name = Math.random().toString(36).substr(2);
    }

    //Initialize snakebot with segments and set headpath
    initialize() {
        for(let i = 0; i < this.length; i++) {
            this.segments.push(new Segment(this.scene, this.x + (this.sectionDistance * i), this.y))
            this.segments[i].name = this.name
            this.headPath.push(new Phaser.Geom.Point(this.scene, this.x + (this.sectionDistance * i), this.y))
        }
        this.draw();
        this.segments.reverse();
        this.head = this.segments[0];
        this.head.sprite.setTexture('head')
        this.tail = this.segments[this.segments.length-1];
    }

    //Initializes all segments
    draw() {
        this.segments.forEach(function(segment) {
            segment.create();
            segment.sprite.setTint(0xff3333)
        })
    }

    //Returns the head segment
    getHead() {
        return this.head.sprite;
    }

    //Reduces the length of the snake by 1
    shrink() {
        if(this.segments.length > 5) {
            this.segments[this.segments.length - 1].sprite.destroy();
            let seg = this.segments.pop();
            length--;
            this.tail = this.segments[this.segments.length-1];
            score = this.mass;
        }
    }

    //Sets the location of all segments
    setPoints(points) {
        for(let i = 0; i < points.length; i++) {
            this.segments.push(new Segment(this.scene, this.x + (this.sectionDistance * i), this.y))
            this.headPath.push(new Phaser.Geom.Point(this.scene, this.x + (this.sectionDistance * i), this.y))
            
        }
        this.draw();
        this.segments.reverse();
        this.head = this.segments[0];
    }

    //Moves the head of the snake
    moveHead() {
        this.headPath.unshift(new Phaser.Geom.Point(this.head.x, this.head.y))
        this.headPath.pop();
        let head = this.head;
        let moveToPlayer = true;
        let moveToFoodCluster = false;

        let pointMove = [];

        //losely move towards player if far away
        snake.segments.forEach(function(segment) {
            if(Util.distanceFormula(head.x, head.y, segment.x, segment.y) < 500) {
                moveToPlayer = false
                return;
            }
        })

        //Determine if food cluster is near
        foodClusters.forEach(function(point) {
            if(Util.distanceFormula(head.x, head.y, point[0], point[1]) < 200) {
                moveToFoodCluster = true;
                pointMove[0] = point[0];
                pointMove[1] = point[1];
                return;
            }
        })

        //Move towards food cluster
        if(moveToFoodCluster) {
            this.head.moveWithPoint(this.speed, this.rotationSpeed, pointMove[0] + Math.floor((Math.random() * 10) - 5), pointMove[1] + Math.floor((Math.random() * 10) - 5))
        } else if(moveToPlayer) {

            //Move to position within 1000 pixels of player
            this.head.moveWithPoint(this.speed, this.rotationSpeed, snake.head.x + Math.floor((Math.random() * 1000)) - 500, snake.head.y + Math.floor(Math.random() * 1000) - 500)
        } else {

            //Move towards random location within game bounds
            this.head.moveWithPoint(this.speed, this.rotationSpeed, Math.floor((Math.random() * (2 * width))) - width, Math.floor((Math.random() * (2 * height))) - height)
        }
        
        this.moveBody();
    }

    //Moves the body segments
    moveBody() {
        for(let i = 1; i < this.segments.length; i++) {

            //Keep segment distances constant
            if(Util.distanceFormula(this.segments[i].x, this.segments[i].y, this.segments[i-1].x, this.segments[i-1].y) >= this.sectionDistance) {
                this.segments[i].moveTowardsPoint(this.segments[i-1].x, this.segments[i-1].y, this.speed)
            } else {
                this.segments[i].sprite.body.setVelocity(0,0)
            }
        }
    }

    //Returns the location of all segment of the snake
    getSnake() {
        let arr = [];
        this.segments.forEach(function(segment) {
            arr.push(segment.getLocation())
        })
        
        return arr;
    }

    //Returns all segments
    getSegments() {
        return this.segments;
    }

    //Adds a segment to the end of the snake
    grow() {
        this.food++;
        this.mass+=20;

        //Add new segment when snake collects 5 food
        if(this.food == 5 && this.food != 0) {
            this.length++;
            this.tail = new Segment(this.scene, this.tail.x, this.tail.y);
            this.tail.create();
            this.tail.sprite.setTint(0xff3333)
            this.tail.name = this.name;
            newSegments.push(this.tail);
            this.segments.push(this.tail)
            this.food = 0;
        }
    }

    //Snake dies
    destroy() {

        //Determine how much food should be dropped per segment
        let numFoodDroppedPerSegment = Math.floor((this.length*2)/ this.segments.length)
        this.name = 'dead';
        let scene = this.scene

        //Drop food in random locations within 10 pixels of segment location
        this.segments.forEach(function(segment) {
            let arr = [];
            arr[0] = segment.x;
            arr[1] = segment.y;

            //Drop food and create food clusters
            for(let i = 0; i < numFoodDroppedPerSegment; i++) {
                let x = Math.floor((Math.random() * 10) + 5)
                let y = Math.floor((Math.random() * 10) + 5)
                let food = createFood(scene, segment.x + x, segment.y + y)
                arr.push(food);
            }

            foodClusters.push(arr);
            segment.sprite.destroy();
        })

        //Create new bot snake
        createBotSnakes(1, this.scene);
    }
}