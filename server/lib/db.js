import mongoose from "mongoose"

export const connectDB = async ()=>{
    try {
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/ApnaAdda`)
        console.log("Database Connected!",response.connection.host)
        
    } catch (error) {
        console.log("error in connecting to the database!",error)
    }
}

