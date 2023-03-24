

import http from "http";
import express from "express";
import { Server}  from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res)=> res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const msglog = [];


const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});

instrument(wsServer, {
    auth: false,
});


const publicRooms = function() {
    const {
        sockets: {
            adapter: { sids, rooms},
        },
    } = wsServer;
    const publicRooms: string[] = [];
    /**
     * rooms에는 각 socket의 id와 동일한 이름의
     * 개인방이 저장되어있습니다.
     * 만일 rooms의 방이름을 가져와서
     * socket의 id와 일치하는지 확인합니다.
     * 만약 그런게 없다면 그건 public room 입니다.
     */
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}


/**
 * adapter의 rooms 내부에 room 이름으로 접근하여
 * 저장되어있는 socket id 의개수를 반환합니다.
 * @param roomName 
 * @returns number: 방에 참여한 소켓의 개수
 */

const getRoomsMap = function (){
    return wsServer.sockets.adapter.rooms
}
const countRoom = function (roomName: string) {
    const rooms = getRoomsMap();
    return rooms.get(roomName)?.size
}
const countEveryRoom = function (){
    const roomList = publicRooms();
    const roomsCount: string[]= [];
    roomList.forEach((room) =>{
        const tuple =`${room} (${countRoom(room)})`;
        roomsCount.push(tuple);
    })
    return roomsCount;
    
}



/**
 * custom part
 */


const food = ["🍕", "🌭", "🥓", "🧇", "🍞", "🥯","🥗",
    "🌮", "🍖", "🍠", "🥡", "🍙", "🍚", "🍱", "🥟",
    "🍗", "🌯","🥙", "🥚", "🍿", "🍔", "🥚", "🍟", "🧂",
    "🍳", "🧈", "🥨", "🧀", "🥪", "🥫", "🥩","🥠","🍘",
    "🍛", "🥐", "🥖"
  ];
  const lenFood = food.length;
  const getRandomFood = function () {
    const menu_index = Math.floor(Math.random() * lenFood);
    return food[menu_index];
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
    socket["nickname"] = "Anonymous" + getRandomFood();
    socket.onAny((event: Event) => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on("enter_room", (roomName, done) =>{
        socket.join(roomName);
        //@ts-ignore
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
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
        socket.rooms.forEach((room)  => {
            //@ts-ignore
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        });
    });
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", countEveryRoom());
    })
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
        socket["nickname"] = nickname +  getRandomFood();
        done();
        
    });

    socket.on("game_start",(message, room, done) => {
        //@ts-ignore
        socket.to(room).emit("new_message", `poor ${socket.nickname} started play alone 😥.`);
        //@ts-ignore
        socket.emit("new_message", `poor ${socket.nickname} started play alone 😥.`);
        socket.emit("game_start", message)
        done();
    });

    /**
     * 혼자한 게임의 결과가
     * 방에 공지됩니다.
     */

    socket.on("end_game", (message, room)=>{
        //@ts-ignore
        socket.to(room).emit("new_message", `${socket.nickname} ${message} the round`);
        //@ts-ignore
        socket.emit("new_message", `${socket.nickname} ${message} the round`);
    })

    socket.on("chat_full", (room ,message) =>{
        msglog.push(`${room}: ${message}`)
    });

});




const handleListen = () => console.log("Listening on http://localhost:3000");

httpServer.listen(3000, handleListen);