import http from "http";
import express from "express";
import { Server}  from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res)=> res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));




const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

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
    socket.onAny((event: Event) => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on("enter_room", (roomName, done) =>{
        socket.join(roomName);
        done();
        //@ts-ignore
        socket.to(roomName).emit("welcome", socket.nickname);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room)  => {
            //@ts-ignore
            socket.to(room).emit("bye", socket.nickname)});
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
    socket.on("nickname", (nickname, room, done)=>{
        //@ts-ignore
        socket.to(room).emit("new_message", `${socket.nickname} changed nickname: ${nickname}` )
        //@ts-ignore
        socket["nickname"] = nickname;
        done();
    })

});




const handleListen = () => console.log("Listening on http://localhost:3000");

httpServer.listen(3000, handleListen);

