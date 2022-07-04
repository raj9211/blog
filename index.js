"use strict";

const config = require("./config/env");
let app = require("./app");
const port = process.env.PORT || 3000;


let mongoose = require("mongoose");
// mongoose.Promise = global.Promise;


mongoose
  .connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(
        "Server running at http://"  + port
      );
    });
  })
  .catch((err) => console.log(err));
