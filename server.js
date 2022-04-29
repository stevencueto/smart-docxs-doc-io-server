
   
require('dotenv').config()
const axios = require('axios')
const Server = require('socket.io')
const PORT = process.env.PORT || 3002;
const io = Server(PORT, {
    cors: {
        origin: ["*"],
        methods: ["GET", "POST"],

        // allowedHeaders: ["my-custom-header"],
        // credentials: true
      }
});

const canUserSee =(obj, user)=>{
    if(user === obj.user){
        return true
    }else if(obj.allowedUsers.includes(user)){
        return true
    }else if(obj.isPublic){
        return true
    }else{
        return false
    }
}
const mongoose = require('mongoose')
const mongoURI = process.env.MONGO_URI
const jwt = require('jsonwebtoken')
mongoose.connect(mongoURI, { useNewUrlParser: true},
    () => console.log('MongoDB connection established:', mongoURI)
    )
    
    // Error / Disconnection
const db = mongoose.connection
db.on('error', err => console.log(err.message + ' is Mongod not running?'))
db.on('disconnected', () => console.log('mongo disconnected', mongoURI))
const DocData = require('./models/DocData')
io.use(async(socket, next)=>{
    const token = socket.handshake?.auth?.token
    if (token){
      jwt.verify(token, process.env.TOKEN_GENERATOR, function(err, decoded) {
        if (err) return socketError(socket);
        socket.decoded = decoded
        next();
      });
    }else {
        socketError(socket)
    }    
  })

io.on('connection', (socket)=>{
    socket.on('find-document', async (id)=>{
        try{
            const isOk = await axios.get(`http://localhost:3003/doc/data/${id}`, {
                headers: { "x-access-token": socket.handshake?.auth?.token }})
                socket.join(id)
                if(isOk.data.success){
                    if(!canUserSee(isOk.data.data, socket.decoded.user._id)){
                       socket.emit('close-editor', "User not permited")
                        socket.disconnect() 
                       throw new Error('User not permi ted')
                    }
                }else{
                    socket.emit('close-editor', "User not permited")
                    socket.disconnect() 
                    throw new Error('User not permited')
                }
            const document = await DocData.findById(mongoose.Types.ObjectId(id))
            socket.emit('send-document', document)
            
            socket.on('send-changes', (delta)=>{
                socket.broadcast.to(id).emit('receive-changes', delta)
            })
            
            socket.on('save-document', async(data)=>{
                try{
                    await DocData.findByIdAndUpdate(mongoose.Types.ObjectId(id), {data}, {new:true})
                }catch(err){
                    console.log(err.message, "or here")
                } 
            })   
        }catch(err){
            console.log(err.message, 'here?')
        }
    })
})


const socketError = (socket)=>{
    socket.on('conection', (id)=>{
        socket.join(id)
        socket.emit('close-editor', "User not permited")
        socket.disconnect() 
        throw new Error('User not permited')
    })
} 