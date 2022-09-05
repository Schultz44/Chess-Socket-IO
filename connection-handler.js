// module.exports = function(socket){
//     io.on('connection', (socket) => {
//         // socket.on('board', board => {
//         //     socket.emit('board-object', board)
//         //     socket.broadcast.emit('board-object', 'Another user moved a piece')
//         // })
//         console.log(`a user connected: SOCKET=${socket.id}`);
//         // socket.on('disconnect', () => {
//         //     console.log('user disconnected');

//         // });
//     })
// }

// const removeUsernameOnDisconnect = function(users, username){

// }

module.exports = {
  connection: function connection() {
    io.on("connection", (socket) => {
      console.log("hi");
    });
  },
  disconnect: (disconnect = (socket, users = [], fun = T) => {
    socket.on("disconnect", () => {
      const foundSocket =
        users.findIndex((user) => user.userId === socket.id) > -1;
      if (foundSocket) {
        users = users.splice(foundSocket, 1);
      }
      console.log("user disconnected: ", socket.id);
      fun(users);
    });
  }),
  board: (board = function (socket) {
    socket.on("board", (board) => {
      socket.emit("board-object-1111", board);
      socket.broadcast.emit("board-object", "Another user moved a piece");
    });
  }),
  signOut: (signOut = (socket, users = []) => {
    socket.on("sign_out", () => {
      console.log("... Sign Out");
      console.log("Socket :: ", socket.id);
      console.log("Rooms  :: ", socket.rooms);
      console.log("Users  ::", users);
      users.splice(
        users.findIndex(
          (username) => username === socket.handshake.auth.username
        ),
        1
      );
      console.log("user disconnected");
    });
  }),

  validUser: function (socket, users) {
    const username = socket.handshake.auth.username;
    console.log("Handshake: ", username);
    console.log("======================================");
    if (!username) {
      socket.emit("is_username_valid", {
        valid: false,
        err: "Invalid username ",
        users: users,
      });
      // next();
    } else if (users.find((user) => user.username === username)) {
      socket.emit("is_username_valid", {
        valid: false,
        err: "Username already exists ",
        users: users,
      });
      // next();
    } else {
      socket.username = username;
      users.push({ userId: socket.id, username: socket.username });
      socket.emit("is_username_valid", {
        valid: true,
        user: { userId: socket.id, username: socket.username },
        users: users,
      });
      // next();
    }
  },
};
