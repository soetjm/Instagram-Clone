import * as store from './store.js';
import * as webRTC from './webRTC.js';
import * as constant from './constat.js';
import * as element from './element.js'

let socketIO = null;

export const registerSocketEvent=(socket)=>{
    socketIO=socket
    console.log(socket.id,'from webSoket.js');
    socket.on('connect',()=>{
        console.log('succesfully connected from client');
        console.log(socket.id);
        const emailSent = {
            useremail:document.getElementById("emailForEmitt").innerHTML
        }
        socket.emit('emailSoketIdChat',emailSent);
        store.setSocketId(socket.id)
    })
      /**
     * @event pre-offer is emited from the server to specific callee browser after the
     * callee browser get this event it start to excute handelPreOffer that is found in
     * webRTC.js
     */
    socket.on('pre-offer',(data)=>{
        console.log('pre offer came')
        webRTC.handelPreOffer(data)
    })
  
    socket.on('pre-offer-answer',(data)=>{
        webRTC.handelPreOfferAnswer(data)
    })
    socket.on("reciveChat",(data)=>{
        console.log(data,'from recive Chat');
        element.inGoingMessage(data);
    })
    socket.on("webRTC-signaling",(data)=>{
        switch(data.type){
            case constant.webRTCSignaling.OFFER:
                webRTC.hadelWebRTCOffer(data);
                break;
            case constant.webRTCSignaling.ANSWER:
                webRTC.handelWebRTCAnswer(data);
                break;
            case constant.webRTCSignaling.ICE_CANDIDATE:
                webRTC.handelWebRTCCandidate(data);
                break;
            default:
                return
        }
    })
}

//send to the server


/**
 * 
 * @sendPreOffer  emite pre-offer event to the server to get the callee browser soketid and
 * by this socketId establish realTimeConnection
 */
export const sendPreOffer = (data)=>{
    console.log('emmiting pre offer to the server')
    socketIO.emit('pre-offer',data)
}

export  const sendPreOfferAnswer = (data)=>{
    console.log(data,'from sendPreOffer')
    socketIO.emit("pre-offer-answer",data)
}

export const sendDataUsingWebRTCSignaling = (data)=>{
    socketIO.emit("webRTC-signaling",data);
}

export const getTheCalleSoketId = (calleEmail,callerEmail)=>{
    const dataToSend = {
        calleEmail,
        callerEmail
    }
    socketIO.emit('getCalleSoketId',dataToSend);
}