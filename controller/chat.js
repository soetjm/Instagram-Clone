const DataBase = require("../model/database");

exports.getChatPage = async (req,res)=>{
    if(req.isAuthenticated()){
        console.log(req.user.email,'from chat page');
        const newDb = new DataBase();
        const contactResult =await newDb.getContactes(req.user.email);
        const getUserProfile = await newDb.getUserByEmail(req.user.email);
        if(contactResult.length==0){
            res.render("chat/chat.ejs",{
                userPrfoile:getUserProfile[0]
            })
        }else{
            res.render("chat/chat.ejs",{
                userPrfoile:getUserProfile[0],
                userContact:contactResult[0]
            })
        }
    }else{
        res.redirect('/login')
    }
}

exports.redirectToChatPage = async (req,res)=>{
    console.log('postChatPage Clicked')
    if(req.isAuthenticated()){
        const messageSender = req.user.email;
        const messageToSend = req.body.messageToSend;
        const newDb = new DataBase();
        const userMessageResult = await newDb.getTwoUserMessage(messageSender,messageToSend);
        const messageToSendProfile = await newDb.getUserByEmail(messageToSend);
        const contactResult =await newDb.getContactes(req.user.email);
        const getUserProfile = await newDb.getUserByEmail(req.user.email);
        console.log(messageToSend,'message to send from server')
        if(userMessageResult.length==0){
            if(contactResult.length==0){
                console.log(messageToSend,'message to send from server if')
                res.render("chat/chat.ejs",{
                    userPrfoile:getUserProfile[0],
                    messageToSentUser:messageToSendProfile[0]
                })
            }else{
                console.log(messageToSend,'message to send from server else')
                res.render("chat/chat.ejs",{
                    userPrfoile:getUserProfile[0],
                    userContact:contactResult,
                    messageToSentUser:messageToSendProfile[0],
                    currentUser:req.user.email
                })
            }
        }else{
            res.render("chat/chat.ejs",{
                userPrfoile:getUserProfile[0],
                messageToSentUser:messageToSendProfile[0],
                userContact:contactResult,
                userMessage:userMessageResult,
                currentUser:req.user.email
            })
        }


    }else{
        res.render('/login');
    }
}
