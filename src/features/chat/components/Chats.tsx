import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Forward,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  Phone,
  Pin,
  Plus,
  Search,
  Send,
  Smile,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState, PanelSkeleton } from "@/shared/ui/state";
import { cn } from "@/shared/lib/utils";
import { notifier } from "@/shared/lib/format";
import {
  useDeleteChatMessage,
  useEditChatMessage,
  useForwardChatMessage,
  useGetAvailableUsers,
  useGetConversations,
  useGetMessages,
  useMarkConversationRead,
  useOpenDirectConversation,
  useSendMessage,
  useSyncCurrentUser,
  useToggleMessagePin,
  useToggleMessageReaction,
} from "@/shared/api/hooks";
import { ChatAttachment, ChatConversation, ChatMessage, ChatUser, objectType } from "@/shared/types/marketplace";

type SocketLike = {
  emit: (event: string, payload?: unknown) => void;
  on: <Payload = unknown>(event: string, handler: (payload: Payload) => void) => void;
  off: <Payload = unknown>(event: string, handler?: (payload: Payload) => void) => void;
  disconnect: () => void;
};

type DateLabelRow = { _id: string; type: "label"; label: string };
type MessageRow = ChatMessage | DateLabelRow;

declare global {
  interface Window {
    io?: (url: string, options: { auth: { token: string | null }; transports?: string[] }) => SocketLike;
  }
}

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "👏"];
const pickerEmojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
  "😊", "😍", "😘", "😎", "🥳", "😮", "😢", "😭",
  "😡", "👍", "👎", "👏", "🙏", "💪", "👌", "🤝",
  "❤️", "💙", "💚", "🔥", "🎉", "✨", "⭐", "💯",
  "🚗", "🚙", "🏎️", "💰", "✅", "❌", "📍", "📞",
];
const editWindowMs = 12 * 60 * 60 * 1000;
const defaultUserImage = "/assets/images/default_user_image.png";

const normalizeId = (value?: string | number | null) => (value === undefined || value === null ? "" : String(value));
const isDateLabelRow = (row: MessageRow): row is DateLabelRow => "type" in row && row.type === "label";

const getSocketUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/";
  return new URL(apiBaseUrl).origin;
};

const loadSocketClient = (socketUrl: string) => {
  if (window.io) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-socket-io-client="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Socket client failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `${socketUrl}/socket.io/socket.io.js`;
    script.async = true;
    script.dataset.socketIoClient = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Socket client failed to load"));
    document.head.appendChild(script);
  });
};

const getOtherMember = (conversation?: ChatConversation, currentAppUserId?: number | string) => {
  return conversation?.members.find((member) => member.appUserId !== currentAppUserId) || conversation?.members[0];
};

const formatFileSize = (bytes = 0) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const getFileNameFromUrl = (url = "") => {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "attachment");
  } catch {
    return "attachment";
  }
};

