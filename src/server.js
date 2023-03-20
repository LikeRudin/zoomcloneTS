"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const admin_ui_1 = require("@socket.io/admin-ui");
const app = (0, express_1.default)();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express_1.default.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
const httpServer = http_1.default.createServer(app);
const wsServer = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
(0, admin_ui_1.instrument)(wsServer, {
    auth: false,
});
const publicRooms = function () {
    const { sockets: { adapter: { sids, rooms }, }, } = wsServer;
    const publicRooms = [];
    /**
     * rooms에는 각 socket의 id와 동일한 이름의
     * 개인방이 저장되어있습니다.
     * 만일 rooms의 방이름을 가져와서
     * socket의 id와 일치하는지 확인합니다.
     * 만약 그런게 없다면 그건 public room 입니다.
     */
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
};
/**
 * adapter의 rooms 내부에 room 이름으로 접근하여
 * 저장되어있는 socket id 의개수를 반환합니다.
 * @param roomName
 * @returns number: 방에 참여한 소켓의 개수
 */
const getRoomsMap = function () {
    return wsServer.sockets.adapter.rooms;
};
const countRoom = function (roomName) {
    var _a;
    const rooms = getRoomsMap();
    return (_a = rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.size;
};
const countEveryRoom = function () {
    const roomList = publicRooms();
    const roomsCount = [];
    roomList.forEach((room) => {
        const tuple = `${room} (${countRoom(room)})`;
        roomsCount.push(tuple);
    });
    return roomsCount;
};
/**
 * 소켓이 연결되면 "connection"이벤트가 감지되어
 * 콜백이실행됩니다.
 * front로부터 done을 전달받는 on이벤트리스너들은
 * 대부분 to를 사용하여 모든 대상에게 이벤트를 발생시킵니다.
 * to의 수신인은  발신인 본인을 제외한 사람들이므로
 * 발생한 이벤트의 결과를 done을 통해 발신인도 경험하게 됩니다.
 */
wsServer.on("connection", (socket) => {
    /**
     * 브라우저를 열자마자 방 리스트를 볼 수 있게 해줍니다.
     */
    socket.emit("room_change", countEveryRoom());
    //@ts-ignore
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        /**
         * 모든사람들에게 room을 공지합니다.
         */
        //@ts-ignore
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", countEveryRoom());
        console.log(wsServer.sockets.adapter.rooms);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            //@ts-ignore
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        });
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", countEveryRoom());
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
