"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express_1.default.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
const httpServer = http_1.default.createServer(app);
const wsServer = new socket_io_1.Server(httpServer);
const publicRooms = function () {
    const { sockets: { adapter: { sids, rooms }, }, } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
};
/**
 * 소케이 연결되면 콜백을 실행합니다
 * onAny는 어떤 이벤트가 감지되면이벤트를 출력합니다.
 * join은 client-side에서 welcome form의 submit 핸들러의
 * 실행을 통해 보내진 room이름을통해 소켓을 room에 참가시키고
 * client에서보낸 showRoom을 통해 유저의 화면을바꿔줍니다.
 */
wsServer.on("connection", (socket) => {
    //@ts-ignore
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        //@ts-ignore
        socket.to(roomName).emit("welcome", socket.nickname);
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            //@ts-ignore
            socket.to(room).emit("bye", socket.nickname);
        });
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        //@ts-ignore
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    /**
     * client-side에서 name form에 submit이벤트가발생되면
     * 실행되는 handlenNicknameSubmit 함수에서
     * nickname emit을 발생시키면
     * 해당 소켓의 닉네임값을바꿔줍니다.
     */
    socket.on("nickname", (nickname, room, done) => {
        //@ts-ignore
        socket.to(room).emit("new_message", `${socket.nickname} changed nickname: ${nickname}`);
        //@ts-ignore
        socket["nickname"] = nickname;
        done();
    });
});
const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
