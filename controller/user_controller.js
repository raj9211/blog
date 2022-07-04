"use strict";
require("dotenv").config();

//The uppercase to remark it is a model
let User = require("../models/user_model");


//Library Inports
let jwt = require("../services/jwt");
const moment = require("moment");
const bcrypt = require("bcrypt");
const saltRounds = 10;


function check_server_status(req, res) {
  res.status(200).send({
    message:
      "CrackingIT prod server is running on clusters and along with load balancer",
  });
}

function create_account_by_email(req, res) {
  let body = req.body;
  let user = new User();
  if (body.username && body.role_id) {
    if (body.role_id == 1) {
      // Master Admin Creation
      const salt = bcrypt.genSaltSync(saltRounds);
      const pass = bcrypt.hashSync(body.password, salt);
      user.account_created_via = 1;
      user.role_id = body.role_id;
      user.username = body.username;
      user.email = body.username;
      user.password = pass;
      user.created_at = moment().unix();
      user.created_by = body.username;

      let otp = 100000 + Math.floor(Math.random() * 900000.0);
      let expire_time = moment().unix() + 2 * 60 * 1000;
      User.findOne({ username: user.username }, (err, users) => {
        if (err)
          return res.status(500).send({ message: "Error in the request" });
        if (!users) {
          user.save((err, userStored) => {
            if (err)
              return res.status(500).send({ message: "Error saving the user" });
            if (userStored)
              return res.status(200).send({ message: "User registered" });
          });
        } else
          return res
            .status(409)
            .send({ message: "Master admin already registered" });
      });
    } else if (body.role_id == 2) {
      // Student creation
      const salt = bcrypt.genSaltSync(saltRounds);
      const pass = bcrypt.hashSync(body.password, salt);
      user.account_created_via = 1;
      user.role_id = body.role_id;
      user.username = body.username;
      user.email = body.username;
      user.password = pass;
      user.created_at = moment().unix();
      user.created_by = body.username;

      let otp = 100000 + Math.floor(Math.random() * 900000.0);
      let expire_time = moment().unix() + 2 * 60 * 1000;
      let data = {
        username: body.username,
        otp: otp,
        expire_otp_time: expire_time,
        role_id: body.role_id,
      };
      User.findOne({ username: user.username }, (err, users) => {
        if (err)
          return res.status(500).send({ message: "Error in the request" });
        if (!users) {
          user.save((err, userStored) => {
            if (err)
              return res.status(500).send({ message: "Error saving the user" });
            if (userStored) {
              create_student_account(req, res, data, userStored._id, body);
            }
          });
        } else {
          if (users.is_email_verified) {
            return res
              .status(409)
              .send({ message: "Student already registered" });
          } else {
            User.findOneAndUpdate(
              { _id: users._id },
              { otp: data.otp, otp_valid_till: data.expire_otp_time },
              (err, users) => {
                if (err)
                  return res.status(500).send({ message: "Error sending OTP" });
                if (users) send_otp_via_email(req, res, data);
              }
            );
          }
        }
      });
    } else if (body.role_id == 3) {
      // Recruiter creation
      const salt = bcrypt.genSaltSync(saltRounds);
      const pass = bcrypt.hashSync(body.password, salt);
      user.account_created_via = 1;
      user.role_id = body.role_id;
      user.username = body.username;
      user.email = body.username;
      user.password = pass;
      user.created_at = moment().unix();
      user.created_by = body.username;

      let otp = 100000 + Math.floor(Math.random() * 900000.0);
      let expire_time = moment().unix() + 2 * 60 * 1000;
      let data = {
        username: body.username,
        otp: otp,
        expire_otp_time: expire_time,
        role_id: body.role_id,
      };
      if (body.company_name) {
        User.findOne({ username: user.username }, (err, users) => {
          if (err)
            return res.status(500).send({ message: "Error in the request" });
          if (!users) {
            user.save((err, userStored) => {
              if (err)
                return res
                  .status(500)
                  .send({ message: "Error saving the user" });
              if (userStored) {
                create_recruiter_account(
                  req,
                  res,
                  data,
                  userStored,
                  body.company_name,
                  body.name
                );
              }
            });
          } else {
            if (users.is_email_verified == 1) {
              return res
                .status(409)
                .send({ message: "Recruiter already registered", role_id: users.role_id });
            } else {
              User.findOneAndUpdate(
                { _id: users._id },
                { otp: data.otp, otp_valid_till: data.expire_otp_time },
                (err, users) => {
                  if (err)
                    return res
                      .status(500)
                      .send({ message: "Error sending OTP" });
                  if (users) send_otp_via_email(req, res, data);
                }
              );
            }
          }
        });
      } else {
        return res.status(400).send({
          message: "Company name is missing",
        });
      }
    } else if (body.role_id == 4) {
      // Admin creation
      user.account_created_via = 1;
      user.role_id = body.role_id;
      user.username = body.username;
      user.email = body.username;
      (user.mobile = body.mobile), (user.created_at = moment().unix());
      user.created_by = body.username;

      let otp = 100000 + Math.floor(Math.random() * 900000.0);
      let expire_time = moment().unix() + 2 * 60 * 1000;
      let data = {
        username: body.username,
        otp: otp,
        expire_otp_time: expire_time,
      };
      if (!body.master_admin_id) {
        return res.status(400).send({
          message: "Master admin ID is missing",
        });
      } else if (!body.name) {
        return res.status(400).send({
          message: "Name is missing",
        });
      } else if (!body.mobile) {
        return res.status(400).send({
          message: "Mobile number is missing",
        });
      } else if (
        !body.assigned_subjects ||
        body.assigned_subjects.length == 0
      ) {
        return res.status(400).send({
          message: "Please assign subjects to the admin user",
        });
      } else {
        let temp_password = makePassword(10);
        User.findOne({ username: user.username }, (err, users) => {
          if (err)
            return res.status(500).send({ message: "Error in the request" });
          if (!users) {
            user.save((err, userStored) => {
              if (err)
                return res
                  .status(500)
                  .send({ message: "Error saving the user" });
              if (userStored) {
                create_admin_account(
                  req,
                  res,
                  body,
                  userStored._id,
                  temp_password
                );
              }
            });
          } else
            return res
              .status(409)
              .send({ message: "Admin already registered" });
        });
      }
    } else {
      return res.status(400).send({
        message: "Please enter a valid role ID",
      });
    }
  } else {
    return res.status(400).send({
      message: "The required parameters are not provided",
    });
  }
}

