const User = require("../model/user");
const sendToken = require("../utils/userToken");


const RegisterUser = async (req, res, next) => {
    // Check if the email already exists
    const useremail = await User.findOne({ username: req.body.email });
    
    if (useremail) {
      sendToken(useremail, 200, res);
      return
    }
  
    // Create the user
    const user = await User.create(req.body);
  
    // Send the email
    // sendToken(user, 201, res);
  
    // Send the response
    res.status(201).json({
      success: true,
      user,
    });
  };

  const LoginUser = async (req, res, next) => {
    const { username, password } = req.body;
    //   if there is no email and password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }
  
    //   check if user exists
    const user = await User.findOne({ username }).select("+password");
  
    //   if user does not exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  
    //   if user exists
    const isMatch = await user.comparePassword(password);
    // if password does not match
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    // if all is good then send token
    sendToken(user, 200, res);
  };
  const myProfile = async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource",
      });
    }

    const user = await User.findById(req.user.id);
    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  };
  
  const getalluser = async (req, res, next) => {
    const user = await User.find();
    res.status(200).json({
      success: true,
      user,
    });
  };

  const deleteuser = async (req, res, next) => {

    console.log("-=-=-=-=-=",req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      user,
    });
  }
  
  module.exports = {
    RegisterUser,
    LoginUser,
    myProfile,
    getalluser,
    deleteuser
  };
  
