import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  Users,
  Send,
  Paperclip,
  CheckCheck,
  Check,
  Bell,
  Radio,
  Building,
  User,
  Sparkles,
  ShieldAlert,
  Download,
  Smile,
  Circle,
  FileText,
  Volume2
} from 'lucide-react';
import { UserRole, ChatMessage, ChatRoom } from '../types';
import { apiClient } from '../utils/apiClient';

interface CommunicationHubProps {
  currentUser: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
  };
}

interface OnlineUser {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  department?: string;
  status: 'online' | 'away';
}

export default function CommunicationHub({ currentUser }: CommunicationHubProps) {
  const userId = currentUser._id || currentUser.id || 'user-1';
  const userName = currentUser.name || currentUser.email.split('@')[0];
  const userRole = currentUser.role || 'student';
  const userDept = currentUser.department || 'Computer Science';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([
    {
      _id: 'room-dept-cs',
      name: 'Computer Science Dept',
      type: 'department',
      department: 'Computer Science',
      members: [userId],
      lastMessage: 'Welcome to the CS Department real-time channel!',
      lastMessageAt: new Date().toISOString()
    },
    {
      _id: 'room-dept-ee',
      name: 'Electrical Engineering Dept',
      type: 'department',
      department: 'Electrical Engineering',
      members: [userId],
      lastMessage: 'Lab schedule for Circuit Analysis updated.',
      lastMessageAt: new Date().toISOString()
    },
    {
      _id: 'room-group-study',
      name: 'CS101 Algorithms Group',
      type: 'group',
      members: [userId],
      lastMessage: 'Anyone finished Problem Set #3?',
      lastMessageAt: new Date().toISOString()
    },
    {
      _id: 'room-broadcast-general',
      name: 'Campus Broadcast Alerts',
      type: 'broadcast',
      members: [],
      lastMessage: 'Campus Library extended hours during Midterm Exam week.',
      lastMessageAt: new Date().toISOString()
    }
  ]);

  const [activeRoomId, setActiveRoomId] = useState<string>('room-dept-cs');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [roomId: string]: string[] }>({});
  const [pushNotification, setPushNotification] = useState<{ title: string; message: string; priority: string } | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  // Broadcast modal state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', priority: 'normal' as 'high' | 'normal' });

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Web Push Notification Permission
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        new Notification('Smart Campus Notifications Enabled', {
          body: 'You will now receive real-time broadcast announcements and push alerts.'
        });
      }
    }
  };

  // Connect to Socket.io Server
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Chat Socket:', newSocket.id);
      newSocket.emit('user_connected', {
        userId,
        userName,
        userRole,
        department: userDept
      });
      newSocket.emit('join_room', activeRoomId);
    });

    newSocket.on('online_users_update', (usersList: OnlineUser[]) => {
      setOnlineUsers(usersList);
    });

    newSocket.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Trigger read receipt if viewing this room
      if (msg.roomId === activeRoomId && msg.senderId !== userId) {
        newSocket.emit('read_receipt', { roomId: msg.roomId, messageId: msg._id, userId });
      }
    });

    newSocket.on('user_typing', (data: { roomId: string; userId: string; userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const currentRoomTypers = prev[data.roomId] || [];
        if (data.isTyping && !currentRoomTypers.includes(data.userName)) {
          return { ...prev, [data.roomId]: [...currentRoomTypers, data.userName] };
        } else if (!data.isTyping) {
          return { ...prev, [data.roomId]: currentRoomTypers.filter((u) => u !== data.userName) };
        }
        return prev;
      });
    });

    newSocket.on('message_read_update', (data: { messageId: string; readBy: string[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, readBy: data.readBy } : m))
      );
    });

    newSocket.on('push_notification', (notif: { title: string; message: string; priority: string }) => {
      setPushNotification(notif);

      // Play audio notification chime
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}

      // Native Web Push Notification
      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.message });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, userName, userRole, userDept]);

  // Fetch rooms and initial room messages
  useEffect(() => {
    const loadRoomsAndMessages = async () => {
      try {
        const roomsData = await apiClient.get<ChatRoom[]>('/chat/rooms');
        if (roomsData && roomsData.length > 0) {
          setRooms(roomsData);
        }

        const msgsData = await apiClient.get<ChatMessage[]>(`/chat/rooms/${activeRoomId}/messages`);
        if (msgsData) {
          setMessages(msgsData);
        }
      } catch (err) {
        console.warn('Using local fallback for chat channels:', err);
      }
    };
    loadRoomsAndMessages();
  }, [activeRoomId]);

  // Handle switching room
  const handleSelectRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave_room', activeRoomId);
      socket.emit('join_room', roomId);
    }
    setActiveRoomId(roomId);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing event debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socket) {
      socket.emit('typing_indicator', { roomId: activeRoomId, userId, userName, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_indicator', { roomId: activeRoomId, userId, userName, isTyping: false });
      }, 2000);
    }
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent, fileData?: { url: string; name: string; type: string }) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !fileData) return;

    const payload = {
      roomId: activeRoomId,
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      text: fileData ? `Attached file: ${fileData.name}` : inputText.trim(),
      fileUrl: fileData?.url,
      fileName: fileData?.name,
      fileType: fileData?.type,
      isBroadcast: activeRoomId === 'room-broadcast-general'
    };

    if (socket && socket.connected) {
      socket.emit('send_message', payload);
    } else {
      // HTTP fallback
      try {
        const newMsg = await apiClient.post<ChatMessage>('/chat/messages', payload);
        setMessages((prev) => [...prev, newMsg]);
      } catch (err: any) {
        alert('Failed to send message: ' + err.message);
      }
    }

    setInputText('');
  };

  // Handle File Upload Attachment
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await handleSendMessage(undefined, { url: data.fileUrl, name: data.fileName, type: data.fileType });
      } else {
        alert('File upload failed');
      }
    } catch (err: any) {
      // Fallback object URL demo
      const fakeUrl = URL.createObjectURL(file);
      await handleSendMessage(undefined, { url: fakeUrl, name: file.name, type: file.type });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send Broadcast Announcement
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastData.title || !broadcastData.message) return;

    if (socket) {
      socket.emit('broadcast_notification', {
        title: broadcastData.title,
        message: broadcastData.message,
        priority: broadcastData.priority,
        senderName: userName
      });
    }

    setIsBroadcastModalOpen(false);
    setBroadcastData({ title: '', message: '', priority: 'normal' });
  };

  const activeRoom = rooms.find((r) => r._id === activeRoomId);
  const typersInCurrentRoom = typingUsers[activeRoomId] || [];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-lg text-xs font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={14} className="text-emerald-400 animate-pulse" /> Real-Time Engine (Socket.io)
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[11px] font-mono font-bold">
              {onlineUsers.length} Users Online
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display mt-2">Campus Communication Hub</h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            Group, Department, Private, and Broadcast channels with live typing indicators and push notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pushPermission !== 'granted' && (
            <button
              onClick={requestPushPermission}
              className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Bell size={14} className="text-amber-300" /> Enable Push Alerts
            </button>
          )}

          {(userRole === 'admin' || userRole === 'faculty') && (
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-rose-600/30"
            >
              <ShieldAlert size={16} /> Broadcast Announcement
            </button>
          )}
        </div>
      </div>

      {/* Real-time Push Banner Alert */}
      {pushNotification && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-2 border-rose-500/40 rounded-2xl flex items-start justify-between gap-4 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0 mt-0.5">
              <Bell size={18} className="animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-rose-600 tracking-wider">
                Real-Time Campus Alert
              </span>
              <h4 className="text-sm font-bold text-slate-900">{pushNotification.title}</h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{pushNotification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setPushNotification(null)}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden min-h-[600px]">
        {/* Left Sidebar: Channels & Online Users */}
        <div className="lg:col-span-1 border-r border-slate-200/80 p-4 space-y-6 bg-slate-50/50 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider px-2">
              Channels & Rooms
            </h3>
            <div className="space-y-1">
              {rooms.map((room) => {
                const isActive = room._id === activeRoomId;
                return (
                  <button
                    key={room._id}
                    onClick={() => handleSelectRoom(room._id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center gap-3 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'hover:bg-slate-200/60 text-slate-700 font-medium'
                    }`}
                  >
                    {room.type === 'department' && <Building size={16} className={isActive ? 'text-indigo-200' : 'text-slate-500'} />}
                    {room.type === 'group' && <Users size={16} className={isActive ? 'text-indigo-200' : 'text-slate-500'} />}
                    {room.type === 'broadcast' && <Radio size={16} className={isActive ? 'text-rose-200' : 'text-rose-500'} />}
                    {room.type === 'private' && <User size={16} className={isActive ? 'text-indigo-200' : 'text-slate-500'} />}

                    <div className="truncate flex-1">
                      <div className="text-xs truncate">{room.name}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {room.lastMessage || 'No messages yet'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Online Members Box */}
            <div className="pt-4 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                  Active Active Users
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {onlineUsers.length === 0 ? (
                  <p className="text-[11px] text-slate-400 px-2 italic">Waiting for active peers...</p>
                ) : (
                  onlineUsers.map((u, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-xs text-slate-700 font-medium"
                    >
                      <Circle size={8} className="fill-emerald-500 text-emerald-500 shrink-0" />
                      <span className="truncate">{u.userName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 rounded text-slate-600 font-mono ml-auto uppercase">
                        {u.userRole}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-600" /> Socket.io Active
            </span>
            <p className="text-[10px] text-indigo-700 leading-tight">
              Instant sub-millisecond bidirectional messaging with typing awareness.
            </p>
          </div>
        </div>

        {/* Right Area: Messages Container & Input */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full bg-white">
          {/* Room Header */}
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-bold font-display text-slate-900 text-sm">{activeRoom?.name}</h3>
                <p className="text-[11px] text-slate-500">
                  {activeRoom?.type.toUpperCase()} Channel • {messages.length} messages
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                <Circle size={6} className="fill-emerald-500 text-emerald-500" /> Read Receipts On
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[460px] min-h-[380px] bg-slate-50/20">
            {messages.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-slate-400">
                <MessageSquare size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-medium">No messages in this channel yet.</p>
                <p className="text-[11px]">Be the first to say hello to your peers!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === userId;
                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span className="font-bold text-slate-700">{msg.senderName}</span>
                      <span className="px-1.5 py-0.2 bg-slate-100 rounded uppercase font-mono text-[9px] text-slate-500">
                        {msg.senderRole}
                      </span>
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 shadow-2xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* File Attachment Card */}
                      {msg.fileUrl && (
                        <div
                          className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                            isMe ? 'bg-indigo-700/60 border-indigo-400/40 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={16} className={isMe ? 'text-indigo-200' : 'text-indigo-600'} />
                            <span className="truncate font-semibold">{msg.fileName || 'Attached Document'}</span>
                          </div>
                          <a
                            href={msg.fileUrl}
                            download={msg.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className={`p-1.5 rounded-lg transition shrink-0 ${
                              isMe ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                            }`}
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      )}

                      {/* Read Status Checkmarks */}
                      <div className="flex items-center justify-end gap-1 pt-0.5">
                        <span className={`text-[9px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {msg.readBy.length > 1 ? 'Read by peers' : 'Delivered'}
                        </span>
                        {msg.readBy.length > 1 ? (
                          <CheckCheck size={13} className={isMe ? 'text-sky-300' : 'text-indigo-600'} />
                        ) : (
                          <Check size={13} className={isMe ? 'text-indigo-300' : 'text-slate-400'} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Live Typing Indicator Banner */}
            {typersInCurrentRoom.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-indigo-600 italic font-medium px-2 animate-pulse">
                <Sparkles size={12} />
                <span>{typersInCurrentRoom.join(', ')} {typersInCurrentRoom.length > 1 ? 'are' : 'is'} typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <form onSubmit={(e) => handleSendMessage(e)} className="p-3 border-t border-slate-200/80 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition shrink-0"
                title="Attach Document or File"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Type message in #${activeRoom?.name}...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert size={20} />
                <h3 className="font-bold font-display text-slate-900 text-base">Send Campus Broadcast</h3>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Examination Schedule Released"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Priority</label>
                <select
                  value={broadcastData.priority}
                  onChange={(e) => setBroadcastData({ ...broadcastData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 outline-none font-semibold text-slate-800"
                >
                  <option value="normal">Normal Announcement</option>
                  <option value="high">High Urgency Emergency Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the broadcast alert message to send to all connected campus sockets..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Radio size={14} /> Send Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