function create_admin_account(req, res, body, id, password) {
  let admin = new Admin();

  admin.user_id = id;
  admin.name = body.name;
  admin.email = body.username;
  admin.mobile = body.mobile;
  admin.assigned_subjects = body.assigned_subjects;
  admin.created_at = moment().unix();
  admin.created_by = body.master_admin_id;

  const salt = bcrypt.genSaltSync(saltRounds);
  const pass = bcrypt.hashSync(password, salt);
  const password_validity = moment().unix() + 24 * 60 * 60 * 1000;
  admin.temporary_password_validity = password_validity;

  let data = {
    email: body.username,
    name: body.name,
    password: password,
  };

  Admin.findOne({ user_id: id }, (err, adminFound) => {
    if (err) return res.status(500).send({ message: "Error in the request" });
    if (!adminFound) {
      admin.save((err, adminStored) => {
        if (err)
          return res.status(500).send({ message: "Error saving the user" });
        if (adminStored) {
          User.findOneAndUpdate(
            { _id: id },
            { password: pass, is_account_verified: false },
            (err, users) => {
              if (err)
                return res.status(500).send({ message: "Error sending email" });
              if (users) send_new_admin_email(req, res, data);
            }
          );
        } else {
          return res.status(401).send({ message: "Admin not created" });
        }
      });
    } else {
      return res.status(409).send({ message: "Admin already exists" });
    }
  });
}

function forgot_password(req, res) {
  let body = req.body;
  if (body.username) {
    let otp = 100000 + Math.floor(Math.random() * 900000.0);
    let expire_time = moment().unix() + 2 * 60;
    let data = {
      email: body.username,
      otp: otp,
      expire_otp_time: expire_time,
    };
    User.findOne({ username: body.username }, (err, user_found) => {
      if (err) return res.status(500).send({ message: "Error in the request" });
      if (!user_found) {
        return res.status(401).send({ message: "User not found" });
      } else {
        User.findOneAndUpdate(
          { username: body.username },
          { otp: data.otp, otp_valid_till: data.expire_otp_time },
          (err, users) => {
            if (err)
              return res.status(500).send({ message: "Error sending OTP" });
            if (users) send_forgot_password_otp_email(req, res, data);
          }
        );
      }
    });
  } else {
    return res.status(400).send({
      message: "The required parameters are not provided",
    });
  }
}

