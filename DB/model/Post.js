const mongoose = require('mongoose');
const replySchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    desc: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    images: Array
}, {
    timestamps: true
})

const commentSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    desc: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted:{type:Boolean , default:false},
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt:String,
    images: Array,
    reply: [replySchema]
}, {
    timestamps: true
})
const postShema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    desc: String,
    images: Array,
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comment: [commentSchema],
    isBlooked:{type:Boolean , default:false}


}, {
    timestamps: true
})

const postModel = mongoose.model('Post', postShema)

module.exports = postModel