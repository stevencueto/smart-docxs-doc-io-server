module.exports = (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token){
        jwt.verify(token, process.env.TOKEN_GENERATOR, (err, decoded)=> {
            if (err) {
                next(new Error('Please Provide A token!'))
            }else{
                next()
            }
        });    
    }else {
        next(new Error('Please Provide A valid token!'));
      }    
}