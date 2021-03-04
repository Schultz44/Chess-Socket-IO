const app = require('express')();
const http = require('http').createServer(app);
const path = require('path');
const { Socket } = require('socket.io');
// cors (Cross-Origin Resource Sharing) allows for other origins to read the information
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});
http.listen(3000, () => {
    console.log('listening on *:3000');
});
// const { Server } = require('socket.io');
// const io = new Server;

// let io = require('socket.io')(http);
app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '../test-server', './index.html'));
    res.sendFile('index.html', { root: path.join(__dirname, '../test-server') })
    // res.send('<h1>Hey Socket.io</h1>');
    // res.json({
    //     message: 'Hello World'
    // });
});
var roomno = 1;
let users = [];
let rooms = [];
const lobbyNsp = io.of('/lobby').on('connection', (socket) => {

    socket.on('leave room', (user) => {
        console.log('[socket]', 'leave room :', user);
        socket.leave(user.room)
        rooms.splice(rooms.findIndex(room => room.room == user.room), 1)

    })
    // socket.broadcast.emit('Room Events', users)
    socket.on('log rooms', () => {
        console.log('log rooms --->',lobbyNsp.adapter.rooms);
    })
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
    socket.on('Create Room', (data) => {
        
        console.log(data);
        // let user = new SocketUser;
        const user = {
            // users: data.username,
            player1: data.player1,
            id: socket.id,
            roomName: data.roomName,
            roomKey: data.roomKey
        }
        console.log('++++++++++++++++++++++++++++');
        users.push(user)
        socket.join(user.roomName);
        socket.emit('Created Room', user)
        socket.broadcast.to(user.roomName).emit(`User Joined ${user.roomName}`, `${user.user} has joined the room`);
        socket.broadcast.emit('Room Events', user)
        rooms.push(user);
        console.log('*****************************************************************');
        // console.log(socket.to(user.roomName).client.sockets);
        // console.log(socket.in(user.roomName).adapter.rooms);
        console.log(lobbyNsp.adapter.rooms.get(`${user.roomName}`));
        console.log(users);
        // console.log(io.of('/lobby').clients(user.roomNSame));
    })
    socket.on('Join Room', ({ room }) => {
        console.log('Join Room:',room);
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
    socket.on('Played Piece', ({piece, room}) => {
        console.log('97: ', room.roomName);
        socket.broadcast.to(room.roomName).emit('Update Board State', {piece, room})
    })
    socket.emit('Available Rooms', rooms);
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
    lobbyNsp.to("room-" + roomno).emit('connectToRoom', "You are in room no. " + roomno);
    // console.log(lobbyNsp.adapter.rooms.size);
    // console.log(socket.in('room-2').adapter.rooms);
    console.log('====================================');
    // console.log(socket.in('room-2').adapter.nsp.sockets);
    // console.log(roomno);
    console.log(socket.rooms);
    // console.log( Array.from(socket.rooms)[1]);
    console.log('------------------------------------');
    // Gets the amount of users in the room below
    // console.log(socket.in(`room-${roomno}`).adapter.sids.size);
})
io.on('connection', (socket) => {


    socket.on('board', board => {
        socket.emit('board-object', board)
        socket.broadcast.emit('board-object', 'Another user moved a piece')
    })
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
