const socket = io();

//geting serch bar and return to side bar javascript

const serchBar = document.getElementById("sercgBar");


const emailSent = {
  useremail:document.getElementById("emailForEmitt").innerHTML
}

console.log(emailSent);

socket.emit('emailSoketId',emailSent);

//define get serch bar 
function getSerchBar(){
  serchBar.style.left='0px';
  giphy.style.display='none'
  sercInput.value=''
}

function getSideBars(){
  serchBar.style.left = "-678px";
}

//serch engeine bulding
const giphy = document.getElementById('giphyimage');
const sercInput = document.getElementById('serchInput');
const serchResultContainer = document.getElementById('serchResultContainer');
sercInput.addEventListener('keypress',function(event){
      giphy.style.display='block';
      let userquary=event.target.value+event.key;
      const dataSend = {
        userquary:userquary,
        whoSerch:event.target.getAttribute('whoSerch')
      }
      socket.emit('serchEngien',dataSend);
})

//handling serch result

socket.on("sendSerchResult",(data)=>{
  const innerHtml = data.innerhtml;
  giphy.style.display='none';
  if(innerHtml === ''){
    serchResultContainer.innerHTML ="There is no result for the given query 😴";
  }else{
    serchResultContainer.innerHTML=innerHtml;
  }
})

//geting clicked user page from the serch bar

async function getPage(event){
  const wentedUser = event.target.getAttribute('useremail');
  window.location = `http://localhost:3000/othersProfile/${wentedUser}`;
}

//end of serch engine
function handleClick(event){
  let id = event.target.getAttribute('userId');
  fetchUserData(id);
}

// document.addEventListener('contextmenu', (e) => {
//   e.preventDefault();
// })

const closeCommentContainer = document.getElementById("closeCommentContainer");
const commentContainer = document.getElementById("commentContainer");
const commentImage = document.getElementById("commentImage");
const commentVideo = document.getElementById("commentVideo");
const postersProfile  =document.getElementById('postersProfileId');
const posterName = document.getElementById('posterName');
const posterBio = document.getElementById('posterBio');
const commentSession = document.getElementById('commentSession');
//changing the poster profile
function changePostProfile(profilePictur,name,bio){
    postersProfile.setAttribute('src',profilePictur);
    posterName.innerHTML = name;
    posterBio.innerHTML = bio;
}

//add comments to the comment session 

function addCommentSession(data){
  //console.log(data,'from add comment function')
    if(data==''){
      commentSession.innerHTML = 'There is no Comment Yet 🤪';
    }else{
      //commentItration(data);
      commentSession.innerHTML=data;
      
    }
}

//itrate throu the comment that comes from the server to creat html stracture;


let poId;//general variabel to get the post id
function commentButton(event){
    let src = event.target.getAttribute('src');
    let fileType = event.target.getAttribute('type');
    let postId = poId =event.target.getAttribute('idforpost');
    const profile = event.target.getAttribute('profil');
    const name = event.target.getAttribute('name');
    const bio = event.target.getAttribute('bio');
    

    const dataToSend = {
      Id:postId
    }
    
    socket.emit('getComment',dataToSend);

    changePostProfile(profile,name,bio);

    if(fileType == 'image'){
      commentImage.setAttribute("src",src);
      commentImage.style.display="block";
      commentVideo.style.display="none";
    }else{
        commentVideo.setAttribute("src",src);
        commentImage.style.display="none";
        commentVideo.style.display="block"
    }
    commentContainer.style.display = "block";
}

socket.on('sendBackComment',(data)=>{
  const JSObject = JSON.parse(data);
  const array = JSObject.commenst;
  addCommentSession(array);
})

//post comment button;
const postComment = document.getElementById("postComment");
postComment.addEventListener('keypress',function(event){
  if(event.key === 'Enter'){
      event.preventDefault();

      const username = event.target.getAttribute('commenterusername');
      const sendData = {
        comment:event.target.value,
        username:event.target.getAttribute('commenterusername'),
        postId:poId
      }
      event.target.value = ""
     
      //console.log(sendData)
      socket.emit('postComment',sendData);
  }
})

