function getValue(id) {
    a = document.getElementById(id).value.trim(); //value of the text input
    if (a == '') {
        window.alert("Please enter a username")
    }
    else {
        localStorage.setItem("vOneLocalStorage", a);
        $.ajax({
            type: 'POST',
            url: '/loginnousername',
            data: {username: a},
            success: function (data) {
                window.location.replace('/game.html');
            },
            error: function (xhr) {
            }
        });
        return false;
    }
    
}
