import * as element from './element.js'
const socket = io();
const chatBar = document.getElementById("chatTextBar");
chatBar.addEventListener("keypress",function(event){
    if(event.key === "Enter"){
        const senderEmail = event.target.getAttribute('userId');
        const reciverEmail = event.target.getAttribute('userToSent');
        const message = event.target.value;
        event.target.value='';
        const dataToSend = {
            senderEmail,
            reciverEmail,
            message
        }

        socket.emit('chatSend',dataToSend);
    }
})

socket.on('sendeChat',(data)=>{
    element.outGoingMessage(data);
    console.log(data,'from sendChat soket');
})


