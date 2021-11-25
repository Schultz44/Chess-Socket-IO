const os = require("os");
const networkInterfaces = os.networkInterfaces();
const arr = networkInterfaces["Wi-Fi"];
// const ip = arr[1].address

const app = require("express")();
// const http = require('http').createServer(app);
const httpServer = require("http").createServer();
const path = require("path");
const { Socket } = require("socket.io");
// cors (Cross-Origin Resource Sharing) allows for other origins to read the information
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

//handlers
const lobbyHandler = require("./lobby-handler");

httpServer.listen(3000, () => {
  console.log("listening on *:3000");
  // console.log(arr);
  console.log("____________________________________________________");
});
// const { Server } = require('socket.io');
// const io = new Server;

// let io = require('socket.io')(http);
app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, '../test-server', './index.html'));
  res.sendFile("index.html", { root: path.join(__dirname, "../test-server") });
  // res.send('<h1>Hey Socket.io</h1>');
  // res.json({
  //     message: 'Hello World'
  // });
});

var roomno = 1;
let users = [];
let rooms = [];
// middleware which checks the username and allows the connection
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    socket.emit("invalid_username", "Invalid username");
    next();
  } else if (users.find((user) => user.username === username)) {
    socket.emit("invalid_username", "Username already exists");
    next();
  } else {
    socket.username = username;
    users.push({ userID: socket.id, username: socket.username });
    socket.emit("invalid_username", null);
    next();
  }
});

const lobbyNsp = io.of("/lobby");

lobbyNsp.use((socket, next) => {
  // console.log(socket);
  /**
   * TODO: Make sure the user has permission to connect to lobby
   */
  next();
});
lobbyNsp.on("connection", (socket) => {
  console.log("lobby connected");
  lobbyHandler.leaveRoom(socket, rooms);

  // socket.broadcast.emit('Room Events', users)

  lobbyHandler.logRooms(socket, lobbyNsp);

  lobbyHandler.resetAllRooms(socket);

  lobbyHandler.gameUsers(socket, lobbyNsp);

  lobbyHandler.createRoom(socket, users, rooms);

  lobbyHandler.joinRoom(socket, lobbyNsp);

  lobbyHandler.playedPiece(socket);

  socket.emit("Available Rooms", rooms);
  //Increase roomno 2 clients are present in a room.
  // if (lobbyNsp.nsps['/lobby'].adapter.rooms["room-" + roomno] && io.nsps['/'].adapter.rooms["room-" + roomno].length > 1) roomno++;
  // socket.emit('join', '')
  // for(const item of lobbyNsp.sockets){
  //     console.log(item);
  // }
  // socket.on('leave', () => {
  //     socket.leave('room-1')
  //     socket.leave('room-2')
  //     socket.leave('room-3')
  // })
  // if (socket.in(`room-${roomno}`) && socket.in(`room-${roomno}`).adapter.sids.size >= 2) {

  //     roomno++
  // }
  console.log(socket.id);
  //Send this event to everyone in the room.
  lobbyNsp
    .to("room-" + roomno)
    .emit("connectToRoom", "You are in room no. " + roomno);
  // console.log(lobbyNsp.adapter.rooms.size);
  // console.log(socket.in('room-2').adapter.rooms);
  console.log("====================================");
  // console.log(socket.in('room-2').adapter.nsp.sockets);
  // console.log(roomno);
  console.log(socket.rooms);
  // console.log( Array.from(socket.rooms)[1]);
  console.log("------------------------------------");
  // Gets the amount of users in the room below
  // console.log(socket.in(`room-${roomno}`).adapter.sids.size);
});
io.on("connection", (socket) => {
  // require('./connection-handler').connection(socket)
  // return io
  require("./connection-handler").disconnect(socket, users);
});
