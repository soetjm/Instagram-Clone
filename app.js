const express=require("express");
const session = require("express-session");
const bodyParser=require("body-parser");
const passport = require("passport");
const http = require("node:http");
const DataBase = require('./model/database')
const cors = require('cors');
const multer = require('multer');
const socketIo = require('socket.io');
const homePage = require('./route/homePage');
const signupRoute = require('./route/signup');
const chatRout = require('./route/chat'); 

//this mapEmailSocktID is used for maping the user email to its soketid when establish new 
//connection to the server
const mapEmailSoketID = new Map();


const port=3000;
const app=express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());


//initalizing the express session
app.use(
    session({
      secret: 'my secrate',
      resave: false,
      saveUninitialized: true,
    })
);

app.use(express.static("public"));

app.use(bodyParser.urlencoded({express:true}));

//uplode file storage dir but in controller homePage we move the file to spacific user dir
//by using the moveFile function in controller homePage.js line 266

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `public/image/`); // Directory to save the uploaded files
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+'-'+file.originalname); // Unique filename
    },
});



app.use(multer({storage:storage}).single('image'))
  

app.use(passport.initialize());
app.use(passport.session());

//roures
app.use(signupRoute);
app.use(homePage);
app.use(chatRout)


//soket io event handler and emiter
io.on('connection', (socket) => {
  console.log('New client connected',socket.id);

  socket.on('emailSoketId',(data)=>{
      
      mapEmailSoketID.set(data.useremail,socket.id) ; 
      console.log(mapEmailSoketID,'from email soketId')
  })
  socket.on('emailSoketIdChat',(data)=>{
      
      mapEmailSoketID.set(data.useremail,socket.id) ; 
      console.log(mapEmailSoketID,'from email soketId emailSoketIdChat')
  })

  socket.on('chatSend',async (data)=>{
    let Obj={};
    const sender = data.senderEmail;
    const recive = data.reciverEmail;
    const message = data.message;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const message_id = sender.split("@")[0] + recive.split("@")[0]+uniqueSuffix;
    Obj.sender = sender;
    Obj.receiver=recive;
    Obj.message=message;
    Obj.message_id=message_id;
    const newDb = new DataBase(Obj);
    newDb.SaveMessageInDataBase();    

    if(mapEmailSoketID.has(recive)){
        const senderInfo = await newDb.getUserByEmail(sender);
        const dataToSend = {
          ...data,
          senderImage:senderInfo[0].profile_image
        }
        // data.senderImage = senderInfo.profile_image;
        // console.log(dataToSend,'from the reciver chat')
        io.to(mapEmailSoketID.get(recive)).emit('reciveChat',dataToSend);
    }
    socket.emit('sendeChat',data);
  })

  socket.on('webRTC-signaling',(data)=>{
    const connectedUserSocketId  = data.connectedUserSocketId;
    console.log(connectedUserSocketId,data.type,' from webRTC-signalling')
    if(mapEmailSoketID.has(connectedUserSocketId)){
      io.to(mapEmailSoketID.get(connectedUserSocketId)).emit("webRTC-signaling",data);
    }
  })
  socket.on("getCalleSoketId",(data)=>{
    const calleEmail = data.calleEmail;
    const callerEmail = data.callerEmail;
    if(mapEmailSoketID.has(calleEmail)){
      const dataToSend = {
        calleSoketId:mapEmailSoketID.get(calleEmail)
      }
      io.to(mapEmailSoketID.get(callerEmail)).emit("getcalleEmal",dataToSend);
    }
  })

  socket.on("pre-offer-answer",(data)=>{
    // console.log("pre offer come")
    console.log(data,'from pre-offer-answer');

    if(mapEmailSoketID.has(data.callerSocketId)){
      io.to(mapEmailSoketID.get(data.callerSocketId)).emit("pre-offer-answer",data);
    }
  })
  //handling the pre-offer event emitted from the caller browser and then excute some info form
  //database for bothe caller and callee after that it emite pre-offer-answer event to the calle
  //browser the callee brower handel this event in webSoket.js file in script folder for browser js
  
  socket.on('pre-offer',async (data)=>{
    const {callType} =data;
    console.log(data,'from pre-offer');
    const callPersonalEmail = data.callPersonalEmail
    const callerEmail =data.callerPersonalEmail
    console.log(callerEmail,'caller email from pre offer');
    const callerSoketId = mapEmailSoketID.get(callerEmail);
    console.log(callerSoketId,' form pre-offer event',socket.id);
    const newDb = new DataBase();
    const calleeResult = await newDb.getUserByEmail(callPersonalEmail);
    const callerResult = await newDb.getUserByEmail(callerEmail);
    if(mapEmailSoketID.has(callPersonalEmail)){
      // console.log(connectedPeer);
      console.log('calle exist');
        const dataSendToCalle={
            callerSocketId:callerSoketId,
            callerPersonalEmail:callerEmail,
            callerInfo:callerResult[0],
            calleeInfo:calleeResult[0],
            callType,
        }


        io.to(mapEmailSoketID.get(callPersonalEmail)).emit('pre-offer',dataSendToCalle);
    }else{
      console.log('calle dosnt exist');
        const data = {
            preOfferAnswer:'CALLEE_NOT_FOUND',
            calleeInfo:calleeResult[0],
        }
        io.to(socket.id).emit('pre-offer-answer',data);
    }
  })
  socket.on('getComment',async(data)=>{
    const postId = data.Id;
    const newDb = new DataBase();
    const result =await newDb.getCommentAndCrosspondingData(postId);
    let sendHTMLComponet='';
    if(result.length!==0){
    result.forEach((item)=>{
      sendHTMLComponet += ` 
 <div class="flex item-center mt-4 mb-4">
        <div style="height: 50px;width:50px">
               <img style="height: 50px;width:50px" class="rounded-full" src="/${item.profile_image}" alt="profile">
        </div>
        <div class="ml-3 " style="width:75%" >
            <p class="text-white font-normal text-sm ">${item.fullname}  ${item.usercomment}</p>
            <div class="flex justify-between mt-2 mb-3" style="width: 150px">
                <span class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">1d</span>
                <span class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">10 like</span>
                <span onclick="Replay(event)" username="${item.username}" commentid="${item.commentid}" name="${item.fullname}" class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">Replay</span>
            </div>
            <span commentid="${item.commentid}"  onclick="seeReplay(event)" class="text-gray-400  cursor-pointer font-sans font-semibold text-sm">View Replay</span>
              <div id="${item.commentid}" >
                      
              </div>
        </div>
</div>`
    })
    }
    const respons = {commenst:sendHTMLComponet};
    socket.emit('sendBackComment', JSON.stringify(respons));
  });
  socket.on("getAllReplay",async(data)=>{
      const commentid = data.commentid; 
      const newDb = new DataBase();
      const result = await newDb.getAllReplayByCommentId(commentid);
      let innerHTML = '';
      if(result.length!=0){
        result.forEach((item)=>{
          innerHTML+=`
           <div  class="replaySession flex item-center mt-4 ml-3 mb-4">
               <div style="height: 50px;width:50px">
                    <img style="height: 50px;width:50px" class="rounded-full" src="/${item.profile_image}" alt="profile">
                </div>
                <div class="ml-3 " style="width:75%" >
                    <p class="text-white font-normal text-sm "><span style="color:rgb(224,241,255)">${item.fullname}</span>  ${item.replay} </p>
                    <div class="flex justify-between mt-2" style="width: 100px">
                        <span class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">1d</span>
                        <span onclick="Replay(event)" username="${item.username}" commentid="${item.commentid}" name="${item.fullname}" class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">Replay</span>
                    </div>
                </div>
            </div>
          `
        })
      }
      const dataToSend = {
        commentid:commentid,
        innerHtml:innerHTML
      }
      socket.emit("emitingAllReplay",dataToSend);
  })
  socket.on('replayComment',async(data)=>{
    const replayId = 'replay-'+data.commentid+`-${data.userreplay}-`+ Math.round(Math.random() * 1E9);
    data.replayid = replayId;
    const newDb = new DataBase(data);
    newDb.saveReplay();
    const replyerData = await newDb.getUserByUsername(data.userreplay);
    const dataSend = {
      profile_image:replyerData[0].profile_image,
      fullname:replyerData[0].fullname,
      userreplay:data.userreplay,
      replay:data.replay,
      commentid:data.commentid
    }
    socket.emit('sendBackCurrentReplay',dataSend);
  })
  socket.on('postComment',async(data)=>{
    const postId = data.postId.split('-')[0]+`-${data.username}-`+ Math.round(Math.random() * 1E9)
    data.commentId = postId;
    const newDb = new DataBase(data);
    newDb.saveComment();
    const result =await newDb.getCommentAndCrosspondingData(data.postId);
    console.log(result,'from post comment');
    let sendHTMLComponet=''
    result.forEach((item)=>{
      sendHTMLComponet += ` 
 <div class="flex item-center mt-4 mb-4">
        <div style="height: 50px;width:50px">
               <img style="height: 50px;width:50px" class="rounded-full" src="/${item.profile_image}" alt="profile">
        </div>
        <div class="ml-3 " style="width:75%" >
            <p class="text-white font-normal text-sm ">${item.fullname}  ${item.usercomment}</p>
            <div class="flex justify-between mt-2 mb-3" style="width: 150px">
                <span class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">1d</span>
                <span class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">10 like</span>
                <span onclick="Replay(event)" username="${item.username}" commentid="${item.commentid}" name="${item.fullname}" class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">Replay</span>
            </div>
            <span commentid="${item.commentid}"  onclick="seeReplay(event)" class="text-gray-400  cursor-pointer font-sans font-semibold text-sm">View Replay</span>
              <div id="${item.commentid}" >
                      
              </div>
        </div>
</div>`
    });
    // console.log(result,'from post comment')
    const respons = {commenst:sendHTMLComponet};
    socket.emit('sendBackComment', JSON.stringify(respons));
  })
  socket.on('serchEngien',async(data)=>{
      const userquary = data.userquary;
      const whoSerch = data.whoSerch;
      const newDb = new DataBase();
      const result =await newDb.getSerchResult(userquary);

      let innerHtml = '';

      if(result.length !=0){
           result.forEach((item)=>{
                if(item.email != whoSerch){
                  innerHtml+=`
                    <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <img src="/${item.profile_image}" useremail='${item.email}' onclick="getPage(event)" alt='pofile image' class="w-10 h-10 cursor-pointer rounded-full"/>
              <div>
                <p class="text-sm font-semibold">${item.username}</p>
                <p class="text-xs text-gray-400">${item.bio}</p>
              </div>
            </div>
            <button class="text-gray-400">&times;</button>
          </div>
                  `
                }
           })
      }

      const dataToSend = {
        innerhtml:innerHtml
      }

      socket.emit("sendSerchResult",dataToSend);
  })
  socket.on('disconnect',()=>{
    console.log('user desconect');
    mapEmailSoketID.forEach((value,key)=>{
      if(value === socket.id){
        mapEmailSoketID.delete(key);
      }
    })
    console.log(mapEmailSoketID);
  })

});



passport.serializeUser((user, cb) => {
    cb(null, user);
});
  
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

server.listen(port,()=>{
    console.log(`server start at ${port}`);
})