const chatForm = document.getElementById('chat-form'); //chatform ko id msg ma store bhako tya bata dekhauna paryo ie chat.html
const chatMessages = document.querySelector('.chat-messages'); //chat-messages ma baseko lai line bhayo jun lai scroll ma milauna call gariyo
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room from url which has got username ra room
const { username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
//console.log(username,room); // we can check if we are getting it

const socket = io();

//Join chatroom
socket.emit('joinRoom', {username,room}); // aba yeslai catch garene appjs bata

//get room users
socket.on('roomUsers',({room,users}) => {
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message',message =>{
     console.log(message); //displays message on server but we need to show it on screen
     outputMessage(message);//puts msg on dom // this is to take place after we emit msg on server //tara ka dekhaune ta bhanna lai euta function banauchau tala

     //scroll down
     chatMessages.scrollTop = chatMessages.scrollHeight
 });

//type gareko message dekhaune jun chai msg ko form ma cha aile
chatForm.addEventListener('submit',e =>{
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    //console.log(msg); //msg type gareko dekhaira cha ki chaina bhanera check garna milyo ie in server
    //tara yo hamile catch garna parcha aba

    //emit message to server
    socket.emit('chatMessage',msg); //aba yo event lai catch garna paryo

    //lekheko kura haru clear garne
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
}); 

//output message
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');// html ma jun div ma lana lako tei nera
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text} 
    </p>`;// message bhaneko welcome to chatboard yesle pathaune bhayo tya aba
    //message matra pathako bhaye as a whole object pathauthyo
    document.querySelector('.chat-messages').appendChild(div); //html ko chat-messages bhanne ma append garne bhayo
    //hamle lekheko sab message haru jane bhayo
}

//add room name to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to dom
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li> ${user.username} </li>`).join('')}
    `;
}