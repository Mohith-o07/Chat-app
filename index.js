import express from 'express'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)

const PORT=process.env.PORT || 3500
const ADMIN="Admin"

const app=express()

app.use(express.static(path.join(__dirname,"public"))) //sets static file server..

const expressServer=app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
})

//state
const UsersState={
    users:[],
    setUsers(newUsersArray){
        this.users=newUsersArray;
    }
}

const io=new Server(expressServer,{ //manages socket connections...
    // cors:{
    //     origin:process.env.NODE_ENV==="production"?false:["http://localhost:5500","http://127.0.0.1:5500"]
    // }
})
const buildMsg=(name,text)=>{
    return{
        name,
        text,
        time:new Intl.DateTimeFormat('default',{
            hour:'numeric',
            minute:'numeric',
            second:'numeric'
        }).format(new Date())
    }
}

//user functions..
const activateUser=(id,name,room)=>{
    const user={id,name,room} //shorthand notation..
    UsersState.setUsers([
        ...UsersState.users.filter(user=>user.id!==id),user
    ])
    return user;
}

const userLeavesApp=(id)=>{
    UsersState.setUsers(
        UsersState.users.filter(user=>user.id!==id)
    )
}

const getUser=id=>{
    return UsersState.users.find(user=>user.id===id);
}

const getUsersInRoom=room=>{
    return UsersState.users.filter(user=>user.room===room);
}

const getAllActiveRooms=()=>{
    return Array.from(new Set(UsersState.users.map(user=>user.room)))
}

io.on('connection',socket=>{
    console.log(`user ${socket.id} connected`)
    console.log(UsersState.users);
    //upon connection sending message to only user..
    socket.emit('message',buildMsg(ADMIN,"Welcome to Chat App!"));

    socket.on('enterRoom',({name,room})=>{

        //leave previous room
        const prevRoom=getUser(socket.id)?.room;

        if(prevRoom){
            socket.leave(prevRoom);
            io.to(prevRoom).emit('message',buildMsg(ADMIN,`${name} has left the room`))
        }

        //can't update previous room users list until after the state update in activate user
        if(prevRoom){
            io.to(prevRoom).emit('userList',{
                users:getUsersInRoom(prevRoom)
            })
        }

        //join room
        if(UsersState.users.find(user=>((user.name).toLowerCase()===name.toLowerCase()) && user.room===room)){
            //console.log(user.name.toLowerCase(),user.room);
            socket.emit('message',buildMsg(ADMIN,
                `user with the same name already exists in the room ${room}! Please try a unique name.`));
        }
        else{
        const user=activateUser(socket.id,name,room);
        socket.join(user.room)

        //to user who joined
        socket.emit('message',buildMsg(ADMIN,
            `you have joined the ${user.room} chat room`))

        //to everyone else..
        socket.broadcast.to(user.room).emit('message',
        buildMsg(ADMIN,`${user.name} has joined the room`))

        //update user list for room
        io.to(user.room).emit('userList',{
            users:getUsersInRoom(user.room)
        })

        //update rooms list for everyone..
        io.emit('roomList',{
            rooms:getAllActiveRooms()
        })
    }
    })

    //when user disconnects - to all others
    socket.on('disconnect',()=>{
        const user=getUser(socket.id);
        userLeavesApp(socket.id);

        if(user){
            io.to(user.room).emit('message',buildMsg(ADMIN,`${user.name} has left the room`))

            io.to(user.room).emit('userList',{
                users:getUsersInRoom(user.room)
            })

            io.emit('roomList',{
                rooms:getAllActiveRooms()
            })
        }

        console.log(`User ${socket.id} disconnected`);
    })

    //Listening for a message event..
    socket.on('message',({name,text})=>{
        const room=getUser(socket.id)?.room;
        if(room){
            io.to(room).emit('message',buildMsg(name,text))
        }
    })

    //listen for activity..
    socket.on('activity',name=>{
        const room=getUser(socket.id)?.room;
        socket.to(room).emit('activity',name);
    })
})

