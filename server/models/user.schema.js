import mongoose from "mongoose"
//user schema with fields fullname, email, password and profilepic

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true,
        minlength: 6
    },
    profilePic:{
        type: String,
        default:""
    }

},{timestamps:true});

//NOTE:---
//while exporting the model mongoose expect you to enter model name as in singular form and first letter in upperCase
//mongoose automatically converts  in lowercase and in plural form i.e User --> users
//--------
const User = mongoose.model("User",userSchema);
export default User; 