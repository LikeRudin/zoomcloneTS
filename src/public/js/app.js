"use strict";
const socket = io();
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
/**
 * welcome form에 submit 이벤트가 발생하면
 * 작동하는 함수. back-end에 enter_room이라는 이벤트를 발생시킨다.
 * 그리고 깂괴 콜백함수를 전달한다.
 * 전달된 콜백함수는 신기하게도 백엔드 server.js의 소켓에
 * 두번째 인자 done으로 전달되어
 * 백엔드에서 실행된다.
 * @param event
 */
const handleRoomSubmit = function (event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", { payload: input.value }, () => {
        console.log("server is done!");
    });
    input.value = "";
};
form.addEventListener("submit", handleRoomSubmit);