function update_password(req, res) {
  let body = req.body;
  if (body.username && body.password) {
    const salt = bcrypt.genSaltSync(saltRounds);
    const pass = bcrypt.hashSync(body.password, salt);
    User.findOne({ username: body.username }, (err, user_found) => {
      if (err) return res.status(500).send({ message: "Error in the request" });
      if (!user_found) {
        return res.status(401).send({ message: "User not found" });
      } else {
        User.findOneAndUpdate(
          { username: body.username },
          { password: pass },
          (err, users) => {
            if (err)
              return res.status(500).send({ message: "Error sending OTP" });
            if (users) send_update_password_email(req, res, data);
          }
        );
      }
    });
  } else {
    return res.status(400).send({
      message: "The required parameters are not provided",
    });
  }
}



function admin_login(req, res) {
  let body = req.body;
  if (body.username && body.password) {
    User.findOne({ username: body.username }, (err, users) => {
      if (err) return res.status(500).send({ message: "Error in the request" });
      if (!users)
        return res.status(409).send({ message: "User not registered" });
      else {
        const match = bcrypt.compare(body.password, users.password);
        if (match) {
          Admin.findOne({ email: body.username }, (err, adminFound) => {
            if (err)
              return res.status(500).send({ message: "Error in the request" });
            if (!adminFound)
              return res
                .status(409)
                .send({ message: "Admin user does not exist" });
            else {
              let current_time = moment().unix();
              if (current_time <= adminFound.temporary_password_validity) {
                User.findOneAndUpdate(
                  { username: body.username },
                  {
                    is_logged_in: 1,
                    logged_in_via: 2,
                    last_logged_in_date: moment().unix(),
                  },
                  (err, user) => {
                    if (err)
                      return res
                        .status(500)
                        .send({ message: "An error has ocurred" });
                    if (user) {
                      return res.status(200).send({
                        message: "Login successful",
                        token: jwt.createToken(user),
                        user: user,
                      });
                    } else {
                      //The user has not been found
                      return res
                        .status(409)
                        .send({ message: "User not registered" });
                    }
                  }
                );
              } else {
                return res.status(401).send({
                  message:
                    "Your temporary password has expired, please set a new password to log in",
                });
              }
            }
          });
        } else {
          return res
            .status(200)
            .send({ message: "Login failed, password does not match" });
        }
      }
    });
  } else {
    return res.status(400).send({
      message: "The required parameters are not provided",
    });
  }
}

function log_out(req, res) {
  let body = req.body;
  if (body.user_id) {
    User.findOneAndUpdate(
      { _id: body.user_id },
      {
        is_logged_in: 0,
        logged_in_via: 0,
      },
      (err, user) => {
        if (err)
          return res.status(500).send({ message: "An error has ocurred" });

        if (user) {
          return res.status(200).send({ message: "Logout successful" });
        } else {
          //The user has not found
          return res.status(409).send({ message: "User not registered" });
        }
      }
    );
  } else {
    return res.status(400).send({
      message: "The required parameters are not provided",
    });
  }
}

function fetch_admin(req, res) {
  Admin.find({ deleted_at: 0 }, (err, admin_found) => {
    if (err) return res.status(500).send({ message: "Error fetching data" });
    if (admin_found)
      return res
        .status(200)
        .send({ message: "Admin found", admin: admin_found });
    else res.status(404).send({ message: "No admin found" });
  });
}

function delete_admin(req, res) {
  let body = req.body;
  User.findOneAndUpdate(
    { _id: body.user_id },
    { deleted_at: moment().unix(), deleted_by: body.master_admin_id },
    (err, user_deleted) => {
      if (err)
        return res.status(500).send({ message: "Error deleting the Admin" });
      if (user_deleted)
        Admin.findOneAndUpdate(
          { user_id: body.user_id },
          { deleted_at: moment().unix(), deleted_by: body.master_admin_id },
          (err, admin_deleted) => {
            if (err)
              return res
                .status(500)
                .send({ message: "Error deleting the Admin" });
            if (admin_deleted)
              return res
                .status(200)
                .send({ message: "Admin deleted successfully" });
            else return res.status(401).send({ message: "Admin not deleted" });
          }
        );
      else return res.status(401).send({ message: "Admin not deleted" });
    }
  );
}

module.exports = {
  check_server_status,
  create_account_by_email,
  admin_login,
  log_out,
  forgot_password,
  update_password,
  fetch_admin,
  delete_admin,
};
