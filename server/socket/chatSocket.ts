import { Server, Socket } from 'socket.io';
import { chatMessages, chatRooms, MessageRecord } from '../controllers/chatController.js';

interface ConnectedUser {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  department?: string;
  status: 'online' | 'away';
  joinedAt: string;
}

const connectedUsers = new Map<string, ConnectedUser>(); // socketId -> ConnectedUser

export function setupSocketIO(io: Server) {
  console.log('🔌 Socket.io Real-Time Communication subsystem initialized');

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Register User Online Status
    socket.on('user_connected', (userData: { userId: string; userName: string; userRole: string; department?: string }) => {
      connectedUsers.set(socket.id, {
        socketId: socket.id,
        userId: userData.userId,
        userName: userData.userName,
        userRole: userData.userRole,
        department: userData.department,
        status: 'online',
        joinedAt: new Date().toISOString()
      });

      // Broadcast updated online users list
      const onlineList = Array.from(connectedUsers.values());
      io.emit('online_users_update', onlineList);
    });

    // Join Room (Private, Group, Department, or Broadcast)
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // Leave Room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    // Real-Time Chat Message Handler
    socket.on('send_message', (msgPayload: {
      roomId: string;
      senderId: string;
      senderName: string;
      senderRole: string;
      text: string;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
      isBroadcast?: boolean;
    }) => {
      const newMsg: MessageRecord = {
        _id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        roomId: msgPayload.roomId,
        senderId: msgPayload.senderId,
        senderName: msgPayload.senderName,
        senderRole: msgPayload.senderRole,
        text: msgPayload.text,
        fileUrl: msgPayload.fileUrl,
        fileName: msgPayload.fileName,
        fileType: msgPayload.fileType,
        readBy: [msgPayload.senderId],
        createdAt: new Date().toISOString(),
        isBroadcast: !!msgPayload.isBroadcast
      };

      chatMessages.push(newMsg);

      // Update room last message
      const room = chatRooms.find(r => r._id === msgPayload.roomId);
      if (room) {
        room.lastMessage = msgPayload.text;
        room.lastMessageAt = newMsg.createdAt;
      }

      // Relay to all clients in room
      io.to(msgPayload.roomId).emit('new_message', newMsg);
      // Also broadcast room list refresh
      io.emit('room_updated', { roomId: msgPayload.roomId, lastMessage: msgPayload.text, lastMessageAt: newMsg.createdAt });
    });

    // Typing Indicator
    socket.on('typing_indicator', (data: { roomId: string; userId: string; userName: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit('user_typing', data);
    });

    // Read Receipt Handler
    socket.on('read_receipt', (data: { roomId: string; messageId: string; userId: string }) => {
      const msg = chatMessages.find(m => m._id === data.messageId);
      if (msg && !msg.readBy.includes(data.userId)) {
        msg.readBy.push(data.userId);
        io.to(data.roomId).emit('message_read_update', { messageId: data.messageId, readBy: msg.readBy });
      }
    });

    // Campus-Wide Broadcast Notification
    socket.on('broadcast_notification', (data: { title: string; message: string; priority: 'high' | 'normal'; senderName: string }) => {
      io.emit('push_notification', {
        id: `notif-${Date.now()}`,
        title: `📢 ${data.title}`,
        message: data.message,
        priority: data.priority,
        senderName: data.senderName,
        timestamp: new Date().toISOString()
      });
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      io.emit('online_users_update', Array.from(connectedUsers.values()));
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
}
