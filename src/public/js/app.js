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
/**
 * 이런 오브젝트는 당최 어떻게 처리해야할지 모르겠다.
 * myStream은 어떻게 타입처리를 해줘야지?
 */
let myStream;
let muted = false;
let cameraOff = false;
const getCameras = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((device) => device.kind === "videoinput");
            cameras.forEach((camera) => {
                const option = document.createElement("option");
                option.value = camera.deviceId;
                option.innerText = camera.label;
                camerasSelect.appendChild(option);
            });
        }
        catch (e) {
            console.log(e);
        }
    });
};
const getMedia = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            myStream = yield navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            //@ts-ignore
            myFace.srcObject = myStream;
        }
        catch (e) {
            console.log(e);
        }
    });
};
getMedia();
const handleMuteClick = function () {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    }
    else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
};
const handleCameraClick = function () {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
        cameraBtn.innerText = "Turn camera Off";
        cameraOff = false;
    }
    else {
        cameraBtn.innerText = "Turn camera on";
        cameraOff = true;
    }
};
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
