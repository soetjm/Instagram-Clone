const nodemailer = require("nodemailer");
const DataBase = require("../model/database");
const fs = require("node:fs/promises");
const path = require("path");
const argon2 = require("argon2");
const env = require('dotenv');
env.config();

//this emailMap is used to link the emailaddres of the user and the passcode that give to
//the current user
let emailMap = new Map();


exports.getSignupPage = (req,res)=>{
    res.render("siginup/signup.ejs");
}
exports.getLoginPage = (req,res)=>{
    res.render("siginup/login.ejs");
}

exports.getHomePage = (req,res)=>{
  if(req.isAuthenticated()){
    res.render('HomePages/Home.ejs');
  }else{
    res.redirect("/login")
  }
}

exports.getForgetPassword = (req,res)=>{
    res.render('siginup/forgetpassword.ejs')
}


//this sendPassCodeWithEmail cb is used for verify if the email is valid before save the user
//info to the database
exports.sendPasscodeWithEmail = async (req,res)=>{
    const to = req.body.email;
    const code = req.body.code;

    if(!code){
      const add = new DataBase();
      if((await add.getUserByEmail(to)).length === 1){
        console.log('email found')
        const subject='password recovery code';
        const result = await sendEmail(to,subject);
        if(result === 'success') {
         res.render('siginup/forgetpassword.ejs',{
          send:'send email',
          email:to
         });
        }else{
         res.status(500).send('Error sending email');
        }
        
      }else{
        console.log('email not found');
        res.render("siginup/forgetpassword.ejs",{
          emailNotFound:"Your email is not found"
        })
        return;
      }
    }else{
      if(emailMap.get(to) === code){
          res.render('passwordChange.ejs',{
            email:to
          })
          emailMap.delete(to);
      }else{
          emailMap.delete(to);
          res.render("siginup/passwordChange.ejs",{
            result:'your passcode is not the same as we send'
          })
         
      }
    }

}

exports.addUserToDataBase=async (req,res)=>{
    let Obj={};
     Obj.email=req.body.email;
     Obj.password=req.body.password;
     Obj.fullname=req.body.fullname;
     Obj.username=req.body.username;

    add = new DataBase(Obj);
     try{
      let row = (await add.getUserByEmail(Obj.email)).length;
      console.log(row)
          if(row !== 0){
              res.render("siginup/signup.ejs",{
                result:'Email is arady exists'
              })
          }else{

             if((await add.getUserByUsername(Obj.username)).length !=0){
            
              res.render("siginup/signup.ejs",{
                result:'username exist please try other'
              })
             }else{
              const user = Obj;
              req.login(user,(err)=>{
                res.redirect("/emailVerify");
              })
             }
          }
     }catch(err){
      console.error("Error ocurr",err)
     }
}


//
exports.getVerifyEmail = async (req,res) =>{
  if(req.isAuthenticated()){
   const result = await sendEmail(req.user.email,"Verifay Email Adress");
  //  console.log(emailMap);
  //  console.log(result);
   if(result === 'success') {
    res.render('siginup/verifayEmail.ejs');
   }else{
    res.status(500).send('Error sending email');
   }
    
  }else{
    res.redirect("/login")
  }
}
exports.verifyAndSignup = async (req,res)=>{
  const userValue = req.body.passcode;
  const sendValue = emailMap.get(req.user.email);
  setInterval(()=>{
    emailMap.delete(req.user.email);
  },60000)
  if(sendValue === userValue){
    let Obj={};
    emailMap.delete(req.user.email);
    Obj.email=req.user.email;
    Obj.fullname=req.user.fullname;
    Obj.username=req.user.username;
    Obj.profile_image = "image/instaDefaultProfile.png";
    try{
        const hash = await argon2.hash(req.user.password);
        Obj.password=hash;
    }catch(err){
      console.error("Error occured when we try to hash password using argon2")
    }
    add = new DataBase(Obj);
    add.SaveUserInDataBase().then(()=>{
        createDirectory(Obj.email);
        res.redirect("/login");
    }).catch(err=>console.error(err));   
  }
}

exports.newPassword = async (req,res)=>{
  const email = req.body.email;
  const password = req.body.newPassword;
  const instance = new DataBase();
  instance.updatePassword(email,password).then(()=>{
      res.redirect("/login");
  }).catch(err=>console.error(err));   
}

async function sendEmail(to,sub){
  const subject=sub;
  let text='';
  for(let i=0;i<6;i++){
      text+=`${Math.floor(Math.random()*10)}`;
  }
  if(!emailMap.has(to)){
    emailMap.set(to,text);
  }else{
    return 'we send the email Alrady'
  }
  // Set up your transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',  // Use your email service, such as Gmail
    host:'smtp.gmail.com',
    auth: {
      user: env.YOU_EMAIL,  // Your email address
      pass: env.GOOGLECODE,   // Your email password or app-specific password
    },
  });
    
  // Email options
  let mailOptions = {
    from: env.YOU_EMAIL,
    to: to,
    subject: subject,
    text: text,
  };
    
  // Send email
  try {
    await transporter.sendMail(mailOptions);
    // res.status(200).send('Email sent successfully');
    return 'success'
  } catch (error) {
    return error
  }
}

/**
 * 
 * @important this createDirectory function create directory in public/image by the email of 
 * the user when the user creat account this dir is used when the user upload file or
 * profile pic the file is uploaded to this dir 
 */

async function createDirectory(folderName) {
    const dirName = "C:/Users/Sofi/Documents/my CSE/instaClonProject/public/image";
    const dirPath = path.join(dirName,folderName);

    try{
          await fs.mkdir(dirPath,{recursive:true});
          console.log('Directory created successfully:', dirPath);
    }catch(err){
      console.error('Error creating directory:', err);
    }
}




