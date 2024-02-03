// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload){
//   // object 를 string 으로 만든다.
//   const msg = {type, payload};
//   return JSON.stringify(msg);
// }

// function handleOpen() {
//     console.log("Connected to Server ✅");
//   }
//   socket.addEventListener("open", handleOpen);

//   socket.addEventListener("message", async (message) => {
//     const li = document.createElement("li");
//     // Blob 데이터를 문자열로 변환
//     if (message.data instanceof Blob) {
//         const text = await message.data.text();
//         li.innerText = text;
//     } else {
//         // 데이터가 Blob이 아니라면, 직접 할당
//         li.innerText = message.data;
//     }
//     messageList.append(li);
// });

//   socket.addEventListener("close", () => {
//     console.log("Disconnected from Server ❌");
//   });

//   function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message", input.value));
//     input.value = "";
//   }

//   function handleNickSubmit(event){
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname", input.value));
//     input.value = "";
//   }
  
//   messageForm.addEventListener("submit", handleSubmit);
//   nickForm.addEventListener("submit", handleNickSubmit);

const socket= io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");


room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event){
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value= ""
}

form.addEventListener("submit", handleRoomSubmit); 


socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

socket.on("room_change", console.log);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  if(rooms.length === 0){
    roomList.innerHTML = "";
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});