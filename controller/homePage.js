const DataBase = require("../model/database");
const graphInstance = require("../model/suggestionGraph");
const argon2 = require("argon2");
const fs = require("node:fs/promises");
const path = require('path');

//this email map is not the same as that we see in signup.js file
const emailMap = new Map();
exports.postLogin = async (req,res)=>{
    const email = req.body.email
    const password = req.body.password;
    const dbObj = new DataBase();
    const result = await dbObj.getUserByEmail(email);
    if(result.length == 0){
        res.render('siginup/login.ejs',{
            usernotFound:"user not found"
        })
    }else{
        try{
            const userData = result[0];
            if(await argon2.verify(userData.password,password)){
                const user=result[0]
                req.logIn(user,(err)=>{
                  console.log('succes');
                  res.redirect("/home");
                })
            }else{
                res.render('siginup/login.ejs',{
                    passwordIncorrect:"your password is incorrect"
                })
            }
        }catch(err){
            console.error('Error occured when try to varifay the argon2')
        }
    }
}

exports.getHomePage = async (req,res)=>{
    if(req.isAuthenticated()){
      const email = req.user.email;
      const add = new DataBase();
      const userResult =await add.getUserByEmail(email);
      const followersResult = await add.getFollowers(email);
      const followingResult = await add.getFollowing(email);
      const suggestionArray = graphInstance.getSuggestionFollower(email);
      let suggestionResult = await add.getUserDataByArray(suggestionArray);
      console.log(suggestionResult,'from suggestion result');
      if(followersResult.length==0 && followingResult.length==0){
        const mostFollowedResult =await add.getMostFollowedUser(email);
        let suggestionFollower =await add.getUserRandomly(email);
        if(mostFollowedResult.length==0){
            console.log('Hello from login page')
            //code of 1
            res.render('HomePages/Home.ejs',{
                userProfile:userResult[0],
                noFollowerResult:"No followers",
                noFollowingResult:'No Following',
                randomUser:suggestionFollower
            });
        }else{
            
            if(mostFollowedResult.length <=6){
              suggestionFollower = mergeArrays(mostFollowedResult,suggestionFollower)
              emailMap.clear();
            }
            if(suggestionResult.length == 0) {
                suggestionResult=suggestionFollower;
            }
            // console.log(suggestionFollower,'suggestion follwor');
            //remeber latter to take this code inside of function
            //with code of 1
            res.render('HomePages/Home.ejs',{
                userProfile:userResult[0],
                noFollowerResult:"No followers",
                noFollowingResult:'No Following',
                randomUser:suggestionFollower
            });
        }
     

      }else if(followersResult.length==0){
            const result = await add.getAllPostExceptCurrentUser(email);
            const mostFollowedResult =await add.getMostFollowedUser(email);
            let suggestionFollower =await add.getUserRandomly(email);
            if(mostFollowedResult.length <=6){
                suggestionFollower = mergeArrays(mostFollowedResult,suggestionFollower)
                emailMap.clear();
            }
           
            // console.log(suggestionResult,'from else if block')
                res.render('HomePages/Home.ejs',{
                    userProfile:userResult[0],
                    postesFromFollowers:result,
                    suggestionForYou:suggestionFollower
                })
      }else{
        const result1 = await add.getUserPostesFromFollower(email);
        const result2 = await add.getAllPostExceptCurrentUser(email);
        const result = mergeArraysForPost(result1,result2);
        emailMap.clear();
            res.render('HomePages/Home.ejs',{
                userProfile:userResult[0],
                postesFromFollowers:result,
                suggestionForYou:suggestionResult
            })
      }
      
      
    }else{
      res.redirect("/login")
    }
}

exports.getProfilePage = async (req, res) => {
    if(req.isAuthenticated()){
        const userId = req.params.id;
        const dbObject = new DataBase();
        const userResult = await dbObject.getUserByEmail(userId);
        const followers = await dbObject.getFollowers(userId);
        const following = await dbObject.getFollowing(userId);
        const userPostes = await dbObject.getUserPostesByEmail(userId);

        if(userPostes.length === 0){
            res.render("HomePages/profile.ejs",{
                userProfile : userResult[0],
                numFollowers:followers.length,
                numFollowing : following.length
            });
        }else{
            // console.log(userResult);
            res.render("HomePages/profile.ejs",{
                userProfile : userResult[0],
                numFollowers:followers.length,
                numFollowing : following.length,
                Posts:userPostes
            });
        }
        // Here you would typically fetch user data from a database
       

    }else{
        res.redirect("/login");
    }
}

