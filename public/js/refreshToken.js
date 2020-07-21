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
      consecutive = 0
    },
    error: function (xhr) {
      consecutive = consecutive + 1;
      if (consecutive > 2 && consecutive < 3) {
        window.location.href = "index.html";
      }
    }
  });
}, 100);
 



