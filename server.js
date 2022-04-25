require('dotenv').config()
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
const mongoose = require('mongoose')
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI, { useNewUrlParser: true},
    () => console.log('MongoDB connection established:', mongoURI)
    )
    
    // Error / Disconnection
const db = mongoose.connection
db.on('error', err => console.log(err.message + ' is Mongod not running?'))
db.on('disconnected', () => console.log('mongo disconnected', mongoURI))
const DocData = require('./models/DocData')
io.on('connection', (socket)=>{
    console.log(`conected to ${PORT}`)
    socket.on('find-document', async (id)=>{
        try{
            const document = await DocData.findById(mongoose.Types.ObjectId(id))
            socket.join(id)
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