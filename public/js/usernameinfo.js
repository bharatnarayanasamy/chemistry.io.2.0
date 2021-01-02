//handles getting the value of the username that a player who isn't logged in stored in local storage
function getValue(id) {
  username = document.getElementById(id).value.trim(); //value of the text input
  if (username == "") {
      window.alert("Please enter a username: ")
  }
  else {
      localStorage.setItem("username", username);
      $.ajax({
          type: 'POST',
          url: '/login-without-account', //name for the express route that is sent when you dont login but enter the game
          data: {username: username},
          success: function (data) {
              window.location.replace('/game.html');
          },
          error: function (xhr) {
          }
      });
      return false;
  }
}
//let dist0 = Math.sqrt(Math.pow(this.element.x - this.element.bullet_array[k].x, 2) + Math.pow(this.element.y - this.element.bullet_array[k].y, 2));