require('dotenv').config()
const path = require('path')
const http = require('http')
const express = require('express')
const morgan = require('morgan')
const app = express()
// const router = express.Router()
const server = http.createServer(app)
const socketIO = require('socket.io')
const publicPath = path.join(__dirname, '/../public')
const io = socketIO(server)
const mongoose = require('mongoose')
const mongoURI = process.env.MONGO_URI
const PORT = process.env.PORT || 3002;
const DocData = require('./models/DocData')

mongoose.connect(mongoURI, { useNewUrlParser: true},
    () => console.log('MongoDB connection established:', mongoURI)
  )
  
  // Error / Disconnection
  const db = mongoose.connection
  db.on('error', err => console.log(err.message + ' is Mongod not running?'))
  db.on('disconnected', () => console.log('mongo disconnected', mongoURI))
  
app.use(morgan('dev'))


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(publicPath))
const findOrCreateDocument = async (id) =>{
    const newDocReq = {
        _id: request.id,
        data: ""
    } 
    try{
        const document = await DocData.findById(id)
        if(document) return document
        const doc = DocData.create({ newDocReq})
        return doc
    }catch(err){

    }

}









io.on('connection', (socket)=>{
    socket.on('find-document', async (id)=>{
        try{
            const document = await findOrCreateDocument(id)
            socket.join(id)
            socket.emit('found-document', document)

            socket.on('send-changes', (delta)=>{
                socket.broadcast.to(id).emit('receive-changes', delta)
            })

            socket.on('save-document', async(data)=>{
               try{
                   await DocData.findByIdAndUpdate(id, {data: data})
               }catch(err){
                   console.log(err)
               } 
            })   
        }catch(err){
            console.log(err)
        }
    })
})

app.listen(PORT, ()=>{
    console.log(`Listening on PORT: ${PORT}`)
})