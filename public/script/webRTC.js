import * as ui from './ui.js';
import * as store from './store.js';
import * as constant from './constat.js';
import * as wss from './webSoket.js';


let connectUserDetail;
let peerConnection;
// let dataChannel;

const defaultConstraints = {
    audio:true,
    video:true
}

const stunServer = {
    iceServers:[
        {
            urls:'stun:stun.l.google.com.13902'
        }
    ]
}

export const getLocalPreviewcaller = ()=>{
    navigator.mediaDevices.getUserMedia(defaultConstraints)
    .then((stream)=>{
        ui.updateLocalVideo(stream);
        store.setLocalStream(stream);
    }).catch((err)=>{
        console.log('Error occure when try to access the camera or audio',err);
    })
}
const getLocalPreviewcallee = ()=>{
    navigator.mediaDevices.getUserMedia(defaultConstraints)
    .then((stream)=>{
        ui.updateLocalVideo(stream);
        store.setLocalStream(stream);
    }).catch((err)=>{
        console.log('Error occure when try to access the camera or audio',err);
    })
}


const createPeerConnection = ()=>{
    peerConnection = new RTCPeerConnection(stunServer)

    dataChannel = peerConnection.createDataChannel('chat')

    peerConnection.ondatachannel = (event)=>{
        const dataChannel = event.channel;
    }

    peerConnection.onicecandidate = (event)=>{
        console.log('Getting ice candidate from stan server');
        console.log(event.candidate,'event candidate')

        if(event.candidate){
            console.log(connectUserDetail.personalEmail,'form peerConnection')
            //send dataSignaling to the callee and caller side browser
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId:connectUserDetail.personalEmail,
                type:constant.webRTCSignaling.ICE_CANDIDATE,
                candidate:event.candidate
            })
        }
    }

    peerConnection.onconnectionstatechange = (event)=>{
        if(peerConnection.connectionState === 'connected'){
            console.log('sucssfully connected to order peer')
        }
    }

    const remotStream = new MediaStream();
    store.setRemoteStream(remotStream);
    ui.updateRemoteVideo(remotStream);
    // ui.showVideoCallElement();

    peerConnection.ontrack = (event)=>{
        remotStream.addTrack(event.track)
    }

    if(connectUserDetail.callType === constant.callType.VIDEO_PERSONAL_CODE){
        const localStream = store.getState().localStream

        for(const track of localStream.getTracks()){
            peerConnection.addTrack(track,localStream)
        }
    }
}
/**
 * @sendPerOffer is start execution after  we click the video call button as we see in main.js
 * it asign @connectUserDetail in caller side and start showing the dialog box in caller side
 * then send Offer to calle side by using wss.sendPreOffer()
 *  
 */

export const sendPreOffer=(callType,callPersonalEmail,callerPersonalEmail)=>{
    console.log(callPersonalEmail,callerPersonalEmail)
    connectUserDetail={
        callType,
        personalEmail:callPersonalEmail,
        callerEmail:callerPersonalEmail
    }

    if(callType === constant.callType.VIDEO_PERSONAL_CODE){
        const data = {
            callType,
            callPersonalEmail:callPersonalEmail,
            callerPersonalEmail:callerPersonalEmail
        }
        ui.showCallingDialog(callPersonalEmail)
        wss.sendPreOffer(data)
    }
    
}

/** 
 * @method handelPreOffer when this code is excute in callee browser from webSoket.js 
 * show the call dialog in callee browser to accept and reject the call currently the reject
 * button is not functional only accept button is functional cuz my eaime is to establish real
 * time video call ... the accept button is fround in element.js
 * 
 */

export const handelPreOffer =(data)=>{
    const {callType,callerSocketId,callerInfo,calleeInfo,callerPersonalEmail}= data;
    connectUserDetail = {
        socketId:callerSocketId,
        callerInfo:callerInfo,
        calleeInfo:calleeInfo,
        personalEmail:callerPersonalEmail,
        callType,
 
    };
    
    if(callType === constant.callType.VIDEO_PERSONAL_CODE){
        ui.showIncomingCallDialog(callerInfo,acceptCallHandler,rejectCallHandler)
    }
    console.log(callType);
}


