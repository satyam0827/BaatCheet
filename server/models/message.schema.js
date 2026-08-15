import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    }
    ,
    forwardedFromMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    deliveredAt: {
        type: Date,
        default: null,
    },
    seenAt: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, seenAt: 1, deletedFor: 1 });
messageSchema.index({ senderId: 1, receiverId: 1, seenAt: 1, deletedFor: 1 });
messageSchema.index({ deletedFor: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;