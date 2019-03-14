module.exports = {
  apps : [
      {
        name: "valora",
        script: "./app.js",
        watch: true,
        env : {
          "NODE_ENV": "development",
	  "PORT" : 3000,
	  "SESSION_SECRET" : "taximola",
          "BASE_URL" : "https://valora.me"
        }
      }
  ]
}
