const DocData = require('../models/DocData')
const jtwAuth = require('../middleware/jwt')

exports.foo = (req,res) => {
   const io = req.app.get('socketio');
    io.use(jtwAuth(socket, next))
    .on('connection', (socket)=>{
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
                console.log(err.message)
            }
        })
    })
}
