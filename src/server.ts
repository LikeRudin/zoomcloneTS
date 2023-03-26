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



wsServer.on("connection", (socket)=>{
    
    /**
     * 입력한 방에 입장합니다.
     */
    socket.on("join_room", (roomName: string) => {
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
    socket.on("answer", (answer, roomName)=>{
        
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
