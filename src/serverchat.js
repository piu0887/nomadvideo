import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io"
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));


const handleListen = () => console.log(`Listening on http://localhost:3000`);

//http 서버 생성
const httpServer = http.createServer(app);
// http 서버위에 Socket IO 서버생성 
const io = SocketIO(httpServer);

function publicRooms() {
    const {
      sockets: {
        adapter: { sids, rooms },
      },
    } = io;
    const publicRooms = [];
    rooms.forEach((_, key) => {
      if (sids.get(key) === undefined) {
        publicRooms.push(key);
      }
    });
    return publicRooms;
  }

io.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
      });
    socket.on("enter_room", (roomName, done) => {
        // 방생성
        socket.join(roomName);
        done();
        // 방 입장시 모든사람에게 메세지
        socket.to(roomName).emit("welcome", socket.nickname);
        io.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
        socket.to(room).emit("bye", socket.nickname)
      );    
    });
    socket.on("disconnect", () => {
        io.sockets.emit("room_change", publicRooms());
      });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});
httpServer.listen(3000, handleListen);
// const sockets = [];

// const wss = new WebSocket.Server({server});
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser ✅");
//     socket.on("close", onSocketClose);
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch (message.type) {
//           case "new_message":
//             sockets.forEach((aSocket) =>
//               aSocket.send(`${socket.nickname}: ${message.payload}`)
//             );
//           case "nickname":
//             socket["nickname"] = message.payload;
//         }
//         });
//     });