const callerVideoContainer = document.getElementById('callerVideoContainer');
/**
 * @method acceptCallHandler when the callee accept the call we start to get the video stream
 * in callee side browser and call creatPeerConnection() method this method start to stream
 * the video from the calle side to the caller side and show the call elements like camera of 
 * swich camera
 */
const acceptCallHandler=()=>{
    callerVideoContainer.style.display='block';
    getLocalPreviewcallee();
    console.log('call accepted');
    createPeerConnection();
    sendPreOfferAnswer(constant.preOfferAnswer.CALL_ACCEPT);
    ui.showCallElements(constant.callType.VIDEO_PERSONAL_CODE);
}



const sendPreOfferAnswer = (preOfferAnswer)=>{
    const data = {
        callerSocketId:connectUserDetail.personalEmail,
        preOfferAnswer
    }
    ui.removeAllDialogs()
    wss.sendPreOfferAnswer(data);
}


export const hadelWebRTCOffer = async (data)=> {
    await peerConnection.setRemoteDescription(data.offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    console.log(connectUserDetail,'handel web RTC offer')
    console.log(answer,'answer from handelWEBRTCOFFER')
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId:connectUserDetail.personalEmail,
        type:constant.webRTCSignaling.ANSWER,
        answer:answer,
    })
}

export const handelWebRTCAnswer = async (data)=>{
    console.log('handling webRTC Answer')
    await peerConnection.setRemoteDescription(data.answer);
}

export const handelWebRTCCandidate = async (data) =>{
    console.log("handling incoming webRTC candidate")
    try{
        await peerConnection.addIceCandidate(data.candidate)
    }catch(err){
        console.error("error occured when trying to add the receved ice candidate",err)
    }
}

export const handelPreOfferAnswer =  (data)=>{
    const { preOfferAnswer, calleeInfo} = data;

    console.log('pre offer answer come');
    console.log(data);
    if(preOfferAnswer === constant.preOfferAnswer.CALLEE_NOT_FOUND){
        ui.showInfoDialog(preOfferAnswer,calleeInfo);
    }

    if(preOfferAnswer === constant.preOfferAnswer.CALL_UNAVAILABLE){
        ui.showInfoDialog(preOfferAnswer);
    }

    if(preOfferAnswer === constant.preOfferAnswer.CALL_REJECT){
        ui.showInfoDialog(preOfferAnswer);
    }

    if(preOfferAnswer === constant.preOfferAnswer.CALL_ACCEPT){
        ui.showCallElements(connectUserDetail.callType)
        createPeerConnection();
        sendWebRTCOffer()
    }
}

const sendWebRTCOffer =async ()=>{
    const offer  = await peerConnection.createOffer() 
    await peerConnection.setLocalDescription(offer);
    console.log(connectUserDetail.personalEmail,'fron sendWebRTC OFFer');
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId:connectUserDetail.personalEmail,
        type:constant.webRTCSignaling.OFFER,
        offer:offer
    })
} 


//screen sharing anctivity

//screen sharing function
let screenSharingStream;
export const switchBetweenCameraAndScreenSharing = async (screenSharingAcitve)=>{
    if(screenSharingAcitve){
        const localStream = store.getState().localStream;
        const senders = peerConnection.getSenders()
        
        const sender = senders.find((sender)=>{
           return ( 
            sender.track.kind === localStream.getVideoTracks()[0].kind
           );
        })

        if(sender){
            sender.replaceTrack(localStream.getVideoTracks()[0])
        }

        //stop screen sharing stream
        store.getState().screenSharingStream.getTracks().forEach((track) => {
                track.stop()
        });

        store.setScreenSharingAcitve(!screenSharingAcitve);
        ui.updateLocalVideo(localStream)
    }else{
        console.log('swiching for screen sharing');
        try{
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({video:true});
            store.setScreenSharingStream(screenSharingStream);

            //replace the track which sender send
            const senders = peerConnection.getSenders()

            const sender = senders.find((sender)=>{
               return ( 
                sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
               );
            })

            if(sender){
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0])
            }
            store.setScreenSharingAcitve(!screenSharingAcitve);
            ui.updateLocalVideo(screenSharingStream);
        }catch(err){
            console.error("Error occured when trying to get screen share stream",err)
        }
    }
}