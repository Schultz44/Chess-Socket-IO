module.exports = {
    logRooms: function (socket, lobbyNsp) {
        socket.on('log rooms', () => {
            console.log('log rooms --->',lobbyNsp.adapter.rooms);
        })
    },
    resetAllRooms: function (socket){
        socket.on('reset all rooms', () => {
            // console.log(lobbyNsp.adapter.rooms);
            // console.log(Object.keys(lobbyNsp.adapter.rooms));
            // console.log((lobbyNsp.adapter.sids));
            // console.log((lobbyNsp.adapter.rooms.get('room-1')));
            socket.leave('room-1')
            // socket.leave('room-2')
            // socket.leave('room-3')
            users.forEach(user => {
                socket.leave(user.room)
            })
    
            console.log(users);
        })
    },
    leaveRoom: function (socket, rooms) {
        socket.on('leave room', (user) => {
            console.log('[socket]', 'leave room :', user);
            // socket.leave(user.room)
            // rooms.splice(rooms.findIndex(room => room.room == user.room), 1)
    
        })
    },
    gameUsers: function (socket, lobbyNsp) {
        socket.on('Game Users', data => {
            console.log(lobbyNsp.adapter);
            socket.emit('Game Users', lobbyNsp.adapter.rooms)
        })
    },
    createRoom: function(socket, users, rooms) {
        socket.on('Create Room', (data) => {
        
            console.log('Create Room', data);
            // let user = new SocketUser;
            const user = {
                // users: data.username,
                player1: data.player1,
                id: socket.id,
                roomName: data.roomName,
                roomKey: data.roomKey
            }
            // console.log('++++++++++++++++++++++++++++');
            users.push(user)
            socket.join(user.roomName);
            socket.emit('Created Room', user)
            socket.broadcast.to(user.roomName).emit(`User Joined ${user.roomName}`, `${user.user} has joined the room`);
            socket.broadcast.emit('Room Events', user)
            rooms.push(user);
            // console.log('*****************************************************************');
            // console.log(socket.to(user.roomName).client.sockets);
            // console.log(socket.in(user.roomName).adapter.rooms);
            // console.log(lobbyNsp.adapter.rooms.get(`${user.roomName}`));
            // console.log(users);
            // console.log(io.of('/lobby').clients(user.roomNSame));
        })
    },
    joinRoom: function (socket, lobbyNsp) { 
        socket.on('Join Room', ({ room }) => {
            // console.log('Join Room:',room);
            // const user = {
            //     user: username,
            //     id: socket.id,
            //     room: room
            // }
            // users.push(user)
            // console.log(users);
            socket.join(room.roomName);
            socket.broadcast.to(room.roomName).emit('Emit Opponent', room)
            console.log('92: ',lobbyNsp.adapter.rooms.get(`${room.roomName}`));
            // // Broadcast when a user joins
            // socket.broadcast.to(user.room).emit('Joined', `User joined ${user.room}`)
        })
    },
    playedPiece: function (socket) {
        socket.on('Played Piece', ({piece, room, previousPieceLocation}) => {
            console.log('97: ', piece, previousPieceLocation);
            socket.broadcast.to(room.roomName).emit('Update Board State', {piece, room, previousPieceLocation})
        })
    }
}