const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const userShema = new mongoose.Schema({
    userName: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: { type: String ,  required: true },
    password: { type: String },
    phone: String,
    age: Number,
    gender: { type: String, default: "Male" },
    confirmed: {type:Boolean , default :false},
    role: {type:String , default :'User'},
    shareProfileLink: String,
    profilePic: String,
    coverPic: Array,
    socialLinks: Array,
    gallery: Array,
    follower:Array,
    accountSatus:{type:String , default:'offline'},
    pdfLink:String,
    story :Array

}, {
    timestamps: true
})


userShema.pre("save" , async function(next){

    this.password = await  bcrypt.hash(this.password , parseInt(process.env.SALT))
    next();

})
const userModel = mongoose.model('User' , userShema)

module.exports = userModel