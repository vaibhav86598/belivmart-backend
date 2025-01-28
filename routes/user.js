const express = require("express");
const User = express.Router();
const Data = require("../controller/user");
const auth = require("../middleware/Auth");

// register
User.route("/register-user").post(Data.RegisterUser)

// login
User.route("/login-user").post(Data.LoginUser)

// getalluser
User.route("/get-all-users").get(Data.getalluser)
// deleteuser
User.route("/delete-user/:id").delete(auth.IsAuthenticateUser, Data.deleteuser)

// myProfile
User.route("/my-profile").get(auth.IsAuthenticateUser, Data.myProfile)


module.exports = User 