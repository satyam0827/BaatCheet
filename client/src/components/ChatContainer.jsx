import { useChatStore } from "../store/useChatStore";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import OptimizedImage from "./OptimizedImage";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageDateTime, formatMessageTime, formatMessageDate } from "../lib/utils";
import { Check, CheckCheck, Copy, Download, Forward, Info, MoreVertical, SendHorizonal, Trash2, X, ChevronLeft, ChevronRight, Search } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    isLoadingMoreMessages,
    hasMoreMessages,
    messagePage,
    selectedUser,
    users,
    deleteMessage,
    forwardMessage,
    markMessagesAsSeen,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const messageEndRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);
  const ignorePreviewCloseRef = useRef(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [detailsMessage, setDetailsMessage] = useState(null);
  const [forwardMessageItem, setForwardMessageItem] = useState(null);
  const [forwardReceiverId, setForwardReceiverId] = useState("");
  const [forwardSearch, setForwardSearch] = useState("");
  const [deleteMessageItem, setDeleteMessageItem] = useState(null);
  const [previewMessage, setPreviewMessage] = useState(null);

  useEffect(() => {
    const handleWindowClick = () => setActiveMessageMenu(null);
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      setActiveMessageMenu(null);
      setDetailsMessage(null);
      setForwardMessageItem(null);
      setDeleteMessageItem(null);
      setPreviewMessage(null);
    };

    window.addEventListener("click", handleWindowClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = previewMessage ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [previewMessage]);

  useEffect(() => {
    if (!selectedUser?._id) return;

    shouldScrollToBottomRef.current = true;
    getMessages(selectedUser._id, { page: 1, limit: 20 });
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    if (!messages.length) return;

    if (shouldScrollToBottomRef.current && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    shouldScrollToBottomRef.current = true;
  }, [messages]);

  useEffect(() => {
    markMessagesAsSeen(selectedUser._id);
  }, [messages, selectedUser._id, markMessagesAsSeen]);

  useEffect(() => {
    if (!forwardMessageItem) {
      setForwardReceiverId("");
      setForwardSearch("");
      return;
    }

    setForwardReceiverId("");
  }, [forwardMessageItem]);

  const forwardTargets = useMemo(
    () => {
      const searchValue = forwardSearch.trim().toLowerCase();

      return users
        .filter((user) => user._id !== selectedUser._id)
        .filter((user) => {
          if (!searchValue) return true;

          return user.fullName.toLowerCase().includes(searchValue);
        });
    },
    [users, selectedUser._id, forwardSearch],
  );

  const handleCopyMessage = async (message) => {
    try {
      if (message.image) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = message.image;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        
        if (blob) {
          const clipboardData = {
            [blob.type]: blob,
          };
          if (message.text) {
            clipboardData["text/plain"] = new Blob([message.text], { type: "text/plain" });
          }
          await navigator.clipboard.write([new ClipboardItem(clipboardData)]);
        }
      } else {
        await navigator.clipboard.writeText(message.text || "");
      }
    } catch (error) {
      console.error("Failed to copy message:", error);
      const content = [message.text, message.image ? message.image : null].filter(Boolean).join("\n");
      await navigator.clipboard.writeText(content || "");
    }
    setActiveMessageMenu(null);
  };

  const openMessageMenu = (event, messageId) => {
    event.stopPropagation();

    const triggerRect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 192;
    const menuHeight = 176;
    const viewportPadding = 8;

    let left = triggerRect.right - menuWidth;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuWidth - viewportPadding));

    let top = triggerRect.bottom + 8;
    if (top + menuHeight > window.innerHeight - viewportPadding) {
      top = triggerRect.top - menuHeight - 8;
    }

    setActiveMessageMenu({ messageId, top, left });
  };

  const handleForwardMessage = async (e) => {
    e.preventDefault();
    if (!forwardMessageItem || !forwardReceiverId) return;

    await forwardMessage({
      messageId: forwardMessageItem._id,
      receiverId: forwardReceiverId,
    });

    setForwardMessageItem(null);
    setForwardReceiverId("");
  };

  const handleDeleteMessage = async (scope) => {
    if (!deleteMessageItem) return;

    await deleteMessage(deleteMessageItem._id, scope);
    setDeleteMessageItem(null);
    setActiveMessageMenu(null);
  };

  const openImagePreview = (message) => {
    setPreviewMessage(message);
  };

  const handleLoadEarlierMessages = async () => {
    if (!selectedUser?._id || !hasMoreMessages || isLoadingMoreMessages) return;

    shouldScrollToBottomRef.current = false;
    await getMessages(selectedUser._id, {
      page: messagePage + 1,
      limit: 20,
    });
  };

  const getMessageTick = (message) => {
    if (message.seenAt) {
      return <CheckCheck className="size-4 text-sky-400" />;
    }

    if (message.deliveredAt) {
      return <CheckCheck className="size-4 text-base-content/80" />;
    }

    return <Check className="size-4 text-base-content/80" />;
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/40">
        {hasMoreMessages && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={handleLoadEarlierMessages}
              disabled={isLoadingMoreMessages}
              className="btn btn-sm btn-outline rounded-full px-4"
            >
              {isLoadingMoreMessages ? "Loading older messages..." : "Load earlier messages"}
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const showDateDivider =
            index === 0 ||
            new Date(message.createdAt).toDateString() !==
              new Date(messages[index - 1].createdAt).toDateString();

          return (
            <Fragment key={message._id}>
              {showDateDivider && (
                <div className="flex justify-center my-4">
                  <div className="bg-base-300/60 border border-base-300 backdrop-blur-sm text-base-content/70 font-medium text-[11px] uppercase tracking-wide px-3 py-1 rounded-full shadow-sm">
                    {formatMessageDate(message.createdAt)}
                  </div>
                </div>
              )}
              <div className={`chat chat-${message.senderId === authUser._id ? "end" : "start"} group`} ref={messageEndRef}>
                <div className=" chat-image avatar">
              <div className="size-10 rounded-full border overflow-hidden">
                <OptimizedImage
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic
                      : selectedUser.profilePic
                  }
                  alt="profile pic"
                  fallbackSrc="/profile.png"
                  className="size-full object-cover"
                />
              </div>
            </div>
            <div className="chat-header mb-1 flex items-center gap-2 text-base-content/80">
              <time className="text-xs opacity-60 ml-1">{formatMessageTime(message.createdAt)}</time>
              {message.forwardedFromMessageId && (
                <span className="badge badge-xs badge-ghost gap-1 text-[10px]">
                  <SendHorizonal className="size-3" /> Forwarded
                </span>
              )}
              <div className="relative opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(event) =>
                    activeMessageMenu?.messageId === message._id
                      ? setActiveMessageMenu(null)
                      : openMessageMenu(event, message._id)
                  }
                  className="btn btn-ghost btn-xs btn-circle border border-base-300/70 bg-base-100/90 shadow-sm"
                >
                  <MoreVertical className="size-4" />
                </button>
              </div>
            </div>
            <div className="chat-bubble flex flex-col relative shadow-sm border border-base-300/40 max-w-[min(36rem,80vw)]">
              {message.image && (
                <OptimizedImage
                  src={message.image}
                  alt="Attachment"
                  loading="lazy"
                  className="sm:max-w-[220px] rounded-md mb-2 border border-base-300/50 object-cover cursor-zoom-in hover:brightness-95 transition"
                  onClick={() => openImagePreview(message)}
                />
              )}
              {message.text && <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>}
              <div className="mt-2 flex items-center justify-end gap-1 text-[11px] opacity-90">
                {message.senderId === authUser._id && (
                  <>
                    {getMessageTick(message)}
                  </>
                )}
              </div>
            </div>
          </div>
            </Fragment>
          );
        })}
      </div>

      <MessageInput />

      {activeMessageMenu && (
        <div className="fixed inset-0 z-[70] pointer-events-none">
          <div
            className="pointer-events-auto absolute w-48 rounded-box border border-base-300 bg-base-100 shadow-2xl overflow-hidden"
            style={{ top: `${activeMessageMenu.top}px`, left: `${activeMessageMenu.left}px` }}
            onClick={(event) => event.stopPropagation()}
          >
            {messages
              .filter((message) => message._id === activeMessageMenu.messageId)
              .map((message) => (
                <div key={message._id}>
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(message)}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-base-200"
                  >
                    <Copy className="size-4" /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMessageMenu(null);
                      setForwardMessageItem(message);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-base-200"
                  >
                    <Forward className="size-4" /> Forward
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMessageMenu(null);
                      setDetailsMessage(message);
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-base-200"
                  >
                    <Info className="size-4" /> Details
                  </button>
                  {message.senderId === authUser._id && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMessageMenu(null);
                        setDeleteMessageItem(message);
                      }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-error hover:text-error-content"
                    >
                      <Trash2 className="size-4" /> Delete
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {detailsMessage && (
        <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetailsMessage(null)}>
          <div className="w-full max-w-md rounded-3xl bg-base-100 p-5 shadow-2xl border border-base-300/70" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">Message details</p>
                <h3 className="font-semibold text-lg mt-1">Delivery timeline</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetailsMessage(null)} type="button">
                Close
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-base-200/60 border border-base-300/60 p-3 text-sm">
              {detailsMessage.text ? <p className="whitespace-pre-wrap leading-relaxed">{detailsMessage.text}</p> : <p className="italic text-base-content/60">Image only message</p>}
              {detailsMessage.image && (
                <OptimizedImage
                  src={detailsMessage.image}
                  alt="Attachment"
                  loading="lazy"
                  className="mt-3 rounded-xl border border-base-300/60 max-h-56 object-cover"
                />
              )}
            </div>

            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl border border-base-300/60 p-3">
                <div className="text-base-content/60 text-xs uppercase tracking-wide">Sent</div>
                <div className="mt-1 font-medium">{formatMessageDateTime(detailsMessage.createdAt)}</div>
              </div>
              <div className="rounded-2xl border border-base-300/60 p-3">
                <div className="text-base-content/60 text-xs uppercase tracking-wide">Delivered</div>
                <div className="mt-1 font-medium">{detailsMessage.deliveredAt ? formatMessageDateTime(detailsMessage.deliveredAt) : "Not delivered yet"}</div>
              </div>
              <div className="rounded-2xl border border-base-300/60 p-3">
                <div className="text-base-content/60 text-xs uppercase tracking-wide">Seen</div>
                <div className="mt-1 font-medium">{detailsMessage.seenAt ? formatMessageDateTime(detailsMessage.seenAt) : "Not seen yet"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteMessageItem && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteMessageItem(null)}>
          <div className="w-full max-w-lg rounded-[2rem] bg-base-100 p-6 shadow-2xl border border-base-300/70" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">Delete message?</p>
              <h3 className="text-2xl font-semibold mt-2">Choose how to delete this message</h3>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleDeleteMessage("forEveryone")}
                className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-4 text-left transition-colors hover:bg-emerald-500/15"
              >
                <div className="text-lg font-semibold text-emerald-500">Delete for everyone</div>
                <div className="text-sm text-base-content/60 mt-1">
                  Remove this message for both sides.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteMessage("forMe")}
                className="w-full rounded-2xl border border-base-300 bg-base-200/60 px-4 py-4 text-left transition-colors hover:bg-base-200"
              >
                <div className="text-lg font-semibold">Delete for me</div>
                <div className="text-sm text-base-content/60 mt-1">
                  Remove this message only from your chat view.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeleteMessageItem(null)}
                className="w-full rounded-2xl border border-base-300 bg-base-100 px-4 py-4 text-left transition-colors hover:bg-base-200"
              >
                <div className="text-lg font-semibold">Cancel</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {forwardMessageItem && (
        <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setForwardMessageItem(null)}>
          <form onSubmit={handleForwardMessage} className="w-full max-w-md rounded-3xl bg-base-100 p-5 shadow-2xl border border-base-300/70" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-base-content/50">Forward message</p>
                <h3 className="font-semibold text-lg mt-1">Choose a chat</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setForwardMessageItem(null)} type="button">
                Close
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-base-300/60 p-3 text-sm bg-base-200/60 max-h-48 overflow-auto">
              {forwardMessageItem.text && <p className="whitespace-pre-wrap leading-relaxed">{forwardMessageItem.text}</p>}
              {forwardMessageItem.image && (
                <OptimizedImage
                  src={forwardMessageItem.image}
                  alt="Attachment"
                  loading="lazy"
                  className="mt-2 rounded-xl max-h-40 border border-base-300/60 object-cover"
                />
              )}
            </div>

            <label className="input input-bordered flex items-center gap-2 w-full rounded-2xl mb-4 bg-base-200/60">
              <Search className="size-4 text-base-content/50" />
              <input
                type="text"
                className="grow bg-transparent focus:outline-none"
                placeholder="Search people"
                value={forwardSearch}
                onChange={(e) => setForwardSearch(e.target.value)}
              />
            </label>

            <div className="max-h-80 overflow-y-auto rounded-3xl border border-base-300/60 bg-base-200/30 p-2 mb-4">
              {forwardTargets.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-base-content/60">
                  No contacts match this search.
                </div>
              ) : (
                forwardTargets.map((user) => {
                  const isSelected = forwardReceiverId === user._id;
                  const isOnline = onlineUsers.includes(user._id);

                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => setForwardReceiverId(user._id)}
                      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                        isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-base-100/70"
                      }`}
                    >
                      <div className="avatar">
                        <div className="size-12 rounded-full ring-2 ring-base-300 relative">
                          <OptimizedImage
                            src={user.profilePic}
                            alt={user.fullName}
                            fallbackSrc="/profile.png"
                            className="size-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-base-100 ${
                              isOnline ? "bg-green-500" : "bg-zinc-500"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{user.fullName}</p>
                          {isSelected && <Check className="size-5 text-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-base-content/60 mt-0.5">
                          {isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setForwardMessageItem(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary gap-2" disabled={!forwardReceiverId}>
                Forward
              </button>
            </div>
          </form>
        </div>
      )}

      {previewMessage && (() => {
        const imageMessages = messages.filter((m) => m.image);
        const currentIndex = imageMessages.findIndex((m) => m._id === previewMessage._id);
        const hasNext = currentIndex < imageMessages.length - 1;
        const hasPrev = currentIndex > 0;

        return (
          <div
            className="fixed inset-0 z-[110] bg-black/95 flex flex-col"
            onMouseDown={() => {
              ignorePreviewCloseRef.current = false;
              const dropdown = document.getElementById("preview-dropdown");
              if (dropdown && dropdown.contains(document.activeElement)) {
                ignorePreviewCloseRef.current = true;
              }
            }}
            onClick={() => {
              if (ignorePreviewCloseRef.current) {
                ignorePreviewCloseRef.current = false;
                return;
              }
              setPreviewMessage(null);
            }}
          >
            <div
              className="h-16 shrink-0 px-4 flex items-center justify-between border-b border-white/10 bg-black/70"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/10"
                  onClick={() => setPreviewMessage(null)}
                  aria-label="Close image preview"
                >
                  <X className="size-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {previewMessage.senderId === authUser._id ? "You" : selectedUser.fullName}
                  </p>
                  <p className="text-xs text-white/70 truncate">{formatMessageDateTime(previewMessage.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewMessage.image}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/10"
                  aria-label="Download image"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download className="size-5" />
                </a>

                <div id="preview-dropdown" className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/10">
                    <MoreVertical className="size-5" />
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[120] w-48 p-2 shadow text-base-content">
                    <li>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); handleCopyMessage(previewMessage); document.activeElement.blur(); }}>
                        <Copy className="size-4" /> Copy
                      </button>
                    </li>
                    <li>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); setPreviewMessage(null); setForwardMessageItem(previewMessage); }}>
                        <Forward className="size-4" /> Forward
                      </button>
                    </li>
                    <li>
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); setPreviewMessage(null); setDetailsMessage(previewMessage); }}>
                        <Info className="size-4" /> Details
                      </button>
                    </li>
                    {previewMessage.senderId === authUser._id && (
                      <li>
                        <button type="button" className="text-error hover:bg-error hover:text-error-content" onMouseDown={(e) => { e.preventDefault(); setPreviewMessage(null); setDeleteMessageItem(previewMessage); }}>
                          <Trash2 className="size-4" /> Delete
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div
              className="flex-1 min-h-0 relative flex items-center justify-center p-4 sm:p-8 group"
            >
              {hasPrev && (
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-10 md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewMessage(imageMessages[currentIndex - 1]);
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-8" />
                </button>
              )}

              <OptimizedImage
                key={previewMessage._id}
                src={previewMessage.image}
                alt="Chat image preview"
                loading="eager"
                className="max-w-full max-h-full object-contain select-none rounded-lg cursor-default"
                onClick={(e) => e.stopPropagation()}
              />

              {hasNext && (
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-10 md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewMessage(imageMessages[currentIndex + 1]);
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="size-8" />
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
export default ChatContainer;