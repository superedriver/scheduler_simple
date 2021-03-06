var currentUser;



$(document).ready(function() {
    main();
    $("#logo").on("click", function() {
        main();
    });
});

function main(){
    if (currentUser){
        $(".wrapper").html("");
        $(".wrapper").append("<br><br><br>");
        // show calendar
        $(".wrapper").append("<div id='calendar'></div>");

        renderNavbarLinksAfterLogin();

        // initialize calendar
        $('#calendar').fullCalendar({
            weekends: true, // will show Saturdays and Sundays
            header: {
                left: 'prev,next,today',
                center: 'title',
                right: 'month,basicWeek,agendaDay'
            },
            firstDay: 1,
            height: 650
        });
        renderEvents ();
    }else{
        renderLoginForm ();
    }
}

function renderEvents (){
    var transmittedData = {};
    // transmittedData.token = currentUser;
    var url = "http://localhost:3000/v1/events?token=" + currentUser;

    // get events
    apiConnect(url, "GET", transmittedData, function(error, returnedData){
        if (error){
            alert(JSON.stringify("Can't get events",error));
        }else{
            console.log("returnedData: ", returnedData.data);
            if (returnedData.data.length){
                returnedData.data.forEach(function(item) {
                    var event = {};
                    event.title = item.name + " " + item.description;
                    event.start = item.date_start;
                    event.end = item.date_finish;
                    event.editable = true;
                    var dontDisappear = true;
                    $('#calendar').fullCalendar( 'renderEvent', event, dontDisappear);
                });
            }
        }
    });
}

function renderRegistrationForm (){
    var template = $('#registration-form').html();
    $(".wrapper").html(template);
    $("#navbar-main ul").html('<li id="login-link"><a href="#">Login</a></li>');

    $("#login-link").on("click", function( event ) {
        event.preventDefault();
        renderLoginForm();
    });

    $("#registrationForm").on("submit", function( event ) {
        event.preventDefault();

        var transmittedData = {};
        transmittedData.user = {};
        transmittedData.user.name = this.registrationName.value;
        transmittedData.user.email = this.registrationEmail.value;
        transmittedData.user.password = this.registrationPassword.value;
        transmittedData.user.password_confirmation = this.inputPasswordConfirmation.value;

        apiConnect("http://localhost:3000/v1/registration", "POST", transmittedData, function(error, returnedData){
            if (error){
                var data = JSON.parse(error.data);
                var html = "<h2 class='text-danger center'>" + data.message + "</h2>";
                var form = $("#loginForm");
                if(!form.next().length){
                    form.after(html);
                }
            }else{
                currentUser = returnedData.data.token;
                main();
            }
        });
        return false;
    });
}

function renderLoginForm (){
    var template = $('#login-form').html();
    $(".wrapper").html(template);
    $("#navbar-main ul").html('<li id="registration-link"><a href="#">Registration</a></li>');

    $("#registration-link").on("click", function( event ) {
        event.preventDefault();
        renderRegistrationForm();
    });

    $("#loginForm").on("submit", function( event ) {
        event.preventDefault();

        var transmittedData = {};
        transmittedData.email = this.loginEmail.value;
        transmittedData.password = this.loginPassword.value;

        apiConnect("http://localhost:3000/v1/login", "POST", transmittedData, function(error, returnedData){
            if (error){
                var data = JSON.parse(error.data);
                var html = "<h2 class='text-danger center'>" + data.message + "</h2>";
                var form = $("#loginForm");
                if(!form.next().length){
                    form.after(html);
                }
            }else{
                currentUser = returnedData.data.token;
                main();
            }
        });
        return false;
    });
}

function renderNavbarLinksAfterLogin (){
    var headerMenu = $("#navbar-main ul");
    headerMenu.html('');

    headerMenu.append('<li id="show-profile-link"><a href="#">Show Profile</a></li>');
    $("#show-profile-link").on("click", function( event ) {
        event.preventDefault();
        renderShowProfile();
    });

    headerMenu.append('<li id="edit-profile-link"><a href="#">Edit Profile</a></li>');
    $("#edit-profile-link").on("click", function( event ) {
        event.preventDefault();
        renderEditProfile();
    });

    headerMenu.append('<li id="new-event-link"><a href="#">Create event</a></li>');
    $("#new-event-link").on("click", function( event ) {
        event.preventDefault();
        renderNewEventForm();
    });

    headerMenu.append('<li id="calendar-link"><a href="#">Calendar</a></li>');
    $("#calendar-link").on("click", function( event ) {
        event.preventDefault();
        main();
    });

    headerMenu.append('<li id="logout-link"><a href="#">Logout</a></li>');
    $("#logout-link").on("click", function( event ) {
        event.preventDefault();
        currentUser = null;
        main();
    });
}