const downloadAttachment = async (attachment: ChatAttachment) => {
  const response = await fetch(attachment.url, { mode: "cors" });
  if (!response.ok) throw new Error("Unable to download attachment");

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = attachment.name || getFileNameFromUrl(attachment.url);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

const getDateLabel = (dateValue: string) => {
  const date = new Date(dateValue);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const formatBubbleTime = (dateValue: string) =>
  new Date(dateValue).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const formatChatListTime = (dateValue?: string) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const formatLastSeenText = (dateValue?: string | null) => {
  if (!dateValue) return "Offline";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Offline";
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = date.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (date.toDateString() === now.toDateString()) return time;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
};

const canEditMessage = (message: ChatMessage) => {
  const sentAt = new Date(message.createdAt).getTime();
  return Number.isFinite(sentAt) && Date.now() - sentAt <= editWindowMs;
};

const buildMessageRows = (messages: ChatMessage[]): MessageRow[] => {
  const rows: MessageRow[] = [];
  let currentLabel = "";
  messages.forEach((message) => {
    const label = getDateLabel(message.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      rows.push({ _id: `label-${label}-${message._id}`, type: "label", label });
    }
    rows.push(message);
  });
  return rows;
};

const getMessagePreview = (message?: ChatMessage | null) => {
  if (!message) return "Conversation opened";
  if (message.deletedForEveryone) return "This message was deleted";
  if (message.text) return message.text;
  const firstAttachment = message.attachments?.[0];
  if (!firstAttachment) return "Attachment";
  return `${firstAttachment.type[0].toUpperCase()}${firstAttachment.type.slice(1)} attachment`;
};

const getPinnedMessagePreview = (message?: ChatMessage) => {
  if (!message) return "";
  if (message.deletedForEveryone) return "This message was deleted";
  if (message.text) return message.text;
  return message.attachments?.[0]?.name || "Attachment";
};

const groupReactions = (reactions: ChatMessage["reactions"] = []) =>
  reactions.reduce<Record<string, ChatMessage["reactions"]>>((groups, reaction) => {
    groups[reaction.emoji] = [...(groups[reaction.emoji] || []), reaction];
    return groups;
  }, {});

const PrivateMessageStatusIcon = ({ status, compact = false }: { status: "sent" | "delivered" | "read"; compact?: boolean }) => {
  const size = compact ? "size-3.5" : "size-4";

  if (status === "read") {
    return <CheckCheck className={cn(size, "shrink-0 text-blue-600")} aria-label="Read" />;
  }

  if (status === "delivered") {
    return <CheckCheck className={cn(size, "shrink-0 text-slate-400")} aria-label="Delivered" />;
  }

  return <Check className={cn(size, "shrink-0 text-slate-400")} aria-label="Sent" />;
};

const getOverlayPlacement = (trigger: HTMLElement | null, overlayHeight = 300) => {
  const bubble = trigger?.closest?.("[data-message-bubble]") || trigger;
  const rect = bubble?.getBoundingClientRect?.();
  if (!rect) return "down";

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;

  return spaceBelow < overlayHeight && spaceAbove > spaceBelow ? "up" : "down";
};

const EmojiPickerGrid = ({ onSelect }: { onSelect: (emoji: string) => void }) => (
  <div className="grid w-[280px] grid-cols-8 gap-1 rounded-lg border border-slate-200 bg-white p-3 shadow-2xl">
    {pickerEmojis.map((emoji) => (
      <button
        key={emoji}
        type="button"
        onClick={() => onSelect(emoji)}
        className="grid size-8 place-items-center rounded-md text-lg transition hover:bg-slate-100"
      >
        {emoji}
      </button>
    ))}
  </div>
);

const Avatar = ({ user, size = "md", online }: { user?: ChatUser | objectType | null; size?: "sm" | "md" | "lg"; online?: boolean }) => {
  const rawUser = user as (ChatUser & { image?: string | null }) | undefined | null;
  const imageUrl =
    typeof rawUser?.imageUrl === "string"
      ? rawUser.imageUrl
      : typeof rawUser?.image === "string"
        ? rawUser.image
        : undefined;
  const name = typeof user?.name === "string" ? user.name : "User";
  const sizeClass = size === "lg" ? "size-12" : size === "sm" ? "size-9" : "size-10";

  return (
    <span className={cn("relative inline-flex flex-none items-center justify-center", sizeClass)}>
      <img src={imageUrl || defaultUserImage} alt={name} className="h-full w-full rounded-full object-cover" />
      {online !== undefined && (
        <span className={cn("absolute bottom-0 right-0 size-3 rounded-full border-2 border-white", online ? "bg-emerald-500" : "bg-slate-300")} />
      )}
    </span>
  );
};

const MediaPreviewModal = ({ attachment, onClose }: { attachment: ChatAttachment | null; onClose: () => void }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  if (!attachment) return null;

  const name = attachment.name || "Preview";
  const size = formatFileSize(attachment.size);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadAttachment(attachment);
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur" onMouseDown={onClose}>
      <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-950">{name}</h3>
            <p className="text-xs text-slate-500">{size || attachment.mimeType || "Attachment"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={handleDownload} disabled={isDownloading} className="rounded-md">
              {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-md">
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-950 p-4">
          {attachment.type === "image" && <img src={attachment.url} alt={name} className="max-h-full max-w-full rounded-lg object-contain" />}
          {attachment.type === "video" && <video src={attachment.url} controls autoPlay className="max-h-full max-w-full rounded-lg bg-black" />}
          {attachment.type === "audio" && (
            <div className="w-full max-w-xl rounded-lg bg-white p-6 text-center">
              <Mic className="mx-auto mb-4 size-10 text-blue-600" />
              <h4 className="truncate text-base font-bold text-slate-950">{name}</h4>
              <audio src={attachment.url} controls autoPlay className="mt-5 w-full" />
            </div>
          )}
          {attachment.type === "file" && attachment.mimeType === "application/pdf" && (
            <iframe title={name} src={attachment.url} className="h-full min-h-[65vh] w-full rounded-lg border border-slate-200 bg-white" />
          )}
          {attachment.type === "file" && attachment.mimeType !== "application/pdf" && (
            <div className="flex max-w-md flex-col items-center rounded-lg bg-white p-8 text-center">
              <FileText className="mb-4 size-12 text-blue-600" />
              <h4 className="max-w-full truncate text-base font-bold text-slate-950">{name}</h4>
              <p className="mt-2 text-sm text-slate-500">This file type cannot be previewed inline.</p>
              <Button type="button" onClick={handleDownload} disabled={isDownloading} className="mt-5 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Download file
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const MessageAttachment = ({ attachment, own, onPreview }: { attachment: ChatAttachment; own: boolean; onPreview: (attachment: ChatAttachment) => void }) => {
  if (attachment.type === "image") {
    return (
      <button type="button" onClick={() => onPreview(attachment)} className="mt-2 block overflow-hidden rounded-md text-left">
        <img src={attachment.url} alt={attachment.name || "attachment"} className="max-h-72 rounded-md object-cover transition hover:brightness-105" />
      </button>
    );
  }

  if (attachment.type === "video") {
    return (
      <button type="button" onClick={() => onPreview(attachment)} className="relative mt-2 block overflow-hidden rounded-md text-left">
        <video src={attachment.url} className="max-h-72 w-full rounded-md bg-black" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-sm font-semibold text-white">Preview video</span>
      </button>
    );
  }

  const Icon = attachment.type === "audio" ? Mic : attachment.type === "file" ? FileText : ImageIcon;
  return (
    <button
      type="button"
      onClick={() => onPreview(attachment)}
      className={cn(
        "mt-2 flex w-full max-w-sm items-center gap-3 rounded-md border px-3 py-2 text-left transition",
        own ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-slate-200 bg-slate-50 hover:bg-white"
      )}
    >
      <Icon className="size-5" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{attachment.name || "Attachment"}</span>
        <span className={cn("block text-xs", own ? "text-white/70" : "text-slate-500")}>{formatFileSize(attachment.size) || attachment.mimeType || "Tap to preview"}</span>
      </span>
      <Download className="size-4" />
    </button>
  );
};

const Chats = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState(searchParams.get("conversationId") || "");
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [openedConversation, setOpenedConversation] = useState<ChatConversation | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, ChatUser>>({});
  const [typingDots, setTypingDots] = useState(".");
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [lastSeenByUser, setLastSeenByUser] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState("");
  const [actionMenuPlacement, setActionMenuPlacement] = useState<"up" | "down">("down");
  const [reactionTrayId, setReactionTrayId] = useState("");
  const [reactionEmojiPickerId, setReactionEmojiPickerId] = useState("");
  const [reactionPickerPlacement, setReactionPickerPlacement] = useState<"up" | "down">("down");
  const [reactionDetailsMessage, setReactionDetailsMessage] = useState<ChatMessage | null>(null);
  const [isPinnedListOpen, setIsPinnedListOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
  const [selectedForwardIds, setSelectedForwardIds] = useState<Array<string | number>>([]);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<ChatAttachment | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const openedRecipientRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const contactsScrollRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<SocketLike | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const selectedConversationIdRef = useRef("");
  const currentAppUserIdRef = useRef<string | number | undefined>(undefined);
  const markReadRef = useRef<ReturnType<typeof useMarkConversationRead> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const cursorRef = useRef(0);

  const { data: profileData } = useSyncCurrentUser();
  const currentUser = profileData?.user;
  const currentAppUserId = currentUser?.appUserId;
  const { data: availableUsers, isLoading: contactsLoading, isError: contactsError, refetch: refetchContacts } = useGetAvailableUsers(user?.id);
  const { data: conversationsData, isLoading: conversationsLoading, isError: conversationsError, refetch: refetchConversations } = useGetConversations();
  const { data: messagesData, isLoading: messagesLoading, isError: messagesError, refetch: refetchMessages } = useGetMessages(selectedConversationId);
  const openDirectConversation = useOpenDirectConversation();
  const sendMessage = useSendMessage();
  const editMessage = useEditChatMessage();
  const forwardMessage = useForwardChatMessage();
  const markRead = useMarkConversationRead();
  const deleteMessage = useDeleteChatMessage();
  const toggleReaction = useToggleMessageReaction();
  const togglePin = useToggleMessagePin();

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    currentAppUserIdRef.current = currentAppUserId;
  }, [currentAppUserId]);

  useEffect(() => {
    markReadRef.current = markRead;
  }, [markRead]);

  const conversations = conversationsData?.conversations || [];
  const listConversation = conversations.find((conversation) => conversation._id === selectedConversationId);
  const selectedConversation = listConversation || (openedConversation && openedConversation._id === selectedConversationId ? openedConversation : undefined);
  const selectedRecipient = getOtherMember(selectedConversation, currentAppUserId);
  const selectedRecipientIds = selectedConversation?.members.filter((member) => member.appUserId !== currentAppUserId).map((member) => member.appUserId) || [];
  const messages = messagesData?.messages || [];
  const messageRows = useMemo(() => buildMessageRows(messages), [messages]);

  const selectedRecipientOnline = selectedRecipient?.appUserId ? onlineUserIds.includes(String(selectedRecipient.appUserId)) : false;
  const selectedRecipientTyping = Boolean(typingUsers[selectedConversationId]);
  const selectedRecipientLastSeen = selectedRecipient?.appUserId ? lastSeenByUser[String(selectedRecipient.appUserId)] || selectedRecipient.lastSeen : "";
  const presenceText = selectedRecipientTyping
    ? `Typing${typingDots}`
    : selectedRecipientOnline
      ? "Online"
      : formatLastSeenText(selectedRecipientLastSeen);

  const contacts = useMemo(() => {
    const list = Array.isArray(availableUsers) ? availableUsers : [];
    return list.filter((contact: objectType) => {
      const value = `${contact.name || ""} ${contact.email || ""}`.toLowerCase();
      return value.includes(contactSearch.toLowerCase());
    });
  }, [availableUsers, contactSearch]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const recipient = getOtherMember(conversation, currentAppUserId);
      const text = [recipient?.name, recipient?.email, conversation.lastMessage?.text].filter(Boolean).join(" ").toLowerCase();
      return text.includes(chatSearch.trim().toLowerCase());
    });
  }, [chatSearch, conversations, currentAppUserId]);

  const pinnedMessages = useMemo(() => {
    if (!currentAppUserId) return [];
    return messages
      .filter((message) => !message.deletedForEveryone && message.pinnedBy?.some((member) => normalizeId(member) === String(currentAppUserId)))
      .sort((a, b) => new Date(b.editedAt || b.createdAt).getTime() - new Date(a.editedAt || a.createdAt).getTime());
  }, [currentAppUserId, messages]);

  const getMessageStatus = (message?: ChatMessage, recipient?: ChatUser): "sent" | "delivered" | "read" => {
    if (!message || !recipient?.appUserId) return "sent";
    if ((message.readBy || []).map(String).includes(String(recipient.appUserId))) return "read";
    if (onlineUserIds.includes(String(recipient.appUserId))) return "delivered";
    return "sent";
  };

  useEffect(() => {
    const interval = window.setInterval(() => setTypingDots((current) => (current.length >= 3 ? "." : `${current}.`)), 450);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const connectSocket = async () => {
      if (!user?.id) return;
      try {
        const socketUrl = getSocketUrl();
        await loadSocketClient(socketUrl);
        if (cancelled || !window.io) return;

        const token = await getToken();
        const socket = window.io(socketUrl, { auth: { token }, transports: ["websocket", "polling"] });
        socketRef.current = socket;

        const handleNewMessage = ({ message, conversationId }: { message: ChatMessage; conversationId: string }) => {
          queryClient.setQueryData<{ messages: ChatMessage[]; hasMore: boolean }>(["chatMessages", conversationId], (current) => {
            if (!current) return current;
            if (current.messages.some((item) => item._id === message._id)) return current;
            return { ...current, messages: [...current.messages, message] };
          });
          queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
          if (conversationId === selectedConversationIdRef.current && String(message.sender?.appUserId) !== String(currentAppUserIdRef.current)) {
            markReadRef.current?.mutate(conversationId);
          }
        };

        const handleUpdatedMessage = ({ message, conversationId }: { message: ChatMessage; conversationId: string }) => {
          queryClient.setQueryData<{ messages: ChatMessage[]; hasMore: boolean }>(["chatMessages", conversationId], (current) => {
            if (!current) return current;
            return { ...current, messages: current.messages.map((item) => (item._id === message._id ? message : item)) };
          });
          queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
        };

        const refreshConversation = (payload?: { conversationId?: string }) => {
          queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
          const conversationId = payload?.conversationId || selectedConversationIdRef.current;
          if (conversationId) queryClient.invalidateQueries({ queryKey: ["chatMessages", conversationId] });
        };

        socket.on("message:new", handleNewMessage);
        socket.on("message:updated", handleUpdatedMessage);
        socket.on("message:read", refreshConversation);
        socket.on("conversation:updated", refreshConversation);
        socket.on("typing:start", ({ conversationId, user: typingUser }: { conversationId: string; user: ChatUser }) => {
          setTypingUsers((current) => ({ ...current, [conversationId]: typingUser }));
        });
        socket.on("typing:stop", ({ conversationId }: { conversationId: string }) => {
          setTypingUsers((current) => {
            const next = { ...current };
            delete next[conversationId];
            return next;
          });
        });
        socket.on("online-users", (payload: string[] | { userIds?: string[] }) => {
          setOnlineUserIds(Array.isArray(payload) ? payload.map(String) : (payload.userIds || []).map(String));
        });
        socket.on("presence:online", (payload: string[] | { userIds?: string[] }) => {
          setOnlineUserIds(Array.isArray(payload) ? payload.map(String) : (payload.userIds || []).map(String));
        });
        socket.on("presence:lastSeen", ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
          setLastSeenByUser((current) => ({ ...current, [String(userId)]: lastSeen }));
        });
        socket.emit("presence:get");
      } catch (error) {
        console.error("Unable to connect realtime chat:", error);
      }
    };

    connectSocket();
    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [getToken, queryClient, user?.id]);

  useEffect(() => {
    if (!selectedConversationId || !socketRef.current) return;
    setIsPinnedListOpen(false);
    socketRef.current.emit("conversation:join", selectedConversationId);
    markRead.mutate(selectedConversationId);
    return () => socketRef.current?.emit("conversation:leave", selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!openedConversation) return;
    const freshConversation = conversations.find((conversation) => conversation._id === openedConversation._id);
    if (freshConversation) setOpenedConversation(freshConversation);
  }, [conversations, openedConversation]);

  useEffect(() => {
    const recipientId = searchParams.get("id") || searchParams.get("recipientId");
    if (!recipientId || openedRecipientRef.current === recipientId) return;

    const contact = contacts.find((item: objectType) => String(item.id) === recipientId || String(item.appUserId) === recipientId);
    const payload = contact
      ? { creator: contact }
      : { recipientId };

    openedRecipientRef.current = recipientId;
    openDirectConversation.mutate(
      payload,
      {
        onSuccess: (data) => {
          setOpenedConversation(data.conversation);
          setSelectedConversationId(data.conversation._id);
          setSearchParams({ conversationId: data.conversation._id });
        },
        onError: () => {
          openedRecipientRef.current = null;
          notifier({ message: "Unable to open this conversation", type: "error" });
        },
      }
    );
  }, [contacts, openDirectConversation, searchParams, setSearchParams]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages.length, typingUsers, selectedConversationId]);

  const closeOverlays = () => {
    setOpenActionMenuId("");
    setReactionTrayId("");
    setReactionEmojiPickerId("");
    setReactionDetailsMessage(null);
    setIsPinnedListOpen(false);
    setIsEmojiPickerOpen(false);
  };

  const handleSurfacePointerDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-chat-overlay]") || target.closest("[data-chat-overlay-trigger]")) return;
    closeOverlays();
  };

  const startConversation = (contact: objectType) => {
    openDirectConversation.mutate(
      { creator: contact },
      {
        onSuccess: (data) => {
          setOpenedConversation(data.conversation);
          setSelectedConversationId(data.conversation._id);
          setSearchParams({ conversationId: data.conversation._id });
        },
        onError: () => notifier({ message: "Unable to start this chat", type: "error" }),
      }
    );
  };

  const showConversationList = () => {
    setSelectedConversationId("");
    setOpenedConversation(null);
    setReplyingTo(null);
    setEditingMessage(null);
    setDraft("");
    setFiles([]);
    closeOverlays();
    setSearchParams({});
  };

  const scrollContacts = (direction: "left" | "right") => {
    const container = contactsScrollRef.current;
    if (!container) return;

    const distance = Math.max(container.clientWidth * 0.75, 160);
    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const stopTypingSoon = () => {
    if (!socketRef.current || !selectedConversationId) return;
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socketRef.current?.emit("typing:stop", { conversationId: selectedConversationId, recipientIds: selectedRecipientIds });
    }, 1000);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (socketRef.current && selectedConversationId) {
      socketRef.current.emit("typing:start", { conversationId: selectedConversationId, recipientIds: selectedRecipientIds });
      stopTypingSoon();
    }
  };

  const rememberCursor = () => {
    cursorRef.current = messageInputRef.current?.selectionStart ?? draft.length;
  };

  const addEmoji = (emoji: string) => {
    const insertAt = Math.min(Math.max(cursorRef.current, 0), draft.length);
    const nextDraft = `${draft.slice(0, insertAt)}${emoji}${draft.slice(insertAt)}`;
    const nextCursor = insertAt + emoji.length;
    setDraft(nextDraft);
    cursorRef.current = nextCursor;
    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
      messageInputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const jumpToMessage = (messageId?: string) => {
    if (!messageId) return;
    const node = messageRefs.current.get(messageId);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setIsPinnedListOpen(false);
    setHighlightedMessageId(messageId);
    window.setTimeout(() => setHighlightedMessageId(""), 1800);
  };

  const copyMessage = async (message: ChatMessage) => {
    await navigator.clipboard?.writeText(message.text || "");
    setCopiedMessageId(message._id);
    setOpenActionMenuId("");
    window.setTimeout(() => setCopiedMessageId(""), 1200);
  };

  const handleEditClick = (message: ChatMessage) => {
    setEditingMessage(message);
    setReplyingTo(null);
    setDraft(message.text || "");
    setOpenActionMenuId("");
    messageInputRef.current?.focus();
  };

  const submitForward = async () => {
    if (!forwardingMessage || selectedForwardIds.length === 0) return;
    await forwardMessage.mutateAsync({ messageId: forwardingMessage._id, privateUserIds: selectedForwardIds });
    setForwardingMessage(null);
    setSelectedForwardIds([]);
  };

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!selectedConversationId || (!text && files.length === 0)) return;

    if (editingMessage) {
      await editMessage.mutateAsync({ messageId: editingMessage._id, text });
      setEditingMessage(null);
    } else {
      const payload = new FormData();
      payload.append("text", text);
      if (replyingTo?._id) payload.append("replyTo", replyingTo._id);
      files.forEach((file) => payload.append("files", file));
      await sendMessage.mutateAsync({ conversationId: selectedConversationId, payload });
      setReplyingTo(null);
    }

    socketRef.current?.emit("typing:stop", { conversationId: selectedConversationId, recipientIds: selectedRecipientIds });
    setDraft("");
    setFiles([]);
    setIsEmojiPickerOpen(false);
  };

  return (
    <section className="h-[92vh] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm">
      <div className="relative h-full overflow-hidden md:grid md:grid-cols-[22rem_minmax(0,1fr)]">
        <aside
          className={cn(
            "absolute inset-0 z-10 flex min-h-0 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-300 md:static md:z-auto md:translate-x-0",
            selectedConversationId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
          )}
        >
          <div className="border-b border-slate-200 p-5">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>

          <div className="border-b border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-500">Start a conversation</p>
            <label className="mb-3 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
              <Search className="size-4 text-slate-400" />
              <input value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Search contacts" className="w-full bg-transparent text-sm outline-none" />
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollContacts("left")}
                className="grid size-8 flex-none place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-40"
                disabled={contactsLoading || contacts.length === 0}
                aria-label="Scroll contacts left"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div ref={contactsScrollRef} className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {contactsLoading ? (
                  <div className="flex gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="size-14 flex-none animate-pulse rounded-full bg-slate-200" />
                    ))}
                  </div>
                ) : contactsError ? (
                  <button type="button" onClick={() => refetchContacts()} className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm">
                    Contacts unavailable. Retry
                  </button>
                ) : (
                  contacts.map((contact) => (
                    <button key={String(contact.appUserId || contact.id)} type="button" onClick={() => startConversation(contact)} className="flex-none rounded-lg p-2 text-center transition hover:bg-white" title={String(contact.name || "User")}>
                      <Avatar user={contact} size="lg" />
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={() => scrollContacts("right")}
                className="grid size-8 flex-none place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-40"
                disabled={contactsLoading || contacts.length === 0}
                aria-label="Scroll contacts right"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-slate-200 p-4">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
              <Search className="size-4 text-slate-400" />
              <input value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="Search chats" className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="space-y-3 p-3">
                <PanelSkeleton className="p-4" />
                <PanelSkeleton className="p-4" />
                <PanelSkeleton className="p-4" />
              </div>
            ) : conversationsError ? (
              <div className="p-3">
                <ErrorState
                  title="Chats could not be loaded"
                  description="Your conversations did not respond. Try again when your connection is stable."
                  onRetry={() => refetchConversations()}
                  className="min-h-56"
                />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-3">
                <EmptyState
                  icon={<UserRound className="size-5" />}
                  title="No conversations yet"
                  description="Start a conversation with a seller or contact from the row above."
                  className="min-h-56"
                />
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const recipient = getOtherMember(conversation, currentAppUserId);
                const isActive = conversation._id === selectedConversationId;
                const unreadCount = conversation.unreadCount || 0;
                const recipientOnline = recipient?.appUserId ? onlineUserIds.includes(String(recipient.appUserId)) : false;
                const recipientTyping = Boolean(typingUsers[conversation._id]);
                const ownLast = conversation.lastMessage?.sender?.appUserId === currentAppUserId;
                const preview = recipientTyping ? `Typing${typingDots}` : getMessagePreview(conversation.lastMessage);
                const displayTime = formatChatListTime(conversation.lastMessage?.createdAt || conversation.lastMessageAt);

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => {
                      setOpenedConversation(conversation);
                      setSelectedConversationId(conversation._id);
                      setSearchParams({ conversationId: conversation._id });
                    }}
                    className={cn("mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-3 text-left transition", isActive ? "bg-blue-50" : "hover:bg-white")}
                  >
                    <Avatar user={recipient} size="lg" online={recipientOnline} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{recipient?.name || "Unknown user"}</span>
                      <span className={cn("block truncate text-sm", recipientTyping ? "text-blue-600" : unreadCount ? "font-semibold text-slate-950" : "text-slate-500")}>{preview}</span>
                    </span>
                    <span className="flex flex-col items-end gap-2">
                      {displayTime && <span className="text-[11px] text-slate-400">{displayTime}</span>}
                      {unreadCount > 0 && <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">{unreadCount}</span>}
                      {unreadCount === 0 && ownLast && <PrivateMessageStatusIcon status={getMessageStatus(conversation.lastMessage || undefined, recipient)} />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main
          className={cn(
            "absolute inset-0 z-20 flex min-h-0 overflow-hidden bg-white transition-transform duration-300 md:static md:z-auto md:translate-x-0",
            selectedConversationId ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}
        >
          {selectedConversation ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white p-3 md:p-4">
                <button type="button" onClick={showConversationList} className="grid size-9 place-items-center rounded-md bg-slate-100 md:hidden">
                  <ArrowLeft className="size-4" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar user={selectedRecipient} size="lg" online={selectedRecipientOnline} />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold">{selectedRecipient?.name || "Conversation"}</h2>
                    <p className={cn("text-sm", selectedRecipientTyping || selectedRecipientOnline ? "text-blue-600" : "text-slate-500")}>{presenceText}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <button type="button" className="grid size-10 place-items-center rounded-md bg-slate-100 hover:text-slate-950"><Phone className="size-4" /></button>
                  <button type="button" className="grid size-10 place-items-center rounded-md bg-slate-100 hover:text-slate-950"><Video className="size-4" /></button>
                </div>
              </header>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-slate-50 p-3 md:p-4" onPointerDown={handleSurfacePointerDown}>
                {messagesLoading ? (
                  <div className="flex h-full flex-col justify-end gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className={cn("h-16 max-w-[72%] animate-pulse rounded-lg bg-slate-200", index % 2 ? "ml-auto w-2/3" : "w-1/2")} />
                    ))}
                  </div>
                ) : messagesError ? (
                  <ErrorState
                    title="Messages could not be loaded"
                    description="This conversation did not load correctly. Try again to refresh the message history."
                    onRetry={() => refetchMessages()}
                    className="h-full"
                  />
                ) : messages.length === 0 ? (
                  <EmptyState
                    icon={<Send className="size-5" />}
                    title="Send the first message"
                    description="This conversation is ready. Write a message below to begin."
                    className="h-full"
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {pinnedMessages.length > 0 && (
                      <div data-chat-overlay className="sticky top-0 z-20">
                        <button
                          type="button"
                          data-chat-overlay-trigger
                          onClick={() => (pinnedMessages.length > 1 ? setIsPinnedListOpen((value) => !value) : jumpToMessage(pinnedMessages[0]?._id))}
                          className="flex w-full items-center gap-3 rounded-lg border border-blue-100 bg-white/95 p-3 text-left shadow-sm backdrop-blur"
                        >
                          <span className="grid size-10 place-items-center rounded-md bg-blue-50 text-blue-600"><Pin className="size-4" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-blue-700">{pinnedMessages.length > 1 ? `${pinnedMessages.length} pinned messages` : "Pinned message"}</span>
                            <span className="block truncate text-sm text-slate-600">{pinnedMessages[0]?.sender?.name}: {getPinnedMessagePreview(pinnedMessages[0])}</span>
                          </span>
                          {pinnedMessages.length > 1 && <ChevronDown className={cn("size-4 text-slate-500 transition", isPinnedListOpen && "rotate-180")} />}
                        </button>
                        {pinnedMessages.length > 1 && (
                          <div
                            data-chat-overlay
                            className={cn(
                              "absolute left-0 right-0 top-full mt-2 max-h-72 origin-top overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl transition-all duration-200",
                              isPinnedListOpen
                                ? "translate-y-0 scale-100 opacity-100"
                                : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                            )}
                          >
                            {pinnedMessages.map((message) => (
                              <button key={message._id} type="button" onClick={() => jumpToMessage(message._id)} className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-slate-50">
                                <Pin className="mt-1 size-4 text-blue-600" />
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center justify-between gap-3">
                                    <span className="truncate text-sm font-bold">{message.sender?.name}</span>
                                    <span className="shrink-0 text-[11px] text-slate-400">{formatChatListTime(message.createdAt)}</span>
                                  </span>
                                  <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">{getPinnedMessagePreview(message)}</span>
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {messageRows.map((row) => {
                      if (isDateLabelRow(row)) {
                        return (
                          <div key={row._id} className="my-2 text-center">
                            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">{row.label}</span>
                          </div>
                        );
                      }

                      const message = row;
                      const own = message.sender?.appUserId === currentAppUserId;
                      const isPinned = currentAppUserId ? message.pinnedBy?.some((member) => normalizeId(member) === String(currentAppUserId)) : false;
                      const reactionGroups = groupReactions(message.reactions || []);
                      const uniqueReactions = Object.keys(reactionGroups);
                      const status = own ? getMessageStatus(message, selectedRecipient) : "sent";

                      return (
                        <div
                          key={message._id}
                          ref={(node) => {
                            if (node) messageRefs.current.set(message._id, node);
                            else messageRefs.current.delete(message._id);
                          }}
                          className={cn("group flex scroll-mt-24", own ? "justify-end" : "justify-start")}
                        >
                          <div
                            data-message-bubble
                            className={cn(
                              "relative z-10 max-w-[88%] rounded-lg px-4 pb-6 pt-3 pr-12 shadow-sm transition hover:z-40 focus-within:z-40 md:max-w-[82%]",
                              highlightedMessageId === message._id ? "ring-2 ring-yellow-300 bg-yellow-50" : own ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-950"
                            )}
                          >
                            {!message.deletedForEveryone && (
                              <button
                                type="button"
                                data-chat-overlay-trigger
                                onClick={() => setReactionTrayId((value) => (value === message._id ? "" : message._id))}
                                className={cn("absolute top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-500 opacity-0 shadow transition group-hover:opacity-100", own ? "-left-10" : "-right-10")}
                              >
                                <Smile className="size-4" />
                              </button>
                            )}

                              <div
                                data-chat-overlay
                                className={cn(
                                  "absolute -top-12 z-40 flex origin-bottom items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-xl transition-all duration-200",
                                  own ? "right-8" : "left-8",
                                  reactionTrayId === message._id
                                    ? "translate-y-0 scale-100 opacity-100"
                                    : "pointer-events-none translate-y-2 scale-95 opacity-0"
                                )}
                              >
                                {quickReactions.map((emoji) => (
                                  <button key={emoji} type="button" onClick={async () => { await toggleReaction.mutateAsync({ messageId: message._id, emoji }); setReactionTrayId(""); setReactionEmojiPickerId(""); }} className="text-lg transition hover:scale-125">
                                    {emoji}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    setReactionPickerPlacement(getOverlayPlacement(event.currentTarget, 340) as "up" | "down");
                                    setReactionEmojiPickerId((value) => (value === message._id ? "" : message._id));
                                  }}
                                  className="grid size-6 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:scale-110 hover:bg-slate-200"
                                  aria-label="Choose another emoji"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                                  <div
                                    data-chat-overlay
                                    className={cn(
                                      "absolute z-50 transition-all duration-200",
                                      own ? "right-0" : "left-0",
                                      reactionPickerPlacement === "up" ? "bottom-10 origin-bottom" : "top-10 origin-top",
                                      reactionEmojiPickerId === message._id
                                        ? "translate-y-0 scale-100 opacity-100"
                                        : reactionPickerPlacement === "up"
                                          ? "pointer-events-none translate-y-2 scale-95 opacity-0"
                                          : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                                    )}
                                  >
                                    <EmojiPickerGrid
                                      onSelect={async (emoji) => {
                                        await toggleReaction.mutateAsync({ messageId: message._id, emoji });
                                        setReactionTrayId("");
                                        setReactionEmojiPickerId("");
                                      }}
                                    />
                                  </div>
                              </div>

                            <button
                              type="button"
                              data-chat-overlay-trigger
                              onClick={(event) => {
                                setReactionTrayId("");
                                setReactionEmojiPickerId("");
                                setActionMenuPlacement(getOverlayPlacement(event.currentTarget, 300) as "up" | "down");
                                setOpenActionMenuId((value) => (value === message._id ? "" : message._id));
                              }}
                              className={cn("absolute right-1.5 top-1.5 hidden size-6 items-center justify-center rounded-full bg-white text-slate-500 shadow transition group-hover:flex", openActionMenuId === message._id && "flex")}
                            >
                              <ChevronDown className="size-4" />
                            </button>

                              <div
                                data-chat-overlay
                                className={cn(
                                  "absolute z-[999] w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm text-slate-700 shadow-2xl transition-all duration-200",
                                  own ? "right-0" : "left-0",
                                  actionMenuPlacement === "up" ? "bottom-full mb-2 origin-bottom" : "top-8 origin-top",
                                  openActionMenuId === message._id
                                    ? "translate-y-0 scale-100 opacity-100"
                                    : actionMenuPlacement === "up"
                                      ? "pointer-events-none translate-y-2 scale-95 opacity-0"
                                      : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                                )}
                              >
                                <button type="button" onClick={() => { setReplyingTo(message); setEditingMessage(null); setOpenActionMenuId(""); }} className="block w-full px-5 py-2 text-left hover:bg-slate-100">Reply</button>
                                <button type="button" onClick={() => { setReactionTrayId(message._id); setOpenActionMenuId(""); }} className="block w-full px-5 py-2 text-left hover:bg-slate-100">React</button>
                                <button type="button" onClick={async () => { await togglePin.mutateAsync(message._id); setOpenActionMenuId(""); }} className="block w-full px-5 py-2 text-left hover:bg-slate-100">{isPinned ? "Unpin" : "Pin"}</button>
                                <button type="button" onClick={() => { setForwardingMessage(message); setOpenActionMenuId(""); }} className="flex w-full items-center justify-between px-5 py-2 text-left hover:bg-slate-100">Forward <Forward className="size-4" /></button>
                                <button type="button" onClick={() => copyMessage(message)} className="flex w-full items-center justify-between px-5 py-2 text-left hover:bg-slate-100">Copy <Copy className="size-4" /></button>
                                {own && !message.deletedForEveryone && canEditMessage(message) && (
                                  <button type="button" onClick={() => handleEditClick(message)} className="block w-full px-5 py-2 text-left hover:bg-slate-100">Edit</button>
                                )}
                                <div className="my-1 border-t border-slate-200" />
                                <button type="button" onClick={() => { setDeleteTarget(message); setOpenActionMenuId(""); }} className="block w-full px-5 py-2 text-left text-red-600 hover:bg-red-50">Delete</button>
                              </div>

                            {isPinned && <p className="mb-1 flex items-center gap-1 text-xs opacity-80"><Pin className="size-3" /> Pinned</p>}
                            {message.isForwarded && !message.deletedForEveryone && <p className="mb-1 text-[11px] italic opacity-75">Forwarded</p>}
                            {message.replyTo && (
                              <button type="button" onClick={() => jumpToMessage(message.replyTo?._id)} className={cn("mb-2 block w-full rounded-md border-l-2 px-3 py-2 text-left", own ? "border-white/70 bg-white/10" : "border-blue-500 bg-slate-50")}>
                                <p className="text-xs font-semibold opacity-80">{message.replyTo.sender?.name || "Reply"}</p>
                                <p className="line-clamp-1 text-sm opacity-90">{message.replyTo.deletedForEveryone ? "This message was deleted" : message.replyTo.text || message.replyTo.attachments?.[0]?.name || "Attachment"}</p>
                              </button>
                            )}
                            {message.text && <p className={cn("whitespace-pre-wrap break-words text-sm leading-6", message.deletedForEveryone && "italic opacity-75")}>{message.text}</p>}
                            {!message.deletedForEveryone && message.attachments?.map((attachment, index) => (
                              <MessageAttachment key={`${attachment.url}-${index}`} attachment={attachment} own={own} onPreview={setPreviewAttachment} />
                            ))}
                            {uniqueReactions.length > 0 && (
                              <button type="button" onClick={() => setReactionDetailsMessage(message)} className={cn("absolute -bottom-5 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-sm text-slate-800 shadow", own ? "right-4" : "left-4")}>
                                {uniqueReactions.slice(0, 3).map((emoji) => <span key={emoji}>{emoji}</span>)}
                                <span className="text-xs font-semibold">{message.reactions?.length}</span>
                              </button>
                            )}
                            {copiedMessageId === message._id && <span className="absolute -top-8 right-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-slate-700 shadow"><Check className="size-3" /> Copied</span>}
                            <p className={cn("absolute bottom-1 right-2 mt-1 flex items-center gap-1 text-[11px]", own ? "text-white/70" : "text-slate-400")}>
                              <span>{formatBubbleTime(message.createdAt)}</span>
                              {message.isEdited && !message.deletedForEveryone && <span>Edited</span>}
                              {own && <PrivateMessageStatusIcon status={status} compact />}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {typingUsers[selectedConversationId] && <div className="text-sm font-semibold text-slate-500">{typingUsers[selectedConversationId].name || selectedRecipient?.name} is typing...</div>}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={submitMessage} className="relative flex flex-col gap-3 border-t border-slate-200 bg-white p-3 md:p-4" onPointerDown={handleSurfacePointerDown}>
                <div
                  data-chat-overlay
                  className={cn(
                    "absolute bottom-[5.5rem] left-3 z-[10000] origin-bottom transition-all duration-200",
                    isEmojiPickerOpen
                      ? "translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-2 scale-95 opacity-0"
                  )}
                >
                  <EmojiPickerGrid onSelect={addEmoji} />
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-4 transition-all duration-200",
                    replyingTo || editingMessage
                      ? "max-h-24 translate-y-0 py-3 opacity-100"
                      : "pointer-events-none max-h-0 -translate-y-1 border-transparent py-0 opacity-0"
                  )}
                >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-blue-700">{editingMessage ? "Editing message" : `Replying to ${replyingTo?.sender?.name || "message"}`}</p>
                      <p className="line-clamp-1 text-sm text-slate-500">{editingMessage?.text || replyingTo?.text || replyingTo?.attachments?.[0]?.name || "Attachment"}</p>
                    </div>
                    <button type="button" onClick={() => { setReplyingTo(null); setEditingMessage(null); setDraft(""); }} className="grid size-8 place-items-center rounded-md bg-white text-slate-500">
                      <X className="size-4" />
                    </button>
                  </div>

                  <div
                    className={cn(
                      "flex flex-wrap gap-2 overflow-hidden transition-all duration-200",
                      files.length > 0 ? "max-h-24 translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-1 opacity-0"
                    )}
                  >
                    {files.map((file, index) => (
                      <span key={`${file.name}-${index}`} className="inline-flex max-w-xs items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                        <Paperclip className="size-3.5" />
                        <span className="truncate">{file.name}</span>
                        <button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X className="size-3.5" /></button>
                      </span>
                    ))}
                  </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <button type="button" disabled={Boolean(editingMessage)} onClick={() => fileInputRef.current?.click()} className="grid size-10 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40">
                    <Paperclip className="size-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(event) => {
                      setFiles(Array.from(event.target.files || []));
                      event.target.value = "";
                    }}
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                    <button type="button" data-chat-overlay-trigger onMouseDown={rememberCursor} onClick={() => setIsEmojiPickerOpen((value) => !value)} className="flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-white">
                      <Smile className="size-5" />
                    </button>
                    <textarea
                      ref={messageInputRef}
                      value={draft}
                      onChange={(event) => {
                        cursorRef.current = event.currentTarget.selectionStart ?? event.currentTarget.value.length;
                        handleDraftChange(event.target.value);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          submitMessage(event);
                        }
                      }}
                      onClick={rememberCursor}
                      onKeyUp={rememberCursor}
                      onSelect={rememberCursor}
                      onBlur={rememberCursor}
                      placeholder="Type your message..."
                      rows={1}
                      className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 pr-3 text-sm outline-none"
                    />
                  </div>
                  <button type="submit" disabled={sendMessage.isPending || editMessage.isPending || (!draft.trim() && files.length === 0)} className="grid size-11 place-items-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50">
                    <Send className="size-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8 text-center text-sm text-slate-500">
              <div>
                <UserRound className="mx-auto mb-3 size-10 text-slate-300" />
                Select a conversation or start a new one.
              </div>
            </div>
          )}
        </main>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-950">Delete message?</h3>
            <p className="mt-2 text-sm text-slate-500">This will delete the message for everyone in this conversation.</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-md">Cancel</Button>
              <Button type="button" onClick={async () => { await deleteMessage.mutateAsync(deleteTarget._id); setDeleteTarget(null); }} className="rounded-md bg-red-600 text-white hover:bg-red-700">Delete</Button>
            </div>
          </div>
        </div>
      )}

      <MediaPreviewModal attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />

      {reactionDetailsMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setReactionDetailsMessage(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-bold">Reactions</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setReactionDetailsMessage(null)} className="rounded-md"><X className="size-4" /></Button>
            </div>
            <div className="max-h-80 overflow-y-auto p-3">
              {(reactionDetailsMessage.reactions || []).map((reaction, index) => {
                const reactionUser = typeof reaction.user === "object" ? reaction.user : null;
                const fallbackUser = reaction.userId === currentAppUserId ? currentUser : null;
                return (
                  <div key={`${reaction.emoji}-${index}`} className="flex items-center gap-3 rounded-md p-3 hover:bg-slate-50">
                    <Avatar user={reactionUser || fallbackUser} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{reactionUser?.name || fallbackUser?.name || "User"}</span>
                      <span className="block truncate text-xs text-slate-500">{reactionUser?.email || fallbackUser?.email || "Marketplace user"}</span>
                    </span>
                    <span className="text-2xl">{reaction.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {forwardingMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-base font-bold"><Forward className="size-4" /> Forward message</p>
                <p className="mt-1 truncate text-xs text-slate-500">{forwardingMessage.text || forwardingMessage.attachments?.[0]?.name || "Attachment"}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => { setForwardingMessage(null); setSelectedForwardIds([]); }} className="rounded-md"><X className="size-4" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {contacts.map((member) => {
                  const memberId = member.appUserId || member.id;
                  if (String(memberId) === String(currentAppUserId)) return null;
                  const selected = selectedForwardIds.map(String).includes(String(memberId));
                  return (
                    <button
                      key={String(memberId)}
                      type="button"
                      onClick={() => setSelectedForwardIds((current) => selected ? current.filter((id) => String(id) !== String(memberId)) : [...current, memberId as string | number])}
                      className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition", selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50")}
                    >
                      <Avatar user={member} size="lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{String(member.name || "User")}</span>
                        <span className="block truncate text-xs text-slate-500">{String(member.email || "")}</span>
                      </span>
                      <span className={cn("grid size-6 place-items-center rounded-full border", selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent")}><Check className="size-3.5" /></span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 p-4">
              <p className="text-xs text-slate-500">{selectedForwardIds.length} selected</p>
              <Button type="button" onClick={submitForward} disabled={forwardMessage.isPending || selectedForwardIds.length === 0} className="rounded-md bg-blue-600 text-white hover:bg-blue-700">
                <Forward className="size-4" /> Forward
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Chats;
