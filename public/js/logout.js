window.onbeforeunload = function () {
    window.setTimeout(function () {
        $.ajax({
            type: 'POST',
            url: '/logout',
            success: function () {
                window.alert("Refreshed!")
                if (localStorage.getItem("loginState") == "true") {
                    console.log(localStorage.getItem("loginState"))
                    window.location.href = 'loggedin.html';
                }
                else {
                    window.location.href = 'index.html';
                }
            },
            error: function () {
                window.alert("System Error - failed to log you out");
                if (localStorage.getItem("loginState") == "true") {
                    console.log(localStorage.getItem("loginState"))
                    window.location.href = 'loggedin.html';
                }
                else {
                    window.location.href = 'index.html';
                }
            }
        });
    }, 0);
    window.onbeforeunload = null; // necessary to prevent infinite loop, that kills your browser 
}