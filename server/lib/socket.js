import express from "express";
import { Server } from "socket.io";
import http from "http";
import Message from "../models/message.schema.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:["http://localhost:5173",'https://baat-cheet-nine.vercel.app'],
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

    socket.on("message:delivered", async ({ messageId }) => {
        try {
            if (!messageId) return;

            const message = await Message.findById(messageId);
            if (!message || message.deliveredAt) return;

            message.deliveredAt = new Date();
            await message.save();

            const senderSocketId = getRecevierSocketId(message.senderId.toString());
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageStatusUpdated", {
                    messageId: message._id,
                    deliveredAt: message.deliveredAt,
                    seenAt: message.seenAt,
                });
            }
        } catch (error) {
            console.log("error in message:delivered socket handler", error.message);
        }
    });

    socket.on("messages:seen", async ({ conversationUserId }) => {
        try {
            if (!conversationUserId || !userId) return;

            const receiverId = userId;
            const now = new Date();
            const unseenMessages = await Message.find({
                senderId: conversationUserId,
                receiverId,
                seenAt: null,
            }).select("_id");

            if (!unseenMessages.length) return;

            const messageIds = unseenMessages.map((message) => message._id.toString());

            await Message.updateMany(
                {
                    senderId: conversationUserId,
                    receiverId,
                    seenAt: null,
                },
                {
                    $set: {
                        deliveredAt: now,
                        seenAt: now,
                    },
                }
            );

            const senderSocketId = getRecevierSocketId(conversationUserId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageStatusUpdated", {
                    messageIds,
                    deliveredAt: now,
                    seenAt: now,
                });
            }
        } catch (error) {
            console.log("error in messages:seen socket handler", error.message);
        }
    });
})

export {server,app,io};