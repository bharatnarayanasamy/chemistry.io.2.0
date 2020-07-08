function getValue(id) {
    a = document.getElementById(id).value; //value of the text input
    localStorage.setItem("vOneLocalStorage", a);
    $.ajax({
        type: 'POST',
        url: '/loginnousername',
        data: {username: a},
        success: function (data) {
            alert(data);
            window.location.replace('/game.html');
        },
        error: function (xhr) {
            alert(xhr);
        }
    });
    return false;
}
