const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const docDataSchema = new Schema({
  data: {
      type: Object,
    },
    doc: {
        type: Schema.Types.ObjectId,
        ref: 'Docs',
        required: "true"
    }
},{timestamps: true})


const DocData = mongoose.model('DocData', docsSchema)
module.exports = Docs;