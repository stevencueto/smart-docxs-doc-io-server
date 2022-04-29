require('dotenv').config()
const express = require("express");
const cors = require("cors");
const app = express();
const Server = require('socket.io')
const PORT = process.env.PORT || 3002;
const mongoose = require('mongoose')
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI, { useNewUrlParser: true},
    () => console.log('MongoDB connection established:', mongoURI)
    )
    
    // Error / Disconnection
const db = mongoose.connection
db.on('error', err => console.log(err.message + ' is Mongod not running?'))
db.on('disconnected', () => console.log('mongo disconnected', mongoURI))


const server = app.listen(PORT, () =>
  console.log(`connected to ${PORT}`)
);


const io = Server(server, {
    cors: {
        origin: ["*"],
        methods: ["GET", "POST"],
    },
});
app.set('socketio', io);