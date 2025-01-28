"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = void 0;
const ws_1 = require("ws");
const verifyToken_1 = require("./verifyToken");
const config_1 = __importDefault(require("../../config"));
const prisma_1 = __importDefault(require("./prisma"));
const onlineUsers = new Set();
const userSockets = new Map();
function setupWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws) => {
        console.log('A user connected');
        ws.on('message', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedData = JSON.parse(data);
                switch (parsedData.event) {
                    case 'authenticate': {
                        const token = parsedData.token;
                        if (!token) {
                            console.log('No token provided');
                            ws.close();
                            return;
                        }
                        const user = (0, verifyToken_1.verifyToken)(token, config_1.default.jwt.access_secret);
                        if (!user) {
                            console.log('Invalid token');
                            ws.close();
                            return;
                        }
                        const { id } = user;
                        ws.userId = id;
                        onlineUsers.add(id);
                        userSockets.set(id, ws);
                        broadcastToAll(wss, {
                            event: 'userStatus',
                            data: { userId: id, isOnline: true },
                        });
                        break;
                    }
                    case 'message': {
                        const { receiverId, message, images } = parsedData;
                        if (!ws.userId || !receiverId || !message) {
                            console.log('Invalid message payload');
                            return;
                        }
                        let room = yield prisma_1.default.room.findFirst({
                            where: {
                                OR: [
                                    { senderId: ws.userId, receiverId },
                                    { senderId: receiverId, receiverId: ws.userId },
                                ],
                            },
                        });
                        if (!room) {
                            room = yield prisma_1.default.room.create({
                                data: { senderId: ws.userId, receiverId },
                            });
                        }
                        const chat = yield prisma_1.default.chat.create({
                            data: {
                                senderId: ws.userId,
                                receiverId,
                                roomId: room.id,
                                message,
                                images: { set: images || [] },
                            },
                        });
                        const receiverSocket = userSockets.get(receiverId);
                        if (receiverSocket) {
                            receiverSocket.send(JSON.stringify({ event: 'message', data: chat }));
                        }
                        ws.send(JSON.stringify({ event: 'message', data: chat }));
                        break;
                    }
                    case 'fetchChats': {
                        const { receiverId } = parsedData;
                        if (!ws.userId) {
                            console.log('User not authenticated');
                            return;
                        }
                        const room = yield prisma_1.default.room.findFirst({
                            where: {
                                OR: [
                                    { senderId: ws.userId, receiverId },
                                    { senderId: receiverId, receiverId: ws.userId },
                                ],
                            },
                        });
                        if (!room) {
                            ws.send(JSON.stringify({ event: 'noRoomFound' }));
                            return;
                        }
                        const chats = yield prisma_1.default.chat.findMany({
                            where: { roomId: room.id },
                            orderBy: { createdAt: 'asc' },
                        });
                        yield prisma_1.default.chat.updateMany({
                            where: { roomId: room.id, receiverId: ws.userId },
                            data: { isRead: true },
                        });
                        ws.send(JSON.stringify({
                            event: 'fetchChats',
                            data: chats,
                        }));
                        break;
                    }
                    case 'unReadMessages': {
                        const { receiverId } = parsedData;
                        if (!ws.userId || !receiverId) {
                            console.log('Invalid unread messages payload');
                            return;
                        }
                        const room = yield prisma_1.default.room.findFirst({
                            where: {
                                OR: [
                                    { senderId: ws.userId, receiverId },
                                    { senderId: receiverId, receiverId: ws.userId },
                                ],
                            },
                        });
                        if (!room) {
                            ws.send(JSON.stringify({ event: 'noUnreadMessages', data: [] }));
                            return;
                        }
                        const unReadMessages = yield prisma_1.default.chat.findMany({
                            where: { roomId: room.id, isRead: false, receiverId: ws.userId },
                        });
                        const unReadCount = unReadMessages.length;
                        ws.send(JSON.stringify({
                            event: 'unReadMessages',
                            data: { messages: unReadMessages, count: unReadCount },
                        }));
                        break;
                    }
                    case 'messageList': {
                        try {
                            // Fetch all rooms where the user is a sender or receiver
                            const rooms = yield prisma_1.default.room.findMany({
                                where: {
                                    OR: [{ senderId: ws.userId }, { receiverId: ws.userId }],
                                },
                                include: {
                                    chat: {
                                        orderBy: {
                                            createdAt: 'desc', // Get the most recent message first
                                        },
                                        take: 1, // Only fetch the last message for each room
                                    },
                                },
                            });
                            // Extract the other user's IDs from the rooms
                            const userIds = rooms.map(room => {
                                return room.senderId === ws.userId
                                    ? room.receiverId
                                    : room.senderId;
                            });
                            // Fetch user information for these IDs
                            const userInfos = yield prisma_1.default.user.findMany({
                                where: {
                                    id: {
                                        in: userIds.filter((id) => id !== null),
                                    },
                                },
                                select: {
                                    id: true,
                                    fullName: true,
                                    image: true,
                                },
                            });
                            // Map rooms to include user info and last message
                            const userWithLastMessages = rooms.map(room => {
                                const otherUserId = room.senderId === ws.userId ? room.receiverId : room.senderId;
                                const userInfo = userInfos.find(userInfo => userInfo.id === otherUserId);
                                return {
                                    user: userInfo || null,
                                    lastMessage: room.chat[0] || null,
                                };
                            });
                            // Sort the list by the timestamp of the last message (most recent first)
                            const sortedUserWithLastMessages = userWithLastMessages.sort((a, b) => {
                                if (!a.lastMessage || !b.lastMessage)
                                    return 0; // Handle edge cases
                                return (new Date(b.lastMessage.createdAt).getTime() -
                                    new Date(a.lastMessage.createdAt).getTime());
                            });
                            // Send the sorted list to the client
                            ws.send(JSON.stringify({
                                event: 'messageList',
                                data: sortedUserWithLastMessages,
                            }));
                        }
                        catch (error) {
                            console.error('Error fetching user list with last messages:', error);
                            ws.send(JSON.stringify({
                                event: 'error',
                                message: 'Failed to fetch users with last messages',
                            }));
                        }
                        break;
                    }
                    default:
                        console.log('Unknown event type:', parsedData.event);
                }
            }
            catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        }));
        ws.on('close', () => {
            if (ws.userId) {
                onlineUsers.delete(ws.userId);
                userSockets.delete(ws.userId);
                broadcastToAll(wss, {
                    event: 'userStatus',
                    data: { userId: ws.userId, isOnline: false },
                });
            }
            console.log('User disconnected');
        });
    });
    return wss;
}
exports.setupWebSocket = setupWebSocket;
function broadcastToAll(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
