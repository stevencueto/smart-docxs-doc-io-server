module.exports = (err, res, message) =>{
    console.error(err)
    return res.send({
        success: false,
        data: message,
    })
}