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

board = function (socket) {
  socket.on("board", (board) => {
    socket.emit("board-object-1111", board);
    socket.broadcast.emit("board-object", "Another user moved a piece");
  });
};
const disconnect = (socket, users = []) => {
  socket.on("disconnect", () => {
    users.splice(
      users.findIndex(
        (username) => username === socket.handshake.auth.username
      ),
      1
    );
    console.log("user disconnected");
  });
};
function connection() {
  io.on("connection", (socket) => {
    console.log("hi");
  });
}

module.exports = { connection, disconnect, board };
