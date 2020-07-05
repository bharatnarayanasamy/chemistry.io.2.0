function getValue(id) {
    a = document.getElementById(id).value; //value of the text input
    localStorage.setItem("vOneLocalStorage", a);  
    window.location.replace('/game.html');
    return false;
}
