"use strict";

const mongoose = require("mongoose"); // Node Tool for MongoDB
const Schema = mongoose.Schema; // Import Schema from Mongoose

let UserSchema = new Schema(
  {
    is_account_verified: {
      type: Number,
      default: 0,
    },
    is_prime_user: {
      type: Number,
      default: 0,
    },
    is_mobile_verified: {
      type: Number,
      default: 0,
    },
    is_email_verified: {
      type: Number,
      default: 0,
    },
    is_logged_in: {
      type: Number,
      default: 1,
    },
    logged_in_via: {
      type: Number, // FACEBOOK, GOOGLE etc 0 is not determined
      default: 0,
    },
    last_logged_in_date: {
      type: Number,
      default: 0,
    },
    account_created_via: {
      type: Number, // FACEBOOK, GOOGLE etc
      required: true,
    },
    account_status: {
      type: Number,
      default: 0,
    },
    social_id: {
      type: String,
      default: "N/A",
    },
    fcm_id: { 
      type: String,
      default: 'N/A'
    },
    device_id: {
      type: String,
      default: 'N/A'
    },
    role_id: {
      type: Number,
      default: 0,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: "N/A",
    },
    otp: {
      type: Number,
      default: 0,
    },
    otp_valid_till: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      lowercase: true,
      default: "N/A",
    },
    mobile: {
      type: String,
      default: "N/A",
    },
    updated_at: {
      type: Number,
      default: 0,
    },
    updated_by: {
      type: String,
      default: "N/A",
    },
    created_at: {
      type: Number,
    },
    created_by: {
      type: String,
    },
    deleted_at: {
      type: Number,
      default: 0,
    },
    deleted_by: {
      type: String,
      default: "N/A",
    },
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", UserSchema);
