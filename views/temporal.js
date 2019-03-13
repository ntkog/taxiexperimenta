<body>
  <% if (user) { %>
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <ul class="nav navbar-nav">
        <li><a href="/profile">Datos</a></li>
        <li><a href="/transito">Tránsito</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        <% if (user) { %>
          <li><a href="/profile"><%= user && user.username %></a></li>
          <li><a href="/logout">Logout</a></li>
        <% } else { %>
          <li><a href="/login">Login</a></li>
          <li><a href="/signup">Sign Up</a></li>
        <% } %>
      </ul>
    </div><!-- /.container-fluid -->
  </nav>

  <div class="container">
    <% if(error.length > 0){ %>
      <div class="alert alert-danger"><%= error %></div>
    <%}%>
    <% if(success.length > 0){ %>
      <div class="alert alert-success"><%= success %></div>
    <%}%>

  </div>

  <script>
    (function(){
      var flashes = document.querySelectorAll(".alert");
      flashes.forEach(function(flash){
        flash.onclick = function() {flash.parentNode.removeChild(flash)};
      });
    })()
  </script>
  <% } %>
