"use strict";

let express = require("express");

//Load the express framework
let app = express();

let cors = require('cors');

//Middlewares
app.use(express.urlencoded({ extended: false }));
//The request is parsed into a JSON
app.use(express.json());
app.use(cors());


//Load routes from routes folder
let UserRoutes = require("./routes/user_route");


//CORS Headers Configuration
app.use((req, res, next) => {
   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});

app.use("/auth", UserRoutes);


let server = require("http").Server(app);

module.exports = server;
