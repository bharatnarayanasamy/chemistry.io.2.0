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
var limit = 0;
setInterval(function () {
  $.ajax({
    type: 'POST',
    url: '/token',
    data: {
      refreshToken: getCookie('refreshJwt')
    },
    success: function (data) {
    },
    error: function (xhr) {
      limit = limit + 1;
      if (limit > 2) {
        window.alert("ERROR ERROR ERROR");
        window.location.href = '../index.html';
      }
    }
  });
}, 100);

setInterval(function () {
  limit = limit - 1;
}, 500);



