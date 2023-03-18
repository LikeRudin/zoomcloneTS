"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const app = (0, express_1.default)();
//express setting parts.
/***
 *
 * set
 * 1. view engine 옵션을 pug로 설정한다.
 * 2. views 옵션을 __dirname + /src/views 로 설정한다.
 *
 * use
 * 1. client가 /public 으로 시작하는 요청을 보냈을때, express.static(미들웨어)
 * 정적이미지를 다루는 함수를 통해 __dirname +"/public" 경로 내의 정적 파일을 전달한다.
 *
 * get
 * 1. client 가 "/" 에 해당하는 get 요청을 보내면 "home"의 이름을 가진
 * 파일을 랜더링해주어서 웹페이지에보여준다.
 *
 * 2. "/*" *: asterisk 는 모든것을 의미한다. 유저가 "/"로 시작하는
 * get 요청을 보내면 전부 "/"로 보내준다. 즉 "home" 이 랜더된 페이지로 이동한다.
 *
 */
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express_1.default.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
/**
 * 새로운 웹소켓 서버를 만들때,
 * 여러가지 방법중 nicolas는  External HTTP/S server
 * 방식으로 웹소컷 서버를 만들라고 하였다.
 *
 * https://www.npmjs.com/package/ws 페이지에서
 * Usage examples 항목의
 * External HTTP/S server파트를 보면
 *  new webSocket.Server()의 인자는
 * http 서버 인스턴스를 넣어주어야한다.
 *
 * server: httpServer 가 그것이다.
 *
 *
 */
const httpServer = http_1.default.createServer(app);
const wsServer = new ws_1.default.Server({ server: httpServer });
const serverStart = new Date();
let socketCode = 0;
const socketsObj = {};
/**
 * ws 의 backend에서 사용되는 event
 * open
 */
/**
 * wsServer.on
 * event Listener의 일종으로,
 * "connection" 이벤트를 감지하면 콜백함수를 실행시킨다.
 *
 *
 */
wsServer.on("connection", (socket) => {
    socket["nickname"] = "someone";
    socket["key"] = socketCode.toString();
    socketCode += 1;
    socketsObj[socket.key] = socket;
    socket.on("open", () => {
        Object.values(socketsObj).forEach((user) => { user.send(`${socket.nickname} joined this chat!`); });
    });
    socket.on("close", () => {
        delete socketsObj[socket.key];
        const userList = [];
        Object.values(socketsObj).forEach((user) => userList.push(user.nickname));
        const remained = userList.toString();
        Object.values(socketsObj).forEach((user) => user.send(`${socket.nickname} gone gentle 
        \n ${remained} are still in this chat`));
        console.log(socket.nickname + " has disconnected \n" + remained + "are in this chat");
    });
    socket.on("message", (message) => {
        const MSG = JSON.parse(message);
        switch (MSG.type) {
            case "chat":
                Object.values(socketsObj).forEach((user) => {
                    user.send(`${socket.nickname}: ${MSG.payload}`);
                });
                break;
            case "nickname":
                Object.values(socketsObj).forEach((user) => {
                    user.send(`${socket.nickname} has changed nickname to ${MSG.payload}`);
                });
                socket["nickname"] = MSG.payload;
                break;
        }
    });
});
/**
 * listen 메서드는 대단히 중요하다.
 *
 * 직접적으로 서버를 시작시키는 메서드이다.
 * listen 메서드의 인자는 포트번호, 콜백함수 로 이루어져있는데
 * 해당 포트번호를통한 응답이 준비되었을경우 콜백함수를 호출하여 서버가 준비되었음을 알린다.
 *
 * 사실 콜백함수의 메타적 기능은 중요하나
 * 실제기능은 중요하지 않다. 그저 개발자에게 서버가 시작되었다는것을 알릴수 있기만하면된다.
 */
const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);
