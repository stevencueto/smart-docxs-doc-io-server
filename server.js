require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')
const io = new Server(server, {
    cors: {
        origin: ["*"],
        methods: ["GET", "POST"],

        // allowedHeaders: ["my-custom-header"],
        // credentials: true
      }
});
app.use(cors)


const PORT = process.env.PORT || 3002;
const morgan = require('morgan')
const mongoose = require('mongoose')
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI, { useNewUrlParser: true},
    () => console.log('MongoDB connection established:', mongoURI)
    )
    
    // Error / Disconnection
const db = mongoose.connection
db.on('error', err => console.log(err.message + ' is Mongod not running?'))
db.on('disconnected', () => console.log('mongo disconnected', mongoURI))


app.use(morgan)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const { socket } = require('./controller/socketController')
socket(io)

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});