import * as wss from './webSoket.js';
import * as webRTC from './webRTC.js';
import * as constant from './constat.js';
import * as store from './store.js';
import * as ui from './ui.js';

const socket = io("/");
wss.registerSocketEvent(socket);

const videoCallButton = document.getElementById('callButton');
const chatPage = document.getElementById('chatPageScreen');
const callerVideoContainer = document.getElementById('callerVideoContainer');
const ceneterTag = document.getElementById("center");

/**
 * @videoCall when the user click the video call button in ui first it excute below code 
 * it dose the following thing
 * -first make callerVideoContainer found in view/chat/chat.ejs display and start video stream
 *  in the caller side this video Stream is used later for transfer or share the caller video
 *  to the callee if he accept the call 
 * -then start the loaclVideo stream in the caller browser
 * -then callect the calleremail and calleeemail for creating realtime connection between 
 * two browsers
 *  -the chat page then disabled
 *  -then call sendPreOffer method that is found in webRTC.js file
 * 
 * @important there are two sendPreOffer methods the one is in webRTC file and the other
 * is in webSoket.js file in short the webRTC.js sendPreOffer is for caller side browser
 * and webSoket.js sendPreOffer is for callee emite pre-offer event to callee browser
 */

videoCallButton.addEventListener('click',function(){
    callerVideoContainer.style.display='block';
    webRTC.getLocalPreviewcaller(socket);
    const callerEmail = videoCallButton.getAttribute('calleremail');
    const calleEmail = videoCallButton.getAttribute('calleeemail');
    const callType = constant.callType.VIDEO_PERSONAL_CODE
    chatPage.classList.add('opacity-0');
    ceneterTag.style.display='block';
    // console.log(calleEmail,callerEmail);
    webRTC.sendPreOffer(callType,calleEmail,callerEmail);
})

//camera on and off button

const cameraButton = document.getElementById('camara_Button')
cameraButton.addEventListener("click",()=>{
    console.log("start camarabutton excution")
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled);
})

//mic on and off sharing

const micButton = document.getElementById("mic_button");
micButton.addEventListener("click",()=>{
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    ui.updateMicButton(micEnabled)
})

const disabelButton = document.getElementById("closeVideoCallButton");
disabelButton.addEventListener("click",()=>{
    const stream = store.getState().localStream;
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); 
    }
})

//screen sharing

const switchForScreenSharingButton = document.getElementById('screenShare');
switchForScreenSharingButton.addEventListener("click",()=>{
    const screenSharingActive = store.getState().screenSharingActive;
    webRTC.switchBetweenCameraAndScreenSharing(screenSharingActive);
})