closeCommentContainer.addEventListener("click",()=>{
    commentContainer.style.display = "none";
    commentSession.innerHTML='';
    postComment.style.display = 'block';
    replayComment.style.display='none'
})

//replay comment session;
const replayComment = document.getElementById('replayComment');

//handling the current replayed commet that come from the server;

socket.on("sendBackCurrentReplay",(data)=>{
  console.log(data.commentid)
  const replayInnerHtml = `
  <div  class="replaySession flex item-center mt-4 ml-3 mb-4">
        <div style="height: 50px;width:50px">
            <img style="height: 50px;width:50px" class="rounded-full" src="/${data.profile_image}" alt="profile">
        </div>
        <div class="ml-3 " style="width:75%" >
            <p class="text-white font-normal text-sm "><span style="color:rgb(224,241,255)">${data.fullname}</span>  ${data.replay} </p>
            <div class="flex justify-between mt-2" style="width: 100px">
                <span class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">1d</span>
                <span onclick="Replay(event)" username="${data.username}" commentid="${data.commentid}" name="${data.fullname}" class="text-gray-400 cursor-pointer font-sans font-semibold text-sm">Replay</span>

            </div>
        </div>
    </div>
  `
  document.getElementById(data.commentid).innerHTML=replayInnerHtml;
})

//get all replay by commentID

socket.on('emitingAllReplay',(data)=>{
  const commentID = data.commentid;
  const innerHtml = data.innerHtml;
  if(innerHtml == ''){
    document.getElementById(commentID).innerHTML = 'There is no any replay to this comment🥴';
  }else{
    document.getElementById(commentID).innerHTML = innerHtml;
  }
  postComment.style.display = 'block';
  replayComment.style.display='none'
})

//getting the whole replay that is given by the comment id;
function seeReplay(event){
  const commentid = event.target.getAttribute("commentid");
  const dataSend = {
    commentid:commentid
  }

  socket.emit("getAllReplay",dataSend);
}


//posting replay comment section
replayComment.addEventListener('keypress',function(event){
  if(event.key === "Enter"){
    const username = event.target.getAttribute('commenterusername');
    const dataToSend = {
      commentid:commentId,
      username:commenterUserName,
      userreplay:username,
      replay:event.target.value
    }
    event.target.value = "";
    postComment.style.display = 'block';
    replayComment.style.display='none'
    socket.emit('replayComment',dataToSend);
  }
})


//geting the replay input
let commenterUserName,commentId,commenterFullname;
function Replay(event){
  commenterUserName = event.target.getAttribute('username');
  commentId = event.target.getAttribute('commentid');
  commenterFullname = event.target.getAttribute('name');
  postComment.style.display='none';
  replayComment.value = `${commenterFullname}  `;
  replayComment.style.display='block';

}

function follow(event){
  event.target.innerHTML = 'following...';
  event.target.style.color = 'white';
  event.target.disabled = true;
  let userEmail = event.target.getAttribute('userId');
  let followEmail = event.target.getAttribute('followId');
  
  const formData = new FormData();
  formData.append('userEmail',userEmail); // Append the file
  formData.append('followEmail',followEmail);
  
  fetch('/follows', {
      method: 'POST',
      body: formData,
  })
  .then()
  .catch(error => {
      console.error('Error:', error);
  });
  /**
   * @important as you see in below i use some code that is only work in localhost 
   * you can improve it withe server side code for deploy or test as LAN if we test using
   * LAN we must improve the host localhost with our local IP address
   */
  setInterval(()=>{
    window.location = 'http://localhost:3000/home';
  },2000)
  
}

async function fetchUserData(userId) {
  try {
      console.log(userId);
      const response = await fetch(`http://localhost:3000/profile/${userId}`);
      window.location = `http://localhost:3000/profile/${userId}`
      //const data = await response.json();
      //console.log(data);
      //alert(data.message); // Display the fetched user data
  } catch (error) {
      console.error('Error fetching user data:', error);
  }
}

const videos = document.querySelectorAll('video');
videos.forEach((video)=>{
video.addEventListener(('click'),()=>{
  if(video.paused){
    video.play();
  }else if(video.play()){
    video.pause();
  };
})
})

