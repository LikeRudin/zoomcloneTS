"use strict";
// @ts-ignore
const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
room.hidden = true;
let roomName;
/**
 * message form 에입력된 message를
 * 화면에 보여줍니다.
 * @param message :string
 */
const addMessage = function (message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
};
/**
 * message form에 입력된 message를 backend를 통해
 * 현재의 room에 전송합니다.
 * 각각의 소켓들의 브라우저에선 addMessage가
 * 실행되어 메시지가 보여집니다.
 */
const handleMessageSubmit = function (event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    //@ts-ignore
    const value = input.value;
    socket.emit("new_message", value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    //@ts-ignore
    input.value = "";
};
/**
 * name form에 submit이 발생하였을경우 실행됩니다.
 * handleMessageSubmit과 마찬가지로,
 * 백엔드의 socket.to는 자신을 제외한 모두에게 메시지를보내주므로
 * emit의 콜백함수를 통해 자신의 화면에도 닉네임 번경 사실을 공지해줍니다.
 * @param event :submit
 */
const handleNicknameSubmit = function (event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    //@ts-ignore
    const value = input.value;
    socket.emit("nickname", value, roomName, () => {
        addMessage(`you changed nickname: ${value}`);
    });
    //@ts-ignore
    input.value = "";
};
/**
 * welcome 폼을 화면에서 치우고
 * room폼을 보여줍니다.
 * 그리고 입력받은 roomName(이름)을 표시해줍니다.
 * 그 후 room에게 "submit" 이벤트가 발생할경우,
 * handleMessageSubmit을 실행하는 이벤트리스너를 만들어줍니다.
 */
const showRoom = function () {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
    const nameForm = room.querySelector("#name");
    nameForm.addEventListener("submit", handleNicknameSubmit);
};
/**
 * welcomeform의 submit 이벤트 핸들러 입니다.
 * room에 입장시켜 줍니다.
 * back-end에게 "enter_room"이벤트의 발생을 알리며
 * 입력된 값과 함께 showRoom 콜백을 전달합니다.
 *
 * 그리고 입력받은 roomName을 저장하며
 * input에 저장된 값을 초기화시켜줍니다.
 *
 * @param event: "submit"
 */
const handleRoomSubmit = function (event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
};
form.addEventListener("submit", handleRoomSubmit);
/**
 * 다른 유저가 보낸 메시지, 활동내역을 전달 받는 코너입니다.
 * 백엔드에서 welcome이나 bye, new_message
 * 등의 이벤트가 도착했을때, addMessage를 호출합니다.
 *
 */
socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});
socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left..`);
});
socket.on("new_message", addMessage);
/**
 * 룸에 입장하기 전 화면에서
 * 현재개설된 방을확인할 수 있습니다.
 * 인자로 들어오는 rooms는
 * room이름 + 사이즈의 문자열을 성분으로 갖는 배열입니다
 *
 * countEveryRoom()의 반환값입니다.
 */
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    });
});