exports.getOthersProfile = async(req,res)=>{
    if(req.isAuthenticated()){
        const userId = req.params.id;
        const dbObject = new DataBase();
        console.log(req.user.email,'from others profile');
        
        const userResult = await dbObject.getUserByEmail(userId);
        const followers = await dbObject.getFollowers(userId);
        const following = await dbObject.getFollowing(userId);
        const userPostes = await dbObject.getUserPostesByEmail(userId);
        let userfollowCondition;
        const iFollowHim = await dbObject.getIFollowSpecificPereson(req.user.email,userId);
        const heFollowMe =await dbObject.getIFollowSpecificPereson(userId,req.user.email);
        if(iFollowHim.length===0 && heFollowMe==0){
            //andrargem
            userfollowCondition=1;
        }else if(iFollowHim.length==1 && heFollowMe.length ==0){
            //ene argwalew esu ayrgenim
            userfollowCondition=2
        }else if(heFollowMe.length==1 && iFollowHim.length == 0){
            //esu yargenal ene alrgewim
            userfollowCondition=3
        }else{
            //hultacnem endrargalen
            userfollowCondition=4
        }

        if(userPostes.length === 0){
            res.render("HomePages/othersProfile.ejs",{
                userProfile : userResult[0],
                numFollowers:followers.length,
                numFollowing : following.length,
                followingCondition:userfollowCondition,
                email:req.user.email
            });
        }else{
            // console.log(userResult);
            res.render("HomePages/othersProfile.ejs",{
                userProfile : userResult[0],
                numFollowers:followers.length,
                numFollowing : following.length,
                Posts:userPostes,
                followingCondition:userfollowCondition,
                email:req.user.email
            });
        }
    }else{
        res.redirect("/login");
    }
}

exports.postProfile =async (req,res)=>{
    if(req.isAuthenticated()){
        let imageUrl = req.file;
        const uniqueDirectory = req.body.userId
        const sourcePath = `./public/image/${imageUrl.filename}`;
        console.log(`sourcePath:${sourcePath}`);
        const destinationDirectory = path.join(__dirname, '../public','image',`${uniqueDirectory}`);
        console.log(`destinationPath:${destinationDirectory}`);
        moveFile(sourcePath,destinationDirectory);
        const nwdb = new DataBase();
        const profile = `image/${uniqueDirectory}/${imageUrl.filename}`;
        nwdb.updateProfile(uniqueDirectory,profile)
        res.redirect(`/profile/${uniqueDirectory}`);
        // console.log(imageUrl);
    }else{
        res.redirect("/login");
    }
}

exports.postFile =  async (req,res)=>{
        if(req.isAuthenticated()){
            let Obj={}
            let imageUrl = req.file;
            const email =Obj.email= req.body.email;
            console.log(email);
            console.log(req.file);
            Obj.posttext = req.body.text;
            console.log(typeof(imageUrl.filename));
            Obj.post_id= imageUrl.filename
            Obj.fileUrl = `image/${email}/${imageUrl.filename}`;
            if(imageUrl.mimetype.includes('video')){
                Obj.type= 'video';
            }else{
                Obj.type = 'image';
            }
            const sourcePath = `./public/image/${imageUrl.filename}`;
            const destinationDirectory = path.join(__dirname, '../public','image',`${email}`);
            moveFile(sourcePath,destinationDirectory);
            
            add = new DataBase(Obj);
            add.SavePostInDataBase().then(()=>{
            //   res.redirect(`/profile/${email}`);
            }).catch(err=>console.error(err));
        }else{
            res.redirect("/login");
        }
}

exports.addFollowers = async (req,res)=>{
    if(req.isAuthenticated()){
        const email = req.body.userEmail
        const followEmail = req.body.followEmail;
        const followDb = new DataBase();
        followDb.addFollowes(email,followEmail).then(()=>{
            res.redirect(`/othersProfile/${followEmail}`)
            console.log('success fully add the follwoer')
        }).catch(err=>console.error(err));
    }else{
        res.redirect("/login");
    }
}

exports.postComment = async (req,res)=>{
    if(req.isAuthenticated()){
        const postId = req.body.Id;
        console.log(postId,'from get comment routes')
    }else{
        res.redirect("/login");
    }
}

//this moveFile method is used for when the user upload the file the multer handle it and 
//store it to the public/image dirs then this method transfer the file to the user dir created
//when the user is registerd in the database
async function moveFile(sourceFile, destinationDir) {
    try {
        // Create destination directory if it doesn't exist
        // await fs.mkdir(destinationDir, { recursive: true });

        // Define destination path
        const destinationFile = path.join(destinationDir, path.basename(sourceFile));
        console.log(destinationFile);
        // Move the file
        await fs.rename(sourceFile, destinationFile);
        console.log('File moved successfully!');
    } catch (err) {
        console.error('Error moving file:', err);
    }
}

//this margeArrray function do take two array and return the union of them
function mergeArrays (arr1, arr2)  {
    arr1.forEach(item => emailMap.set(item.email, item));
    arr2.forEach(item => {
        if (!emailMap.has(item.email)) {
            emailMap.set(item.email, item);
        }
    });
    return Array.from(emailMap.values());
};

function mergeArraysForPost (arr1, arr2)  {
    arr1.forEach(item => emailMap.set(item.post_id, item));
    arr2.forEach(item => {
        if (!emailMap.has(item.post_id)) {
            emailMap.set(item.post_id, item);
        }
    });
    return Array.from(emailMap.values());
};