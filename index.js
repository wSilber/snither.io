var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bcrypt = require('bcrypt'); 
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://wSilber:William321@test.0emdt.mongodb.net/";
const saltRounds = 10;  

//Route all requests to the public folder
app.use(express.static('public'));

//Route a url with nothing to index.html
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

users = {};
usersL = {};
snakes = {};
scores = [];
snakeSegments = {};
highestScores = [];
snakeTest = {};
food = [];
let counter = 0;
let intervalTime = 17;
let update = true;
let gameWidth = 5000;
let gameHeight = 5000;
let foodAmount = 2000;
let snakeLength = 10;

//Initialize all food
initialize();

io.sockets.on('connection', function(socket) {
  console.log("User connected")

  //Send highscores to client
  socket.emit('send-highest-scores-to-client', {scores: highestScores})

  //Attempts to register user
  socket.on('register-user', function(data) {

    //Connect to mongodb
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Snither");
      var query = {username: data.username};

      //Check to see if username is already taken
      dbo.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;
        if(result.length == 0) {

          //Hash password given with salt
          bcrypt.hash(data.password, saltRounds, (err, hash) => {

            var obj = {username: data.username, password: hash}

            //Register user in database
            dbo.collection('users').insertOne(obj, function(err, res) {
              if (err) throw err;
              console.log("User added");
              let token = Math.random().toString(36).substr(2);
              usersL[data.username] = token;

              //Send user successful login data
              socket.emit('successful-login-to-client', {username: data.username, token: token})
              db.close();
            })
          })
        } else {

          //Tell user that username is already taken
          console.log("User exists")
          socket.emit('login-error-to-client', {error: "Username already taken"})
          db.close();
        }
      });
    });
  })

  //Function to start game
  socket.on('start-game-to-server', function(data) {

    //Make sure username is not taken
    for (key in users) {
      if(key == data.username) {

        //Let user know username is taken
        console.log("Username taken")
        socket.emit('start-game-to-client', {error: "Username Taken"})
        return;
      }
    }
    
    //Make sure that username isnt taken by a registered account
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Snither");

      var query = {username: data.username};

      //Check database
      dbo.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;

        if(result.length == 1) {
          if(data.token != undefined) {

            console.log(data.token);

            //Send game info to client
            console.log(data.username)
            socket.emit('start-game-to-client', {username: data.username, snakes: snakes, scores: scores, food: food, error: ""})
            return;
          }

          //Let user know username is taken
          socket.emit('start-game-to-client', {error: "Username Taken"})
        } else {

          //Send game info to client
          users[data.username] = socket;
          socket.emit('start-game-to-client', {username: data.username, snakes: snakes, scores: scores, food: food, error: ""})
        }
      })
    })
  })

  //Logs in user
  socket.on('login-user-to-server', function(data) {
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Snither");

      var query = {username: data.username};

      //Check if username exists in database
      dbo.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;

        //If user exists
        if(result.length == 1) {

          let hashedPassword = result[0].password

          //check password given to hashed password in database
          bcrypt.compare(data.password, hashedPassword, function(error, response) {
            if(response) {
              
              //Send successful info to user
              let token = Math.random().toString(36).substr(2);
              usersL[data.username] = token;
              socket.emit('successful-login-to-client', {username: data.username, token: token})
            } else {
              
              //Tell user invalid login credentials
              socket.emit('login-error-to-client', {error: "Invalid login credentials"})
            }
          })
        } else {

          //Tell user invalid login credentials
          console.log("User does not exist")
          socket.emit('login-error-to-client', {error: "Invalid login credentials"})
        }
      })
    })
  })
  
  //Received score from client
  socket.on('send-score-to-server', function(data) {
    console.log("User sent score to server")

    //Remove player from current playing players
    delete users[data.username];

    let changeScore = true;

    //If there are less than 10 highscores then add score to the leaderboard
    if(highestScores.length < 10) {
      highestScores.push({username: data.username, score: data.score});
      highestScores.sort(function(a, b) {
        return b.score - a.score;
      })
    } else {

      //Check if score is bigger than scores on the leaderboard
      highestScores.forEach(function(score) {
        console.log(score.score)
        if(data.score > score.score && changeScore) {

          //add score to scoreboard
          changeScore = false;
          highestScores.pop();
          highestScores.push({username: data.username, score: data.score});
          console.log(data.score + " is now one of the 10 highest scores")
          highestScores.sort(function(a, b) {
            return b.score - a.score;
          })
        }
      })
    }

    //Update highest scores in database
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Snither");
      dbo.collection("highestScores").updateOne({highestScores: true}, {$set: {scores: highestScores}, function(err, res) {
        if (err) throw err;
        console.log("Updated Highest SCores");
        db.close();
      }})
    })

    //Send highest scores back to the client
    socket.emit('send-highest-scores-to-client', {scores: highestScores})
  })
});

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});

//Function to initialize game
function initialize() {
  getHighestScores();
  food = initializeFood(foodAmount);
  snakes = {};
  players = {};
  scores = [];
  console.log(food);
}

//Initializes all food
function initializeFood(number) {
  let foodArray = [];
  for(let i = 0; i < number; i++) {
    let arr = [];

    //Random coordinate in the game bounds
    arr.push(Math.floor(Math.random() * (2 * gameHeight)) - gameHeight);
    arr.push(Math.floor(Math.random() * (2 * gameWidth)) - gameWidth);
    foodArray.push(arr);
  }
  return foodArray;
}

//Gets the highest scores from database
function getHighestScores() {
  MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Snither");
    dbo.collection("highestScores").find({}).toArray(function(err, result) {
      if (err) throw err;

      //Transfer data to array stored on server
      for(let key in result[0].scores) {
        let data = {username: result[0].scores[key].username, score: result[0].scores[key].score}
        highestScores.push(data)
      }

      //Sort the scores from greatest to least
      highestScores.sort(function(a, b) {
        return b.score - a.score;
      })

    console.log(highestScores);
      db.close();
    })
  })
}