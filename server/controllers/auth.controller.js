import User from "../models/user.schema.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js"

export const signUp = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are requried!" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be of atleast 6 characters" })
        }

        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) return res.status(400).json({ message: "user Already Exist!" })

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPass
        })

        if (newUser) {
            //generate token
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: fullName,
                email: email,
                profilePic: newUser.profilePic,
                message:"Account created successfully!"
            })

        } else {
            return res.status(400).json({ message: "Invalid user Data!" });
        }

    } catch (error) {
        console.log("Error in signUp controller!", error.message);
        return res.status(500).json({ message: "Internal server error!" })
    }
}

//login controller
export const logIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter the email and password!" });
        }
        const userExist = await User.findOne({ email });
        if (!userExist) return res.status(404).json({ message: "user with this email doesn't exist!" })

        const isPasswordCorrect = await bcrypt.compare(password, userExist.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials!" })
        }
        // console.log(res);
        generateToken(userExist._id, res);

        res.status(200).json({
            _id: userExist.id,
            fullName: userExist.fullName,
            email: userExist.email,
            profilePic: userExist.profilePic,
            message:"logged in!"
        })
        console.log("logged In!")
        
    } catch (error) {
        console.log("error in login controller!", error.message)
        return res.status(500).json({ message: "Internal server error!" })
    }
}

export const logOut = async (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully!" });
        console.log("logged Out!")
      } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    
    try {
        const {profilePic} = req.body
        const userId = req.user._id
        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required!"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic); 
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
        
        res.status(200).json({success:true,message:"image uploaded!",updatedUser});
    } catch (error) {
        console.log("Error in uploading Profile Photo!")
         res.status(500).json({message:"Internal server error!"});
        }
}

export const checkAuth = async (req, res) => {

    try {   
        res.status  (200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller!")
        res.status(500).json({message:"Internal server error!"})
    }
    
}