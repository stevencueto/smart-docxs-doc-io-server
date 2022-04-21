const path = require('path')
const http = require('http')
const express = require('express')
const app = express()
// const router = express.Router()
const server = http.createServer(app)
const socketIO = require('socket.io')
const DocData = require('../models/Docs')
const publicPath = path.join(__dirname, '/../public')
const io = socketIO(server, 
    {
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"],
        },
})

router.use(express.static(publicPath))
const findOrCreateDocument = async (request) =>{
    const newDocReq = {
        _id: request.id,
        data: "",
        user: request.user,
        type: "docx",
        title: request.title
    } 
    try{
        const document = await Docs.findById(request.id)
        if(document) return document
        const doc = Docs.create({ newDocReq})
        return doc
    }catch(err){

    }

}









io.on('connection', (socket)=>{
    socket.on('find-document', async (request)=>{
        try{
            const document = await findOrCreateDocument(request)
            socket.join(request.id)
            socket.emit('found-document', document)

            socket.on('send-changes', (delta)=>{
                socket.broadcast.to(request.id).emit('receive-changes', delta)
            })

            socket.on('save-document', async(data)=>{
               try{
                   await Docs.findByIdAndUpdate(request.id, {data: data})
               }catch(err){
                   console.log(err)
               } 
            })   
        }catch(err){
            console.log(err)
        }
    })
})

module.exports = router;