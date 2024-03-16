// Establishing a WebSocket connection using Socket.IO
const socket = io('ws://localhost:3500');

// Selecting HTML elements for manipulation
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');
const chatDisplay = document.querySelector('.chat-display');

const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
let temp; //used to store room name to render to the frontend.
//let strtemp; //ensures the user doesn't send message if he is a duplicate.

// Function to send a chat message
const sendMessage = e => {
    e.preventDefault();
    // if (strtemp === "q") {
    //     alert("you can't send a message. check room and name, and join a different room or change your name in order to join this room and send a message");
    // }
    if (nameInput.value && msgInput.value && chatRoom.value) {
        // Emitting a 'message' event to the server
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value
        });
        msgInput.value = "";
    } else {
        alert("Check the values for name, room, and message!"); // Ensuring user and room are entered
    }
    msgInput.focus();
}

// Function to handle entering a chat room
const enterRoom = e => {
    e.preventDefault();
    if (nameInput.value && chatRoom.value) {
        // Emitting an 'enterRoom' event to the server
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
        temp = chatRoom.value;
        msgInput.textContent = "";
        msgInput.focus();
        //strtemp = "";
    }
}

// Event listeners for form submission
document.querySelector('.form-msg').addEventListener('submit', sendMessage);
document.querySelector('.form-join').addEventListener('submit', enterRoom);

// Event listener for typing activity
msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
});

// Listening for messages from the server and rendering them to the HTML
socket.on("message", (data) => {
    activity.textContent = "";
    const {
        name,
        text,
        time
    } = data;
    const li = document.createElement('li');
    li.className = 'post';
    if (name === nameInput.value) li.className = 'post post--right';
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--left';
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header ${name===nameInput.value
            ?'post__header--user'
            :'post__header--reply'
        }">
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
        </div>
        <div class="post__text">${text}</div>`
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    let lastElement = chatDisplay.querySelector('li:last-child');
    if (text === `you have joined the ${temp} chat room`) {
        if (lastElement.textContent !== 'Welcome to Chat App!') { //leaving a room and joining another room
            chatDisplay.textContent = "";
            chatDisplay.appendChild(li);
        } else {
            chatDisplay.appendChild(li);
        }
    } else if (text === `user with the same name already exists in the room ${temp}! Please try a unique name to join.` || text==='you are in the same room that you requested!') {
        //strtemp = "q";
        alert(text);
    } else {
        chatDisplay.appendChild(li);
    }
    chatDisplay.scrollTop = chatDisplay.scrollHeight;  //code to see latest messages without scrolling down
});

// Timer for clearing the typing activity message after 3 seconds
let activityTimer;
socket.on('activity', name => {
    activity.textContent = `${name} is typing...`;
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        activity.textContent = "";
    }, 3000);
});

// Function to display the list of users in a room
const showUsers = users => {
    usersList.textContent = '';
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
        users.forEach((user, i) => {
            usersList.textContent += `${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ","
            }
        });
    }
}

// Function to display the list of active rooms
const showRooms = rooms => {
    roomList.textContent = '';
    if (rooms) {
        roomList.innerHTML = `<em>Active rooms:</em>`;
        rooms.forEach((room, i) => {
            roomList.textContent += `${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ","
            }
        });
    }
}

// Listening for updates to the list of users and rooms
socket.on('userList', ({
    users
}) => {
    showUsers(users)
});
socket.on('roomList', ({
    rooms
}) => {
    showRooms(rooms)
});
socket.on('curUser',(curUser)=>{
    //console.log('in app.js',typeof curUser,curUser);
    if(curUser){
        //console.log('in if');
        chatRoom.value=curUser.room;
        nameInput.value=curUser.name;
    }
    else{
    chatRoom.value="";
    nameInput.value="";
    }
})