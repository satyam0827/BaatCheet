import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:["http://localhost:5173"],
    }
)

export function getRecevierSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection",(socket)=>{
    console.log("A user connected", socket.id);

    //here we grab the userId sent from client
    const userId = socket.handshake.query.userId;
    if(userId)  userSocketMap[userId] = socket.id;

    //this sends userIds to the client i.e only keys
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("user disconnected!", socket.id);

        //here we delete the user id stored in userSocketMap object as the user disconnected;
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export {server,app,io};