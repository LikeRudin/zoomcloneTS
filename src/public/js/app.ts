const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector("ul");
const chatForm = document.getElementById("chat");
const welcomeForm = document.getElementById("welcome");
const nickForm = document.getElementById("nick");

welcomeForm!.style.display="none";

function padMSG(type: string, payload: string) {
    const msg = {type, payload};
    return JSON.stringify(msg);
}
/*** 
 * 
 * order of process 
 * 
 * 1. handleChatSubmit, handleNickSubmit
 * socket.send
 * 
 * 2. socket's eventListener listen "message"
 * 
 * 3. create messagelist
 * 
 * 
*/

socket.addEventListener("open", ()=>{
    console.log("successfully connected to server❤")
})
/**
 * 
 * message 는 오브젝트이다
 * message.data로 안에있는 내용을 읽어온다
 * 
 */
socket.addEventListener("message", (message: any)=>{

    const li = document.createElement("li");
    li.innerText = message.data;
    messageList!.append(li);
    
})


function handleChatSubmit(event: Event) {
    event.preventDefault();
    const input = chatForm!.querySelector("input");
    socket.send(padMSG("chat", input!.value));
    input!.value = "";
    
}

chatForm!.addEventListener("submit", handleChatSubmit);


function handleNickSubmit(event: Event) {
    event.preventDefault();
    const input = nickForm!.querySelector("input");
    socket.send(padMSG("nickname", input!.value));
    input!.value = "";
}

nickForm!.addEventListener("submit", handleNickSubmit);