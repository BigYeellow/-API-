const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = Schema({
    __v: {
        type: Number,
        select: false
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: true
    },
    avatarUrl: {
        type: String
    },
    gender: {
        type: String,
        enmu: ['male', 'female'],
        default: 'male',
        required: true
    },
    headline: {
        type: String
    },
    locations: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
        select: false
    },
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        select: false
    },
    employments: {
        type: [
            {
                company: {
                    type: Schema.Types.ObjectId,
                    ref: 'Topic'
                },
                job: {
                    type: Schema.Types.ObjectId,
                    ref: 'Topic'
                }
            }
        ],
        select: false
    },
    educations: {
        type: [
            {
                school: {
                    type: Schema.Types.ObjectId,
                    ref: 'Topic'
                },
                major: {
                    type: Schema.Types.ObjectId,
                    ref: 'Topic'
                },
                diploam: {  
                    type: Number,
                    enmu: [1, 2, 3, 4, 5]
                },
                entranceYear: {
                    type: Number
                },
                graduationYear:{
                    type: Number
                }
            }
        ],
        select: false
    },
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User'}],
        select: false
    },
    followingTopics: {
        type: [{ type: Schema.Types.ObjectId, ref: "Topic"}],
        select: false
    },
    likingAnswer: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Answer'}]
    },
    disLikingAnswer: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Answer'}]
    },
    collectingAnswer: {
        type: [{type: Schema.Types.ObjectId, ref: 'Answer'}]
    }
},{
    timestamps: true
})

module.exports = model('User', userSchema)