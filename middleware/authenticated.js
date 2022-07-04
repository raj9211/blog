//MIDDLEWARE AUTHETICATION
"use strict";

let jwt = require("jwt-simple");
let moment = require("moment");

let ENV = require("../config/env");
let secret = ENV.secret;

//Next represents the following part that will execute after the middleware
exports.ensureAuth = function (req, res, next) {
  if (!req.headers.authorization) {
    return res
      .status(403)
      .send({ message: "The request doesn´t have authentication header" });
  }
  //Delete any '' | "" in the header
  let token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    let payload = jwt.decode(token, secret);
    req.user = payload;

    //If the expiration date on the payload is "smaller" than the actual moment
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        message: "The token has expired",
      });
    }
  } catch (ex) {
    return res.status(404).send({
      message: "The token is not valid",
    });
  }

  next();
};
