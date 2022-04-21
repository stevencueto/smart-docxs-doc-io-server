const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const docDataSchema = new Schema({
    data: {
      type: Object,
    },
    _id: {
       type: String,
  }
    // doc: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Docs',
    // }
},{timestamps: true})


const DocData = mongoose.model('DocData', docDataSchema)
module.exports = DocData;