export const getIncomingCallDialog = (callerInfo,acceptCallHandler,rejectCallHandler)=>{
console.log("getting incoming call dialog")

    // Parent container
const container = document.createElement("div");

// Profile image
const profileImage = document.createElement("img");
profileImage.src = callerInfo.profile_image;
profileImage.classList.add("w-20", "h-20", "rounded-full");

// Username
const username = document.createElement("p");
username.textContent = callerInfo.username;

// Call buttons container
const callButtons = document.createElement("div");
callButtons.classList.add("callButtons", "flex", "justify-between");

// Accept video call button
const acceptVideoCallButton = document.createElement("button");
// acceptVideoCallButton.id = "acceptVideoCall";
acceptVideoCallButton.classList.add("w-28", "cursor-pointer", "h-16", "bg-green-500", "rounded");
acceptVideoCallButton.style.display = "grid";
acceptVideoCallButton.style.placeItems = "center";
acceptVideoCallButton.style.zIndex = "100";

// Accept video call icon
const acceptIcon = document.createElement("img");
acceptIcon.src = "/image/videocall/acceptCall.png";
acceptIcon.classList.add("h-12", "w-20");
acceptVideoCallButton.appendChild(acceptIcon);

// Reject video call button
const rejectVideoCallButton = document.createElement("button");
// rejectVideoCallButton.id = "acceptVideoCall";
rejectVideoCallButton.classList.add("w-28", "cursor-pointer", "h-16", "bg-red-600", "rounded");
rejectVideoCallButton.style.display = "grid";
rejectVideoCallButton.style.placeItems = "center";
rejectVideoCallButton.style.zIndex = "100";

// Reject video call icon
const rejectIcon = document.createElement("img");
rejectIcon.src = "/image/videocall/rejectCall.png";
rejectIcon.classList.add("h-12", "w-20");
rejectVideoCallButton.appendChild(rejectIcon);

// Append buttons to callButtons container
callButtons.appendChild(acceptVideoCallButton);
callButtons.appendChild(rejectVideoCallButton);

// Append elements to container
container.appendChild(profileImage);
container.appendChild(username);
container.appendChild(callButtons);

//if the user accept the call start to excute the acceptCallHandler found in webRTC.js
acceptVideoCallButton.addEventListener("click",()=>{
    acceptCallHandler();
})

rejectVideoCallButton.addEventListener("click",()=>{
    rejectCallHandler();
})
const centerTag = document.getElementById("center");
centerTag.style.display='block';
return container;
    // const dialogHTML = document.getElementById("dialog");
    // dialogHTML.appendChild(dialog);
}

export const outGoingMessage = (data)=>{
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("flex", "justify-end");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("bg-blue-600", "p-3", "rounded-lg", "max-w-xs");

    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = data.message

    messageDiv.appendChild(messageParagraph);
    containerDiv.appendChild(messageDiv);

    const timestampParagraph = document.createElement("p");
    timestampParagraph.classList.add("text-sm", "text-gray-500", "text-right");
    timestampParagraph.textContent = "Oct 24, 2024 12:13 PM";

    const messagePart = document.getElementById('messagePart');
    messagePart.appendChild(containerDiv);
    messagePart.appendChild(timestampParagraph);
    messagePart.scrollTop = messagePart.scrollHeight
}

export const inGoingMessage = (data)=>{
    const outerDiv = document.createElement("div");
    outerDiv.classList.add("flex", "items-start", "space-x-2");

    const avatarImg = document.createElement("img");
    avatarImg.classList.add("w-8", "h-8", "bg-gray-400", "rounded-full");
    avatarImg.src=data.senderImage;

    const messageContainerDiv = document.createElement("div");
    messageContainerDiv.classList.add("bg-gray-700", "p-3", "rounded-lg", "max-w-xs");

    const messageText = document.createElement("p");
    messageText.textContent = data.message;

    messageContainerDiv.appendChild(messageText);
    outerDiv.appendChild(avatarImg);
    outerDiv.appendChild(messageContainerDiv);

    const timestamp = document.createElement("p");
    timestamp.classList.add("text-sm", "text-gray-500", "ml-10");
    timestamp.textContent = "Oct 24, 2024 9:53 AM";

    const messagePart = document.getElementById('messagePart');
    messagePart.appendChild(outerDiv);
    messagePart.appendChild(timestamp);
    messagePart.scrollTop = messagePart.scrollHeight
}