function renderNewEventForm (){
    var template = $('#new-event-form').html();
    $(".wrapper").html(template);


    $("#newEventForm").on("submit", function( event ) {
        event.preventDefault();

        var transmittedData = {};
        transmittedData.date_start = this.newEventDateStart.value;
        transmittedData.date_finish = this.newEventDateFinish.value;
        transmittedData.name = this.newEventName.value;
        transmittedData.description = this.newEventDescription.value;

        var url = "http://localhost:3000/v1/events?token=" + currentUser;
        apiConnect(url, "POST", transmittedData, function(error, returnedData){
            if (error){
                // var data = JSON.parse(error);
                var html = "<h2 class='text-danger center'>" + error + "</h2>";
                var form = $("#newEventForm");
                if(!form.next().length){
                    form.after(html);
                }
            }else{
                main();
            }
        });
        return false;
    });
}

function renderShowProfile(){
    var url = "http://localhost:3000/v1/users?token=" + currentUser;
    apiConnect(url, "GET", {}, function(error, returnedData){
        if (error){
            var html = "<h2 class='text-danger center'>" + error + "</h2>";
            $(".wrapper").after(html);
        }else{
            var source   = $("#show-profile-form").html();
            var template = Handlebars.compile(source);
            var data = {
                name: returnedData.data.name,
                email: returnedData.data.email
            };
            $(".wrapper").html(template(data));
        }
    });
}

function renderEditProfile(){
    var url = "http://localhost:3000/v1/users?token=" + currentUser;
    apiConnect(url, "GET", {}, function(error, returnedData){
        if (error){
            var html = "<h2 class='text-danger center'>" + error + "</h2>";
            $(".wrapper").after(html);
        }else{
            var source   = $("#edit-profile-form").html();
            var template = Handlebars.compile(source);
            var data = {
                // user:{
                    name: returnedData.data.name,
                    email: returnedData.data.email
                // }
            };

            $(".wrapper").html(template(data));


            $("#editProfileForm").on("submit", function( event ) {
                event.preventDefault();

                var transmittedData = {};
                transmittedData.user = {};
                transmittedData.user.name = this.editProfileName.value;
                transmittedData.user.email = this.editProfileEmail.value;
                transmittedData.user.password = this.editProfilePassword.value;
                transmittedData.user.password_confirmation = this.editProfileConfirmation.value;

                var url = "http://localhost:3000/v1/users" + "?token=" + currentUser;

                apiConnect(url, "PUT", transmittedData, function(error, returnedData){
                    if (error){
                        var html = "<h2 class='text-danger center'>" + error + "</h2>";
                        $(".wrapper").after(html);
                    }else{
                        currentUser = returnedData.data.token;
                        main();
                    }
                });
                return false;
            });
        }
    });
}


function apiConnect (url, method, data, callback){
    var returnedData = {};
    var responsedObject = {};

    responsedObject.url = url;
    responsedObject.dataType = "json";
    responsedObject.contentType = "application/json;charset=UTF-8";
    responsedObject.data = JSON.stringify(data);

    if (method.toLowerCase() == "put"){
        responsedObject.type = "POST";
        responsedObject.headers = {"X-HTTP-Method-Override": "PUT"}; // X-HTTP-Method-Override set to PUT.
    }else{
        responsedObject.type = method;
    }

    responsedObject.success = function (data, textStatus, xhr) {
        returnedData.status = xhr.status;
        returnedData.data = data;
        callback(null, returnedData);
    };

    responsedObject.error = function (xhr) {
        returnedData.status = xhr.status;
        returnedData.data = xhr.responseText;
        callback(returnedData);
    };

    $.ajax(responsedObject);
}

