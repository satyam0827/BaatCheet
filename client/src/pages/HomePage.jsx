import React, { Suspense, lazy, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = lazy(() => import('../components/Sidebar'));
const ChatContainer = lazy(() => import('../components/ChatContainer'));
const NoChatSelected = lazy(() => import('../components/NoChatSelected'));

const HomePage = () => {
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { socket } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <Suspense fallback={<div className="flex h-full w-full items-center justify-center text-sm text-base-content/60">Loading chat...</div>}>
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default HomePage