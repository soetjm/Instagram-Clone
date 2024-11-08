const express = require('express');
const signup = require('../controller/signup.js');

const router = express.Router();

router.get("/",signup.getSignupPage);

router.post("/signup",signup.addUserToDataBase);

router.get("/login",signup.getLoginPage);

router.get("/emailVerify",signup.getVerifyEmail);

router.post("/verifayEmail",signup.verifyAndSignup);

router.get("/forget",signup.getForgetPassword);

router.post('/send-email',signup.sendPasscodeWithEmail);

router.post("/new_password",signup.newPassword);


module.exports = router;