"use strict";

let express = require("express");
let UserController = require("../controller/user_controller");

//This method allows the access to the methods GET, POST, PUT, DELETE
let api = express.Router();

//MIDDLEWARE Authentication
var Authy = require("../middleware/authenticated");

api.get("/isServerUp", UserController.check_server_status);
api.post("/createAccountByEmail", UserController.create_account_by_email);
api.post("/adminLogin", UserController.admin_login);
api.get("/fetchAdmin", Authy.ensureAuth, UserController.fetch_admin);
api.post("/deleteAdmin", Authy.ensureAuth, UserController.delete_admin);

api.post("/logout", Authy.ensureAuth, UserController.log_out);
api.post("/forgotPassword", UserController.forgot_password);
api.post("/updatePassword", UserController.update_password);

module.exports = api;
