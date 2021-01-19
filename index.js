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
    socket.on('Create Room', (data) => {
        console.log(data);
        const user ={
            user: data.username,
            id: socket.id,
            room: data.room
        }
        users.push(user)
        socket.join(user.room);
        socket.emit('Created Room', `Room: '${user.room}' has been created`)
        socket.broadcast.to(user.room).emit(`User Joined ${user.room}`, `${user.user} has joined the room`);
        socket.broadcast.emit('Room Events', user)
        rooms.push(user.room);
        console.log('*****************************************************************');
        // console.log(socket.to(user.room).client.sockets);
        // console.log(socket.in(user.room).adapter.rooms);
        console.log(lobbyNsp.adapter.rooms.get('room-1'));
        console.log(users);
        // console.log(io.of('/lobby').clients(user.room));
    })
    socket.on('Join Room', ({room, username}) => {
        const user = {
            user: username,
            id: socket.id,
            room: room
        }
        users.push(user)
        console.log(users);

        socket.join(user.room);
        // Broadcast when a user joins
        socket.broadcast.to(user.room).emit('Joined', `User joined ${user.room}`)
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
    socket.join("room-" + roomno);

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
