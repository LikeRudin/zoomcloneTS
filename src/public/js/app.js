"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//@ts-ignore
const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const chat = document.getElementById("chat");
const chatLog = chat.querySelector("#chatlog");
const chatForm = chat.querySelector("#msg");
const msgBtn = chatForm === null || chatForm === void 0 ? void 0 : chatForm.querySelector("button");
const call = document.getElementById("call");
chatForm === null || chatForm === void 0 ? void 0 : chatForm.classList.add("hidden");
call.hidden = true;
/**
 * 이런 오브젝트는 당최 어떻게 처리해야할지 모르겠다.
 * myStream은 어떻게 타입처리를 해줘야지?
 */
let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;
/**
 * 카메라의 정보를
 * select태그에 저장합니다.
 */
const getCameras = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield navigator.mediaDevices.enumerateDevices(); // device리스트
            const cameras = devices.filter((device) => device.kind === "videoinput"); //카메라 추출
            const currentCamera = myStream.getVideoTracks()[0];
            cameras.forEach((camera) => {
                const option = document.createElement("option");
                option.value = camera.deviceId;
                option.innerText = camera.label;
                if (currentCamera.label === camera.label) {
                    option.selected = true;
                }
                camerasSelect.appendChild(option);
            });
        }
        catch (e) {
            console.log(e);
        }
    });
};
/**
 * 미디어 스트림을 가져옵니다.
 */
const getMedia = function (deviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        const initialConstraints = {
            audio: true,
            video: { facingMode: "user" },
        }; // getUserMedia의 인자 (제약조건)
        const cameraConstraints = {
            audio: true,
            video: { diviceId: { exact: deviceId } },
        };
        try {
            myStream = yield navigator.mediaDevices.getUserMedia(
            //@ts-ignore
            deviceId ? cameraConstraints : initialConstraints);
            //@ts-ignore
            myFace.srcObject = myStream; //<video>에 입력 
            if (!deviceId) { //옵션 증식
                yield getCameras();
            }
        }
        catch (e) {
            console.log(e);
            //NotAllowedError
            //NotFoundError 다루기
        }
    });
};
/**Mute
 * 소리 on/off버튼의 핸들러입니다.
 */
const handleMuteClick = function () {
    myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
    });
    if (!muted) { //소리버튼 텍스트 번경
        muteBtn.innerText = "Unmute";
        muted = true;
    }
    else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
};
/**
 * 카메라버튼의 핸들러입니다.
 */
const handleCameraClick = function () {
    myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
    }); //카메라 on, off
    if (cameraOff) { //카메라 버튼 텍스트 번경
        cameraBtn.innerText = "Turn camera Off";
        cameraOff = false;
    }
    else {
        cameraBtn.innerText = "Turn camera on";
        cameraOff = true;
    }
};
/**
 * 선택된 옵션에 따라
 * 전송할 영상을 설정합니다.
 */
const handleCameraChange = function () {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        yield getMedia(camerasSelect.value); // 옵션에 저장된 deviceId를가져옵니다.
        if (myPeerConnection) { //현재 연결이 있는경우 카메라를 번경
            const videoTrack = myStream.getVideoTracks()[0];
            const videoSender = myPeerConnection.getSenders().find((sender) => {
                sender.track.kind === "video";
                videoSender.replaceTrack(videoTrack); //sender의 video track을 교체
            });
        }
    });
};
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
//Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
/**
 * welcome: 대문을 숨기고
 * call: 비디오 태그를 보여줍니다.
 */
const initCall = function () {
    return __awaiter(this, void 0, void 0, function* () {
        welcome.hidden = true;
        call.hidden = false;
        call === null || call === void 0 ? void 0 : call.classList.add("inroom");
        yield getMedia();
        makeConnection();
    });
};
/**
 * 입력받은 방에 입장합니다.
 *
 * @param event
 */
const handleWelcomeSubmit = function (event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const input = welcomeForm.querySelector("input");
        roomName = input.value;
        yield initCall();
        socket.emit("join_room", roomName);
        input.value = "";
    });
};
welcomeForm.addEventListener("submit", handleWelcomeSubmit);
/**
 * 새로 들어온 client의 신호를 받으면
 *  message를 받는 data채널을 만들고 offer를 보냅니다.
 */
socket.on("welcome", () => __awaiter(void 0, void 0, void 0, function* () {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => {
        console.log("data channel message is arrived");
        //@ts-ignore
        paintMessage("stranger:  ", event.data);
    });
    const offer = yield myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
    chatForm.className = "";
    chatLog.className = "chatclass";
}));
/**
 * 신규 client는 먼저 있던 사람들의 offer를 받아서
 * myPeerConneection에 저장합니다.
 */
socket.on("offer", (offer) => __awaiter(void 0, void 0, void 0, function* () {
    myPeerConnection.addEventListener("datachannel", (event) => {
        //@ts-ignore
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) => {
            //@ts-ignore
        });
    });
    console.log("received the offer", offer);
    myPeerConnection.setRemoteDescription(offer); //offer를 받아야 answer를 실행하죠.
    const answer = yield myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
    chatForm.className = "";
    chatLog.className = "chatclass";
}));
/**
 * 뉴비에계서받은 answer를 받아서
 * mePeerConnection에 저장합니다.
 */
socket.on("answer", (answer) => {
    console.log("received answer");
    myPeerConnection.setRemoteDescription(answer);
});
/**
 * ice candidate를 받아서
 * myPeerConnection에 저장합니다.
 */
socket.on("ice", (ice) => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});
// RTC Code
/**
 * 내 stream (video + audio)를 저장한
 * 새로운 RTCP2P 연결 관리 오브젝트를 만듭니다.
 *
 */
const makeConnection = function () {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, myStream);
    });
};
const handleIce = function (data) {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
};
const handleAddStream = function (data) {
    const peerFace = document.getElementById("peerFace");
    //@ts-ignore
    peerFace.srcObject = data.stream;
};
const paintMessage = function (name, msg) {
    const li = document.createElement("li");
    li.innerHTML = `${name} :  ${msg}`;
    chatLog === null || chatLog === void 0 ? void 0 : chatLog.appendChild(li);
};
const handlemsgBtn = function (event) {
    event.preventDefault();
    const input = chatForm.querySelector("input");
    //@ts-ignore
    const message = input.value;
    //@ts-ignore
    myDataChannel.send(message);
    //@ts-ignore
    input.value = "";
    paintMessage("you: ", message);
};
chatForm.addEventListener("submit", handlemsgBtn);
