import epxress, { json } from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js"
import cors from "cors"
import { app ,server} from "./lib/socket.js";
import path from "path"

dotenv.config();

const PORT = process.env.PORT;
app.use(epxress.json({limit: "10mb"} ));

app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)

server.listen(PORT,()=>{
    console.log(`your server is running on http://localhost:${PORT}`)
    connectDB();
})