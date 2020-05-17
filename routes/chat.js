const express = require('express');
const path = require('path');
const http = require('http');
const router = express.Router();
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

router.use('/chat',express.static(path.join(__dirname,'../public/chat')));

module.exports = router;  
