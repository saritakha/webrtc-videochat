// index.js
'use strict';

const express = require('express');
const https = require('https');
const fs = require('fs');

const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem');

const options = {
  key: sslkey,
  cert: sslcert,
};

const app = express();

// const server = https.createServer(options, app).listen(3000);
const server = https.createServer(app).listen(3000);
const io = require('socket.io')(server);

app.use(express.static('public'));
app.use('/modules', express.static('node_modules'));

io.on('connection', socket => {
      const socketid = socket.id;
      console.log('a user connected with session id ' + socket.id);

      socket.on('call', msg => {
        console.log('call broadcasted');
        socket.broadcast.emit('call', msg);
      });

      socket.on('answer', msg => {
        console.log('answer broadcasted');
        socket.broadcast.emit('answer', msg);
      });

      socket.on('candidate', (msg) => {
        console.log('candidate message recieved!');
        socket.broadcast.emit('candidate', msg);
      });

    },
);

