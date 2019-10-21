const mongoose = require('mongoose')
const { Schema, model } = mongoose

const questionSchema = new Schema({
    __V:{
        type:Number,
        select: false
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        select: false
    },
    questioner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        select: false
    },
    topic:{
        type:[{type: Schema.Types.ObjectId, select: false}]
    }
},{
    timestamps: true
})

module.exports = model('Question', questionSchema)