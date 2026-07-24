import { Request, Response } from 'express';
import { logAuditAction } from '../middleware/auditLogger.js';

export interface MessageRecord {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  readBy: string[];
  createdAt: string;
  isBroadcast?: boolean;
}

export interface RoomRecord {
  _id: string;
  name: string;
  type: 'private' | 'group' | 'department' | 'broadcast';
  department?: string;
  members: string[];
  lastMessage?: string;
  lastMessageAt?: string;
}

// Memory store for default chat channels and messages
export const chatRooms: RoomRecord[] = [
  {
    _id: 'room-dept-cs',
    name: 'Computer Science Dept',
    type: 'department',
    department: 'Computer Science',
    members: ['student-1', 'faculty-1', 'admin-1'],
    lastMessage: 'Welcome to the Computer Science Department real-time channel!',
    lastMessageAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'room-dept-ee',
    name: 'Electrical Engineering Dept',
    type: 'department',
    department: 'Electrical Engineering',
    members: ['student-2', 'faculty-2', 'admin-1'],
    lastMessage: 'Lab schedule for Circuit Analysis updated.',
    lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'room-group-study',
    name: 'CS101 Algorithms Group',
    type: 'group',
    members: ['student-1', 'student-2', 'faculty-1'],
    lastMessage: 'Anyone finished Problem Set #3?',
    lastMessageAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    _id: 'room-broadcast-general',
    name: 'Campus Broadcast Alerts',
    type: 'broadcast',
    members: [],
    lastMessage: 'Campus Library extended hours during Midterm Exam week.',
    lastMessageAt: new Date(Date.now() - 900000).toISOString()
  }
];

export const chatMessages: MessageRecord[] = [
  {
    _id: 'msg-101',
    roomId: 'room-dept-cs',
    senderId: 'faculty-1',
    senderName: 'Dr. Alan Turing',
    senderRole: 'faculty',
    text: 'Welcome students! Please check the updated AI & ML syllabus in the course drive.',
    readBy: ['student-1', 'admin-1'],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'msg-102',
    roomId: 'room-dept-cs',
    senderId: 'student-1',
    senderName: 'Alex Johnson',
    senderRole: 'student',
    text: 'Thank you Dr. Turing! Will the lab exam be held in Room 302?',
    readBy: ['faculty-1'],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'msg-103',
    roomId: 'room-group-study',
    senderId: 'student-2',
    senderName: 'Priya Sharma',
    senderRole: 'student',
    text: 'Hey everyone, let us sync on the Group Project repository.',
    readBy: ['student-1'],
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export async function getChatRooms(req: Request, res: Response) {
  try {
    res.json(chatRooms);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch chat rooms', error: error.message });
  }
}

export async function getRoomMessages(req: Request, res: Response) {
  try {
    const { roomId } = req.params;
    const roomMsgs = chatMessages.filter(m => m.roomId === roomId);
    res.json(roomMsgs);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch room messages', error: error.message });
  }
}

export async function createChatRoom(req: Request, res: Response) {
  try {
    const { name, type, department, members } = req.body;
    const newRoom: RoomRecord = {
      _id: `room-${type}-${Date.now()}`,
      name: name || `${type.toUpperCase()} Channel`,
      type,
      department,
      members: members || [],
      lastMessage: 'Room created',
      lastMessageAt: new Date().toISOString()
    };
    chatRooms.unshift(newRoom);
    logAuditAction(req, 'CHAT_ROOM_CREATE', 'chat', 'success', `Created ${type} chat room: ${newRoom.name}`);
    res.status(201).json(newRoom);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create chat room', error: error.message });
  }
}

export async function sendMessageHttp(req: Request, res: Response) {
  try {
    const { roomId, senderId, senderName, senderRole, text, fileUrl, fileName, fileType, isBroadcast } = req.body;

    if (!roomId || !text) {
      res.status(400).json({ message: 'Room ID and message text are required' });
      return;
    }

    const newMsg: MessageRecord = {
      _id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      roomId,
      senderId: senderId || 'user-1',
      senderName: senderName || 'Anonymous',
      senderRole: senderRole || 'student',
      text,
      fileUrl,
      fileName,
      fileType,
      readBy: [senderId],
      createdAt: new Date().toISOString(),
      isBroadcast: !!isBroadcast
    };

    chatMessages.push(newMsg);

    // Update room last message
    const room = chatRooms.find(r => r._id === roomId);
    if (room) {
      room.lastMessage = text;
      room.lastMessageAt = newMsg.createdAt;
    }

    logAuditAction(req, isBroadcast ? 'BROADCAST_SENT' : 'CHAT_MSG_SENT', 'chat', 'success', `Sent message in ${roomId}`);
    res.status(201).json(newMsg);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
}

export async function uploadChatFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (error: any) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
}
