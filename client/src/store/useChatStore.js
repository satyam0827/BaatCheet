import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const toMillis = (value) => (value ? new Date(value).getTime() : 0);

const sortUsersByRecent = (users) => {
    return [...users].sort((a, b) => toMillis(b.lastMessageAt) - toMillis(a.lastMessageAt));
};

const mergeIncomingMessageToUsers = ({ users, message, selectedUserId }) => {
    const senderId = message.senderId?.toString?.() || String(message.senderId);
    const receiverId = message.receiverId?.toString?.() || String(message.receiverId);
    const targetUserId = selectedUserId === senderId ? senderId : senderId;

    const updatedUsers = users.map((user) => {
        if (user._id !== targetUserId) return user;

        const shouldIncrementUnread = selectedUserId !== senderId;
        return {
            ...user,
            lastMessageAt: message.createdAt,
            unreadCount: shouldIncrementUnread ? (user.unreadCount || 0) + 1 : 0,
        };
    });

    return sortUsersByRecent(updatedUsers);
};

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: sortUsersByRecent(res.data) });
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false });
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`messages/send/${selectedUser._id}`, messageData);
            const updatedUsers = sortUsersByRecent(
                get().users.map((user) =>
                    user._id === selectedUser._id
                        ? { ...user, lastMessageAt: res.data.createdAt }
                        : user
                )
            );

            set({ messages: [...messages, res.data], users: updatedUsers })
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },
    deleteMessage: async (messageId, scope = "forMe") => {
        try {
            await axiosInstance.delete(`/messages/${messageId}`, {
                data: { scope },
            });
            set({ messages: get().messages.filter((message) => message._id !== messageId) });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete message");
        }
    },
    forwardMessage: async ({ messageId, receiverId }) => {
        try {
            const res = await axiosInstance.post(`/messages/forward`, { messageId, receiverId });
            const { selectedUser, messages } = get();
            if (selectedUser?._id === receiverId) {
                set({ messages: [...messages, res.data] });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to forward message");
        }
    },
    markMessagesAsSeen: (conversationUserId) => {
        const socket = useAuthStore.getState().socket;
        if (!socket || !conversationUserId) return;
        socket.emit("messages:seen", { conversationUserId });

        set({
            users: get().users.map((user) =>
                user._id === conversationUserId ? { ...user, unreadCount: 0 } : user
            ),
        });
    },
    subscribeToMessages: async () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.off("messageStatusUpdated");
        socket.off("messageDeleted");

        socket.on("newMessage", (newMessage) => {
            const selectedUserId = get().selectedUser?._id;
            const senderId = newMessage.senderId?.toString?.() || String(newMessage.senderId);
            const isMessageForOpenConversation = selectedUserId && senderId === selectedUserId;

            if (isMessageForOpenConversation) {
                set({
                    messages: [...get().messages, newMessage],
                });
                socket.emit("message:delivered", { messageId: newMessage._id });
            }

            set({
                users: mergeIncomingMessageToUsers({
                    users: get().users,
                    message: newMessage,
                    selectedUserId,
                }),
            });
        })

        socket.on("messageStatusUpdated", (statusUpdate) => {
            const { messageId, messageIds = [], deliveredAt, seenAt } = statusUpdate;
            set({
                messages: get().messages.map((message) => {
                    const currentMessageId = message._id?.toString?.() || String(message._id);
                    const singleMessageId = messageId?.toString?.() || String(messageId || "");
                    const manyMessageIds = messageIds.map((id) => id?.toString?.() || String(id));
                    const isMatched = messageId
                        ? currentMessageId === singleMessageId
                        : manyMessageIds.includes(currentMessageId);

                    if (!isMatched) return message;

                    return {
                        ...message,
                        deliveredAt: deliveredAt || message.deliveredAt,
                        seenAt: seenAt || message.seenAt,
                    };
                }),
            });
        });

        socket.on("messageDeleted", ({ messageId }) => {
            const deletedMessageId = messageId?.toString?.() || String(messageId);
            set({
                messages: get().messages.filter((message) => (message._id?.toString?.() || String(message._id)) !== deletedMessageId),
            });
        });
    },
    unsubscribeFromMessages: async () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messageStatusUpdated");
        socket.off("messageDeleted");
    },
    setSelectedUser: (selectedUser) =>
        set({
            selectedUser,
            users: get().users.map((user) =>
                user._id === selectedUser?._id ? { ...user, unreadCount: 0 } : user
            ),
        })
}))