const DocData = require('../models/DocData')


const socket = (io) => {    
    io.on('connection', (socket)=>{
        console.log(`conected to port`)
        socket.on('find-document', async (id)=>{
            try{
                const document = await DocData.findById(id)
                socket.join(id)
                socket.emit('send-document', document)
                
                socket.on('send-changes', (delta)=>{
                    socket.broadcast.to(id).emit('receive-changes', delta)
                })
                
                socket.on('save-document', async(data)=>{
                    try{
                        await DocData.findByIdAndUpdate(id, {data}, {new:true})
                    }catch(err){
                        console.log(err.message)
                    } 
                })   
            }catch(err){
                console.log(err.message)
            }
        })
    })
}

module.exports = {socket};