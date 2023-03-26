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
wsServer.on("connection", (socket) => {
    /**
     * 입력한 방에 입장합니다.
     */
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    /**
     *
     * offer 발송합니다.
     */
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    /**
     * answer를 발송합니다.
     */
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    /**
     * icecandidate를 발송합니다.
     */
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});
const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
