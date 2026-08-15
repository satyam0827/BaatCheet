import cloudinary from "../lib/cloudinary.js";
import { getRecevierSocketId,io } from "../lib/socket.js";
import Message from "../models/message.schema.js"
import User from "../models/user.schema.js";

//every user but now ourself
export const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password").lean();

        if (!filteredUsers.length) {
            return res.status(200).json([]);
        }

        const userIds = filteredUsers.map((user) => user._id);

        const messageMeta = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: loggedInUserId, receiverId: { $in: userIds } },
                        { senderId: { $in: userIds }, receiverId: loggedInUserId },
                    ],
                    deletedFor: { $ne: loggedInUserId },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", loggedInUserId] },
                            "$receiverId",
                            "$senderId",
                        ],
                    },
                    lastMessageAt: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiverId", loggedInUserId] },
                                        { $eq: ["$seenAt", null] },
                                        { $not: { $in: [loggedInUserId, "$deletedFor"] } },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        const messageMetaMap = new Map(
            messageMeta.map((meta) => [meta._id.toString(), meta])
        );

        const usersWithMessageMeta = filteredUsers
            .map((user) => {
                const meta = messageMetaMap.get(user._id.toString());

                return {
                    ...user,
                    unreadCount: meta?.unreadCount || 0,
                    lastMessageAt: meta?.lastMessageAt || null,
                };
            })
            .sort((a, b) => {
                const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
                const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
                return timeB - timeA;
            });

        res.status(200).json(usersWithMessageMeta);
    } catch (error) {
        console.log("error in getUsersforsidebar controller", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const query = {
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
            deletedFor: { $ne: myId },
        };

        const [messages, totalMessages] = await Promise.all([
            Message.find(query)
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit),
            Message.countDocuments(query),
        ]);

        const totalPages = Math.max(1, Math.ceil(totalMessages / limit));

        res.status(200).json({
            messages,
            pagination: {
                page,
                limit,
                totalMessages,
                totalPages,
                hasMore: page < totalPages,
            },
        });
    } catch (error) {
        console.log("error in getmessages controller!", error.message);
        res.status(500).json({ message: "Internal server error!" });
    }
}

export const sendMessage = async (req, res) => {
    try {
      const { text, image } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;
      let imageUrl;

      if (image) {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
  
      const receiverSocketId = getRecevierSocketId(receiverId);
      const deliveredAt = receiverSocketId ? new Date() : null;

      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
        deliveredAt,
      });

      console.log("you reached here!")
      await newMessage.save();
  
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      const senderSocketId = getRecevierSocketId(senderId.toString());
      if (senderSocketId && deliveredAt) {
        io.to(senderSocketId).emit("messageStatusUpdated", {
          messageId: newMessage._id,
          deliveredAt,
          seenAt: null,
        });
      }
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.log("Error in sendMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  export const deleteMessage = async (req, res) => {
    try {
      const { id: messageId } = req.params;
      const { scope } = req.body;
      const myId = req.user._id;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      const deleteScope = scope === "forEveryone" ? "forEveryone" : "forMe";
      const isSender = message.senderId.toString() === myId.toString();

      if (deleteScope === "forEveryone") {
        if (!isSender) {
          return res.status(403).json({ message: "Only the sender can delete for everyone" });
        }

        await Message.deleteOne({ _id: messageId });

        const payload = { messageId, scope: deleteScope };
        const senderSocketId = getRecevierSocketId(message.senderId.toString());
        const receiverSocketId = getRecevierSocketId(message.receiverId.toString());

        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDeleted", payload);
        }

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageDeleted", payload);
        }

        return res.status(200).json({ message: "Message deleted for everyone", messageId, scope: deleteScope });
      }

      if (message.deletedFor?.some((userId) => userId.toString() === myId.toString())) {
        return res.status(200).json({ message: "Message already deleted for you", messageId, scope: deleteScope });
      }

      await Message.updateOne(
        { _id: messageId },
        {
          $addToSet: {
            deletedFor: myId,
          },
        }
      );

      const payload = { messageId, scope: deleteScope };
      const mySocketId = getRecevierSocketId(myId.toString());
      if (mySocketId) {
        io.to(mySocketId).emit("messageDeleted", payload);
      }

      res.status(200).json({ message: "Message deleted for you", messageId, scope: deleteScope });
    } catch (error) {
      console.log("Error in deleteMessage controller: ", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  export const forwardMessage = async (req, res) => {
    try {
      const { messageId, receiverId } = req.body;
      const senderId = req.user._id;

      if (!messageId || !receiverId) {
        return res.status(400).json({ message: "messageId and receiverId are required" });
      }

      const sourceMessage = await Message.findById(messageId);
      if (!sourceMessage) {
        return res.status(404).json({ message: "Source message not found" });
      }

      const canForward =
        sourceMessage.senderId.toString() === senderId.toString() ||
        sourceMessage.receiverId.toString() === senderId.toString();

      if (!canForward) {
        return res.status(403).json({ message: "You cannot forward this message" });
      }

      const forwardedMessage = new Message({
        senderId,
        receiverId,
        text: sourceMessage.text,
        image: sourceMessage.image,
        forwardedFromMessageId: sourceMessage._id,
      });

      await forwardedMessage.save();

      const receiverSocketId = getRecevierSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", forwardedMessage);
      }

      res.status(201).json(forwardedMessage);
    } catch (error) {
      console.log("Error in forwardMessage controller: ", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };