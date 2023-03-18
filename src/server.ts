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
 * socket.io 의 특징을 배울수 있다.
 * done는 client-side의 함수를 받아와서 실행하는것이다.
 * 
 * 받아오는 함수는 다음과 같다.
 *  () =>{
        console.log("server is done!");
    });
    실행은백엔드가 시키지만, 브라우저의 콘솔창에 출력된다.
    즉 msg,done 에서 console.log(msg)는 vscode 터미널에
    done()의 실행결과인 console.log("server is done!")은 브라우저 콘솔에출력된다.
 */
wsServer.on("connection", (socket) => {
    socket.on("enter_room", (msg, done) =>{
        console.log(msg);
        setTimeout(()=>{
            done();
        } ,10000);
    });
});




const handleListen = () => console.log("Listening on http://localhost:3000");

httpServer.listen(3000, handleListen);

