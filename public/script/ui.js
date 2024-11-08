import * as element from './element.js';
import * as constant from './constat.js'; 
export const updateLocalVideo = (stream)=>{
    const localVideo = document.getElementById('local_video')
    localVideo.srcObject = stream;

    localVideo.addEventListener('loadedmetadata',()=>{
        localVideo.play();
    })
}

export const showIncomingCallDialog = (callerInfo,acceptCallHandler,rejectCallHandler)=>{
    const dialogContainer = document.getElementById('dialogContanier');
    const chatPage = document.getElementById('chatPageScreen');
    chatPage.classList.add('opacity-0');
    const incomingDialogContainer = element.getIncomingCallDialog(callerInfo,acceptCallHandler,rejectCallHandler);
    dialogContainer.style.display='block';
    dialogContainer.appendChild(incomingDialogContainer);
}

export const updateRemoteVideo = (stream)=>{
  const remoteVideo = document.getElementById("calleeVideo");
  remoteVideo.srcObject = stream;
}

export const showCallElements = (callType)=>{
  if(callType === constant.callType.VIDEO_PERSONAL_CODE){
      showVideoCallElements();
  }
}

const showVideoCallElements =()=>{
   const callButton = document.getElementById("call_buttons");
   callButton.style.display='block';
   console.log("show video Call Elements")
   const callerDialogContainer = document.getElementById('dialogContanier')
   callerDialogContainer.querySelectorAll("*").forEach((dialog)=>dialog.remove())
   /**
    * @important if there is the calldialog coniainer come here and make dispalay none
    */
}
export const showVideoCallElement =()=>{
   const callButton = document.getElementById("call_buttons");
   callButton.style.display='block';
   const callerDialogContainer = document.getElementById('dialogContanier')
   callerDialogContainer.querySelectorAll("*").forEach((dialog)=>dialog.remove())
   /**
    * @important if there is the calldialog coniainer come here and make dispalay none
    */
}

export const showCallingDialog = (calleInfo) =>{
    const dialogContainer = document.getElementById('dialogContanier');
    const chatPage = document.getElementById('chatPageScreen');
    chatPage.classList.add('opacity-0');
    // chatPage.classList.add('invisible');
    const callerInfoDialog = `
         <img src="/image/sofoniyaskediryesuf@gmail.com/1729341092019-420523272-img.jpg" class=" w-20 h-20 rounded-full" />
    <p>${calleInfo}</p>
    <div class="callButtons grid place-items-center">
      <button  class="w-28 cursor-pointer h-16 bg-red-600 rounded" style="display: grid;place-items:center">
        <img src="/image/videocall/acceptCall.png" class="h-12 w-20" alt="" srcset="">
      </button>
    </div>
    `
    dialogContainer.style.display='block';
    dialogContainer.innerHTML =callerInfoDialog;
}

export const removeAllDialogs = ()=>{
  const dialogContanier = document.getElementById('dialogContanier')
  dialogContanier.querySelectorAll("*").forEach((dialog)=>dialog.remove())
  dialogContanier.style.display = 'none';
}

export const showInfoDialog = (preOfferAnswer,calleeInfo)=>{
    const dialogContainer = document.getElementById('dialogContanier');
    const chatPage = document.getElementById('chatPageScreen');
    chatPage.classList.add('opacity-0');
    const callerInfoDialog = `
         <img src="/${calleeInfo.profile_image}" class=" w-20 h-20 rounded-full" />
    <p>${calleeInfo.fullname}</p>
    <div class="callButtons grid place-items-center">
        ${preOfferAnswer}
      <button  class="w-28 cursor-pointer h-16 bg-red-600 rounded" style="display: grid;place-items:center">
         close
      </button>
    </div>
    `
    dialogContainer.style.display='block';
    dialogContainer.innerHTML =callerInfoDialog;

}

const cameraOnImageSrc = "image/videocall/camera.png";
const cameraOffImgSrc = "image/videocall/cameraOff.png";

export const updateCameraButton = (cameraActive)=>{
    const cameraButtonImage = document.getElementById('cameraImage')
    cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImageSrc;
}

const micOnImageSrc = 'image/videocall/mic.png';
const micOffImageSrc = 'image/videocall/micOff.png';
export const updateMicButton = (micActive) =>{
    const micButtonImage = document.getElementById('micImage')
    micButtonImage.src = micActive ? micOffImageSrc:micOnImageSrc;
}