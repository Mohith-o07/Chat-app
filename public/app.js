const socket = io('ws://localhost:3500');

const activity=document.querySelector('.activity');
const usersList=document.querySelector('.user-list');
const roomList=document.querySelector('.room-list');
const chatDisplay=document.querySelector('.chat-display');

const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
let temp;
let strtemp;
    const sendMessage = e => {
      e.preventDefault();
      if(strtemp==="q"){
        alert("check room and name!");
      }
      if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message',{
          name:nameInput.value,
          text:msgInput.value
      });
        msgInput.value = "";
      }else{
        alert("Check the values for name,room and message!");//makes sure user and room are entered!
      }
      msgInput.focus();
    }

    const enterRoom=e=>{
      e.preventDefault();
      if(nameInput.value && chatRoom.value){
        socket.emit('enterRoom',{
          name:nameInput.value,
          room:chatRoom.value
        })
        //console.log(lastElement.textContent);
        temp=chatRoom.value;
        msgInput.textContent="";
         msgInput.focus();
         strtemp="";
      }
    }

    document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage);

    document.querySelector('.form-join')
    .addEventListener('submit', enterRoom);

    msgInput.addEventListener('keypress',()=>{
      socket.emit('activity',nameInput.value)
    })
  
    // Listening for messages from the server and renders the message to the html..
    socket.on("message", (data) => {
      activity.textContent="";
      const {name,text,time}=data;
      const li = document.createElement('li');
      li.className='post';
      if(name===nameInput.value) li.className='post post--right';
      if(name!==nameInput.value && name!=='Admin') li.className='post post--left';
      if(name!=='Admin'){
        li.innerHTML=`<div class="post__header ${name===nameInput.value
                ?'post__header--user'
                :'post__header--reply'
        }">
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
        </div>
        <div class="post__text">${text}</div>`
        }else{
          li.innerHTML=`<div class="post__text">${text}</div>`
        }
        let lastElement=chatDisplay.querySelector('li:last-child');
        if(text===`you have joined the ${temp} chat room`){
          if(lastElement.textContent!=='Welcome to Chat App!'){
            chatDisplay.textContent="";
            chatDisplay.appendChild(li);
          }
          else{
            chatDisplay.appendChild(li);
          }
      }
      else if(text===`user with the same name already exists in the room ${temp}! Please try a unique name.`){
        strtemp="q";
        alert(text);
      }
      else{
        chatDisplay.appendChild(li);
      }
      chatDisplay.scrollTop=chatDisplay.scrollHeight;
    });

    let activityTimer
    socket.on('activity',name=>{
      activity.textContent=`${name} is typing...`

      //clear after 3 seconds..
      clearTimeout(activityTimer)
      activityTimer=setTimeout(()=>{
        activity.textContent=""
      },3000)
    })

    const showUsers=users=>{
      usersList.textContent='';
      if(users){
        usersList.innerHTML=`<em>Users in ${chatRoom.value}:</em>`;
      users.forEach((user,i) => {
        usersList.textContent+=`${user.name}`
        if(users.length>1 && i!==users.length-1){
          usersList.textContent+=","
        }
      });
    }
  }

    const showRooms=rooms=>{
      roomList.textContent='';
      if(rooms){
        roomList.innerHTML=`<em>Active rooms:</em>`;
      rooms.forEach((room,i) => {
        roomList.textContent+=`${room}`
        if(rooms.length>1 && i!==rooms.length-1){
          roomList.textContent+=","
        }
      });
    }
  }

    socket.on('userList',({users})=>{
      showUsers(users)
    })
    socket.on('roomList',({rooms})=>{
      showRooms(rooms)
    })



  