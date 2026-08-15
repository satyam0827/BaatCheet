import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        mongoose.set("strictQuery", true);

        await mongoose.connect(`${process.env.MONGODB_URI}/ApnaAdda`, {
            maxPoolSize: 20,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
    } catch (error) {
        console.log("error in connecting to the database!", error);
    }
};

