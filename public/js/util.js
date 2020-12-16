/*--------------------------------------------------------------------------------------------------//
                            Utility class - Random utility functions 
//--------------------------------------------------------------------------------------------------*/

const Util = {

    //Distance formula for 2 points
    distanceFormula: function(x1, y1, x2, y2) {
        var withinRoot = Math.pow(x1-x2,2) + Math.pow(y1-y2,2);
        var dist = Math.pow(withinRoot,0.5);
        return dist;
    }
};

//Hides all modals
function hideAllModals() {
    hideLoginModal();
    hideLoggedInModal();
    hideEndModal();
}

//Hides login modal
function hideLoginModal() {
    $('#login-modal').modal('hide');
}

//Shows login modal
function showLoginModal() {
    hideLoginError();
    $('#username-input-login').val('');
    $('#password-input-login').val('');
    $('#login-modal').modal({backdrop: 'static', keyboard: false})
    $('#login-modal').modal('show');
}

//Shows logged in modal
function showLoggedInModal(username) {
    $('#logged-in-name').text("Welcome " + username);
    $('#logged-in-modal').modal('show');
}

//Shows logged in modal on death
function showLoggedInModalDeath(mass) {
    $('#logged-in-name').text("Final Mass: " + mass);
    $('#logged-in-modal').modal('show');
}

//Hides logged in modal
function hideLoggedInModal() {
    $('#logged-in-modal').modal('hide');
}

//Hides login error
function hideLoginError() {
    $('#title-error').hide()
}

//Shows login error
function showLoginError() {
    $('#title-error').show();
}

//Displays a login error
function loginError(error) {
    showLoginError();
    $("#title-error").text("ERROR: " + error);
}

//Shows login section of login modal
function showLogin() {
    $('.login-div').show();
    $('.register-div').hide();
}

//Shows register section of login modal
function showRegister() {
    $('.register-div').show();
    $('.login-div').hide();
}

function showEndModal(mass) {
    $('#end-score').text("Final mass: " + mass)
    $('#end-modal').modal('show');
}

function hideEndModal() {
    $('#end-modal').modal('hide')
}