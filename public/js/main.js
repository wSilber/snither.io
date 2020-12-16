let inGame = false;
let username;
let token = '';
let start = false;
let gameEnded = false;
let restart = false;
let start_audio = document.getElementById('start_audio');
let button_audio = document.getElementById('button_audio');

//set global variable for snake color
let colorCode = "0xff3333";
var globalColor = {
    color: colorCode
}

//Connect user to server
socket.emit('connect-user-to-server', {token: token})

//Show login modals on page load
$(window).on('load', function() {
    showLogin();
    showLoginModal();

})

//Function(s) called to set snake color
$('#color-red').click(function() {
    globalColor.color="0xff3333";
    $("#color-selected").html(" Red")
})
$('#color-blue').click(function() {
    globalColor.color="0x0080ff";
    $("#color-selected").html(" Blue")
})
$('#color-green').click(function() {
    globalColor.color="0x66ff66";
    $("#color-selected").html(" Green")
})
$('#color-purple').click(function() {
    globalColor.color="0x9933ff";
    $("#color-selected").html(" Purple")
})


//Function called when play button is clicked
$('.start-game').click(function(event) {
    let user = $('#play-now-username').val();

    //Attempt to start game if logged in
    if(token != '') {
        socket.emit('start-game-to-server', {username: username, token: token})
        return;
    }

    //Give error if invalid username is given
    if((token == '' && user == null)||(user == '' && token == '')) {
        showLoginError();
        $("#title-error").text("ERROR: Please input a valid username")
    } else {    

        //Attempt to start game if not logged in and valid username given
        socket.emit('start-game-to-server', {username: user})
    }


})

//Attempt to register user when register button clicked
$('#register-btn').click(function() {
    socket.emit('register-user', {username: $('#username-input-register').val(), password: $('#password-input-register').val()})
})

//Attempt to login user when login button clicked
$('#login-btn').click(function() {
    let username = $('#username-input-login').val();
    let password = $("#password-input-login").val();

    //Send username and password to server for verification
    if(username != '' && password != '') {
        socket.emit('login-user-to-server', {username: username, password: password})
    } else {
        //Error
    }
})

//Logs out user when clicked
$('#logout-btn').click(function() {
    username = '';
    token = '';
    hideLoggedInModal();
    showLoginModal();
})

//Changes modal to register mode
$('#change-to-register').click(function() {
    hideLoginError();
    showRegister();
})

//Changes modal to login mode
$('#change-to-login').click(function() {
    hideLoginError();
    showLogin();
})

//Exits from game
$('#back-btn').click(function() {
    hideEndModal();
    showLoginModal();
})

//Play audio when button is clicked
$('button').click(function() {
    button_audio.play();
})

/*--------------------------------------------------------------------------------------------------//
                                        Socket Listeners
//--------------------------------------------------------------------------------------------------*/

//Received login error from server
socket.on('login-error-to-client', function(data) {
    loginError(data.error)
})

//Received highest scores leaderboard from server - change clients leaderboard
socket.on('send-highest-scores-to-client', function(data) {
    document.getElementById('highest-scores-container').innerHTML = '';
    data.scores.forEach(function(score) {
        let scoreNode = document.createElement('li');
        scoreNode.innerText = score.score.toString() + ": " + score.username;
        document.getElementById('highest-scores-container').appendChild(scoreNode)
    })
})

//Received successful login from server
socket.on('successful-login-to-client', function(data) {
    token = data.token;
    username = data.username;
    hideLoginModal();
    showLoggedInModal(data.username);
})

//Received start game from server
socket.on('start-game-to-client', function(data) {
    
    //Give user error if one exists
    if(data.error != "") {
        showLoginError();
        $("#title-error").text("ERROR: Username is already taken")
    } else {

        start_audio.play();
        
        //Start game
        if(!end) {
            hideAllModals();
            username = data.username;
            foodPositions = data.food;
            startGame();
        } else {
            hideAllModals();
            username = data.username;
            foodPositions = data.food;
            restart = true;
        }

    }
}) 


