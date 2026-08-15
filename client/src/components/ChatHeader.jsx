import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import OptimizedImage from "./OptimizedImage";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-3 border-b border-base-300 bg-base-100/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-11 rounded-full relative ring-2 ring-base-300 overflow-hidden">
              <OptimizedImage
                src={selectedUser.profilePic}
                alt={selectedUser.fullName}
                fallbackSrc="/avatar.png"
                className="size-full object-cover"
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold leading-tight">{selectedUser.fullName}</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-sm btn-circle" aria-label="Close chat">
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;