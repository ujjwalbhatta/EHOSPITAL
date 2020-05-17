const express = require('express');
const expresslayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app = express();
//chat
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);

//middlewares
app.use(expresslayouts);
app.set('view engine','ejs');
app.use('/public/images/',express.static('./public/images'));
app.use(express.urlencoded({extended:true}));
app.use(bodyparser.json())
app.use(flash());
app.use(session({
    secret: 'secret',//can be whatever
    resave: true,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  }); 

//mongodb
const db = require('./config/keys').MongoURI;
mongoose.connect(db,{useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
    .then(()=> console.log('MongoDb connected..'))
    .catch(err => console.log(err));

//Call routes
app.use('/',require('./routes/index'));
app.use('/patient',require('./routes/patient'));
app.use('/doctor',require('./routes/doctor'));
app.use('/',require('./routes/reports'));
app.use('/',require('./routes/feedback'));
app.use('/',require('./routes/chat'));
app.use('/',require('./routes/patientprofile'));
app.use('/',require('./routes/doctorprofile'));

//chat
const io = socketio(server);
const formatMessage = require('./handlers/messages');
const { userJoin, getCurrentUser, userLeave,getRoomUsers } = require('./handlers/users');

const botName = 'ChatCord Bot';

io.on('connection', socket =>{
   //join room 
   socket.on('joinRoom',({username,room}) =>{
     const user = userJoin(socket.id,username,room);  
     socket.join(user.room);

   // Welcome current User  
   socket.emit('message',formatMessage(botName,'Welcome to chat board')); 

   //sabai user le herna milne lai broadcast use garne
   socket.broadcast
     .to(user.room)
     .emit(
       'message',
       formatMessage(botName,`${user.username} has joined a chat`)
       );

   // Send user and room info
   io.to(user.room).emit('roomUsers', {
     room: user.room,
     users: getRoomUsers(user.room)
     });
   });
   
   //for chat message
   socket.on('chatMessage' , msg => {
     const user = getCurrentUser(socket.id);
     io.to(user.room).emit('message',formatMessage(user.username,msg));
   });

   //when one disconnects the chat
   socket.on('disconnect', () => {
     const user = userLeave(socket.id);
     if(user) {
       io.to(user.room).emit(
         'message',
         formatMessage(botName,`${user.username} has disconnected the chat`)// user bhanne nabanako bhaye yo bahira hunthyo
       );
     // Send user and room info
       io.to(user.room).emit('roomUsers', {
         room: user.room,
         users: getRoomUsers(user.room)
     });
   }  
});
});

const PORT = process.env.PORT || 1000;

server.listen(PORT, console.log(`Server started on port ${PORT}`));