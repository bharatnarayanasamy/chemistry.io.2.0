var email = localStorage.getItem("email")
if (typeof email != "object") {
    const data = { "email": localStorage.getItem("email") };
    console.log(data);
    $.ajax({
        type: 'GET',
        url: '/get-user',
        data,
        success: function (data) {
            console.log(data);
            window.alert(data);
            localStorage.setItem("loggedInUername", data.name);
            localStorage.setItem("loggedInHighScore", data.highScore);
            localStorage.setItem("loggedInKills", data.kills);
            localStorage.setItem("loggedInElement", data.bestElement);
        },
        error: function (xhr) {
            console.log(xhr);
            window.alert(xhr);
        }
    });
}

var welcome = document.getElementById('welcome');
welcome.value = "Welcome back, " + localStorage.getItem("loggedInUsername");