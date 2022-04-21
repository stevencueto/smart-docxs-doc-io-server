require('dotenv').config()
const PORT = process.env.PORT || 3002;
const socketIO = require('socket.io')
const io = socketIO(PORT, {cors: {
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },})
const mongoose = require('mongoose')
const mongoURI = process.env.MONGO_URI
const DocData = require('./models/DocData')

mongoose.connect(mongoURI, { useNewUrlParser: true},
    () => console.log('MongoDB connection established:', mongoURI)
  )
  
  // Error / Disconnection
  const db = mongoose.connection
  db.on('error', err => console.log(err.message + ' is Mongod not running?'))
  db.on('disconnected', () => console.log('mongo disconnected', mongoURI))
  
const findOrCreateDocument = async (id) =>{
    try{
        const document = await DocData.findById(id)
        if(document){
            return document
        }else{
            console.log('new doc')
            const doc = await  DocData.create({_id: id, data: ""})
            return doc
        } 
    }catch(err){
        console.log(err)
    }
}









io.on('connection', (socket)=>{
    console.log(`conected to port ${PORT}`)
    socket.on('find-document', async (id)=>{
        try{
            const document = await findOrCreateDocument(id)
            socket.join(id)
            socket.emit('send-document', document)
            
            socket.on('send-changes', (delta)=>{
                socket.broadcast.to(id).emit('receive-changes', delta)
            })
            
            socket.on('save-document', async(data)=>{
                try{
                    await DocData.findByIdAndUpdate(id, {data}, {new:true})
                }catch(err){
                    console.log(err)
                } 
            })   
        }catch(err){
            console.log(err)
        }
    })
})
