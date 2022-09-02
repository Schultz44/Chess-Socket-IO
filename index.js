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
    origin: "http://localhost:4201",
    methods: ["GET", "POST"],
  },
});

//handlers
const connectionHandler = require("./connection-handler");
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
  socket.on("is_username_valid", (username) => {
    console.log(":::-::: ", socket.handshake.auth.username, " :::-:::");
  });
  // socket.handshake.auth ----> is socket.auth on the client in auth.service
  // connectionHandler.validUser(socket);
  const username = socket.handshake.auth.username;
  console.log("Handshake: ", username);
  console.log("======================================");
  if (!username) {
    socket.emit("is_username_valid", {
      valid: false,
      err: "Invalid username ",
      users: users,
    });
    console.log(60);
    next();
  } else if (users.find((user) => user.username === username)) {
    socket.emit("is_username_valid", {
      valid: false,
      err: "Username already exists ",
      users: users,
    });
    console.log(68);
    next();
  } else {
    socket.username = username;
    users.push({ userID: socket.id, username: socket.username });
    socket.emit("is_username_valid", {
      valid: true,
      user: { userID: socket.id, username: socket.username },
      users: users,
    });
    console.log(78);
    next();
  }
});
io.on("connection", (socket) => {
  // require('./connection-handler').connection(socket)
  // return io
  console.log("::::: - IO CONNECTION - :::::");

  // socket.on("is_username_valid", (username) => {
  //   console.log("::: ::: ", username, " ::: :::");

  //   socket.emit("is_username_valid", {
  //     valid: false,
  //     err: "This socket is not working correctly.. Please try again later",
  //   });
  // });
  console.log(users);
  connectionHandler.disconnect(socket);
  connectionHandler.signOut(socket, users);
  // connectionHandler.signOut(socket);
  // socket.on("rooms", () => {
  //   console.log(socket.rooms);
  //   console.log(socket.id);
  //   socket.emit("test", socket.rooms);
  // });
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

  socket.on("test", (value) => {
    console.log("test: ", value);
    socket.emit("test", value + " EMIT");
  });
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
  console.log("SOCKET_ID: ", socket.id);
  //Send this event to everyone in the room.
  lobbyNsp
    .to("room-" + roomno)
    .emit("connectToRoom", "You are in room no. " + roomno);
  // console.log(lobbyNsp.adapter.rooms.size);
  // console.log(socket.in('room-2').adapter.rooms);
  console.log("====================================");
  // console.log(socket.in('room-2').adapter.nsp.sockets);
  // console.log(roomno);
  console.log("SOCKET_ROOMS: ", socket.rooms);
  // console.log( Array.from(socket.rooms)[1]);
  console.log("------------------------------------");
  // Gets the amount of users in the room below
  // console.log(socket.in(`room-${roomno}`).adapter.sids.size);
});
