"use strict";

//JSON WEB TOKENS

let jwt = require("jwt-simple");
let moment = require("moment");
//Secret string, only now by programmer
let ENV = require("../config/env");
let secret = ENV.secret;

exports.createToken = function (user) {
  let payload = {
    user_id: user._id,
    username: user.username,
    role_id: user.role_id,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  //It encodes the token with the data on payload and the secret key
  return jwt.encode(payload, secret);
};
