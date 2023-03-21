//@ts-ignore
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
/**
 * 이런 오브젝트는 당최 어떻게 처리해야할지 모르겠다.
 * myStream은 어떻게 타입처리를 해줘야지?
 */
let myStream: any;
let muted = false;
let cameraOff = false;


const getCameras = async function () {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            camerasSelect!.appendChild(option);
        });
    } catch (e){
        console.log(e);
    }
}


const getMedia = async function () {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        //@ts-ignore
        myFace.srcObject = myStream;
    } catch (e) {
        console.log(e);
    }
}


getMedia();


const handleMuteClick = function() {
    myStream.getAudioTracks().forEach((track: any) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn!.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn!.innerText = "Mute";
        muted = false;
    }
}


const handleCameraClick = function () {
    myStream.getVideoTracks().forEach((track: any) => (track.enabled = !track.enabled));
    if (cameraOff) {
        cameraBtn!.innerText = "Turn camera Off";
        cameraOff = false;
    } else {
        cameraBtn!.innerText = "Turn camera on";
        cameraOff = true;

    }
}

muteBtn!.addEventListener("click", handleMuteClick);
cameraBtn!.addEventListener("click", handleCameraClick);





