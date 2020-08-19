function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var consecutive = 0;
setInterval(function () {
  $.ajax({
    type: 'POST',
    url: '/token',
    data: {
      refreshToken: getCookie('refreshJwt')
    },
    success: function (data) {
      if (localStorage.getItem("exitPage") == "true") {
        window.alert("Unauthorized - taking you back home...");
        window.location.href = 'loggedin.html';
      }
      localStorage.setItem("exitPage", "false");
    },
    error: function (xhr) {
      //window.alert(JSON.stringify(xhr));
      if (localStorage.getItem("loginState") == "true") {
        window.location.href = 'loggedin.html';
      }
      else {
        //window.alert("boop bop");
        window.location.href = 'index.html';
      }
    }
  });
}, 2000);
