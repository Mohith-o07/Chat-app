// Importing necessary modules and libraries
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Getting the current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setting up the port for the server
const PORT = process.env.PORT || 3500;
const ADMIN = "Admin"; // Constant for the Admin username

// Creating an Express application
const app = express();

// Serving static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Starting the server and listening on the specified port
const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

// State management for user information
const UsersState = {
    users: [],
    setUsers(newUsersArray) {
        this.users = newUsersArray;
    }
};

// Creating a Socket.IO server and attaching it to the Express server
const io = new Server(expressServer);

// Function to build a message object with name, text, and time
const buildMsg = (name, text) => {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    };
};

// User-related functions
//activates or sets the user.
const activateUser = (id, name, room) => {
    const user = { id, name, room };
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id), user
    ]);
    return user;
};

const userLeavesApp = id => {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    );
};

const getUser = id => {
    return UsersState.users.find(user => user.id === id);
};

const getUsersInRoom = room => {
    return UsersState.users.filter(user => user.room === room);
};

const getAllActiveRooms = () => {
    return Array.from(new Set(UsersState.users.map(user => user.room)));
};

// Handling socket connections
io.on('connection', socket => {
    console.log(`user ${socket.id} connected`);

    // Sending a welcome message to the connected user
    socket.emit('message', buildMsg(ADMIN, "Welcome to Chat App!"));

    // Handling user entry into a chat room
    socket.on('enterRoom', ({ name, room }) => {
        // Joining the new room
        if (UsersState.users.find(user => ((user.name).toLowerCase() === name.toLowerCase()) && user.room === room)) { //avoiding duplicate users
            socket.emit('message', buildMsg(ADMIN, `user with the same name already exists in the room ${room}! Please try a unique name to join.`));
            const curUser = getUser(socket.id);
            //console.log(curUser,'in index.js');
            socket.emit('curUser',curUser);
        } 
        else {
        // Leaving the previous room if any
        //console.log(`I'm in room ${room} hoi`);
        const prevRoom = getUser(socket.id)?.room;
        if (prevRoom) {
            // if(prevRoom===room){
            //     socket.emit('message',buildMsg(ADMIN,'you are in the same room that you requested!'));
            // }
        socket.leave(prevRoom);
        io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name} has left the room`));
        }
        //setting the user with the room he intended.
        const user = activateUser(socket.id, name, room);
        socket.join(user.room);

        // Sending a message to the user who joined
        socket.emit('message', buildMsg(ADMIN, `you have joined the ${user.room} chat room`));

        // Broadcasting to everyone else in the room
        socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`));

        // Updating user list for the current room
        io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
        });
        // Updating user list for the previous room
        io.to(prevRoom).emit('userList', {
             users: getUsersInRoom(prevRoom)
        });

        // Updating rooms list for everyone
        io.emit('roomList', {
             rooms: getAllActiveRooms()
            });
        }
    });

    // Handling user disconnection
    socket.on('disconnect', () => {
        const user = getUser(socket.id);
        userLeavesApp(socket.id);

        if (user) {
            // Broadcasting that the user has left the room
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`));

            // Updating user list for the room
            io.to(user.room).emit('userList', {
                users: getUsersInRoom(user.room)
            });

            // Updating rooms list for everyone
            io.emit('roomList', {
                rooms: getAllActiveRooms()
            });
        }

        console.log(`User ${socket.id} disconnected`);
    });

    // Listening for messages from the client
    socket.on('message', ({ name, text }) => {
        const room = getUser(socket.id)?.room;
        if (room) {
            // Broadcasting the message to everyone in the room
            io.to(room).emit('message', buildMsg(name, text));
        }
    });

    // Listening for typing activity
    socket.on('activity', name => {
        const room = getUser(socket.id)?.room;
        socket.to(room).emit('activity', name);
    });
});