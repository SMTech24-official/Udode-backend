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
const ws_1 = __importDefault(require("ws"));
const prisma_1 = __importDefault(require("./prisma"));
const config_1 = __importDefault(require("../../config"));
const verifyToken_1 = require("./verifyToken");
const onlineUsers = new Set();
const userSockets = new Map();
function setupWebSocket(server) {
    const wss = new ws_1.default.Server({ server });
    wss.on('connection', (socket, request) => {
        var _a;
        console.log('A user connected');
        // Handle token
        const params = new URLSearchParams((_a = request.url) === null || _a === void 0 ? void 0 : _a.split('?')[1]);
        const token = params.get('token');
        if (!token) {
            console.log('No token provided');
            socket.close();
            return;
        }
        let user;
        try {
            user = (0, verifyToken_1.verifyToken)(token, config_1.default.jwt.access_secret);
            // Type cast socket to include userId
            socket.userId = user.id; // Assign userId with type casting
        }
        catch (error) {
            console.log('Invalid token');
            socket.close();
            return;
        }
        const { id } = user;
        onlineUsers.add(id);
        userSockets.set(id, socket);
        // Broadcast online users
        broadcast(wss, { type: 'connectedUsers', users: Array.from(onlineUsers) });
        socket.on('message', (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Parse the incoming message data
                const message = JSON.parse(data.toString());
                const { type, payload } = message;
                // Ensure payload is correctly structured for each case
                if (!payload) {
                    console.log('Payload is missing for event:', type);
                    return;
                }
                switch (type) {
                    case 'message':
                        if (payload.receiverId && payload.message) {
                            yield handleMessage(payload, socket); // Pass payload directly to handleMessage
                        }
                        else {
                            console.log('Receiver ID or message is undefined');
                        }
                        break;
                    case 'fetchChats':
                        if (payload.roomId) {
                            yield handleFetchChats(payload, socket);
                        }
                        else {
                            console.log('Room ID is missing for fetchChats');
                        }
                        break;
                    case 'unReadMessages':
                        if (payload.roomId) {
                            yield handleUnreadMessages(id, payload, socket);
                        }
                        else {
                            console.log('Room ID is missing for unReadMessages');
                        }
                        break;
                    case 'messageList':
                        yield handleMessageList(id, socket);
                        break;
                    case 'createGroupRoom': // New case for creating a group room
                        yield handleCreateGroupRoom(payload, socket);
                        break;
                    case 'joinGroupRoom': // New case for joining a group room
                        yield handleJoinGroupRoom(payload, socket);
                        break;
                    default:
                        console.log('Unknown event type:', type);
                }
            }
            catch (error) {
                console.error('Error processing message:', error);
            }
        }));
        socket.on('close', () => {
            console.log('User disconnected');
            onlineUsers.delete(id);
            userSockets.delete(id);
            // Notify all clients about the user's offline status
            broadcast(wss, { type: 'userStatus', userId: id, isOnline: false });
        });
    });
    return wss;
}
exports.setupWebSocket = setupWebSocket;
// New function to create a group room if it doesn't exist
function handleCreateGroupRoom(payload, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const { participants, groupName } = payload;
        if (!participants || participants.length < 1) {
            console.log('At least one participant is required for a group chat');
            return;
        }
        const senderId = socket.userId;
        // Add sender to the participants list
        const allParticipants = [...participants, senderId];
        // Ensure all participants exist in the database (this step can be optimized further)
        const existingUsers = yield prisma_1.default.user.findMany({
            where: {
                id: { in: allParticipants },
            },
            select: { id: true },
        });
        // Check if all participants exist
        const existingUserIds = existingUsers.map(user => user.id);
        const missingUserIds = allParticipants.filter(id => !existingUserIds.includes(id));
        if (missingUserIds.length > 0) {
            console.log('Some users do not exist in the database:', missingUserIds);
            return;
        }
        // Create a new group room
        const room = yield prisma_1.default.room.create({
            data: {
                name: groupName,
                type: 'GROUP', // It's a group chat
                participants: {
                    create: allParticipants.map(userId => ({
                        userId, // Create a connection in RoomUser model between the Room and User
                    })),
                },
            },
            include: {
                participants: { select: { userId: true } },
            },
        });
        socket.send(JSON.stringify({
            type: 'groupRoomCreated',
            groupRoomId: room.id, // Send the group room ID back to the client
            groupName: room.name, // Send the group room name back to the client
        }));
        console.log('Group room created successfully:', room);
    });
}
function handleJoinGroupRoom(payload, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const { roomId } = payload;
        const userId = socket.userId;
        if (!roomId) {
            console.log('Room ID or User ID is missing');
            return;
        }
        // Check if the room exists
        const room = yield prisma_1.default.room.findUnique({
            where: { id: roomId },
            include: { participants: { select: { userId: true } } }, // Include participants
        });
        if (!room) {
            console.log('Room not found');
            socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        // Check if the user is already a participant
        const isUserAlreadyInRoom = room.participants.some(participant => participant.userId === userId);
        if (isUserAlreadyInRoom) {
            console.log('User is already in the room');
            socket.send(JSON.stringify({ type: 'error', message: 'User is already in the room' }));
            return;
        }
        // Add the user to the room
        yield prisma_1.default.room.update({
            where: { id: roomId },
            data: {
                participants: {
                    connectOrCreate: {
                        where: { id: userId },
                        create: { userId },
                    }, // Connect or create the user in the room
                },
            },
        });
        // Notify the other participants about the new user
        room.participants.forEach(participant => {
            const userSocket = userSockets.get(participant.userId);
            if (userSocket) {
                userSocket.send(JSON.stringify({
                    type: 'userJoined',
                    message: `${userId} has joined the room`,
                }));
            }
        });
        // Notify the new user about the successful join
        socket.send(JSON.stringify({
            type: 'success',
            message: `You have successfully joined the room.`,
        }));
        console.log(`${userId} joined the group room ${roomId}`);
    });
}
function handleMessage(payload, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const { receiverId, message, images, isGroup } = payload;
        if (!receiverId || !message) {
            console.log('Receiver ID or message is undefined');
            return;
        }
        // Get senderId from WebSocket connection (token should be verified earlier)
        const senderId = socket.userId; // Access userId
        let room;
        if (isGroup) {
            // If it's a group message, we use the roomId (receiverId is the room ID here)
            room = yield prisma_1.default.room.findUnique({
                where: { id: receiverId }, // receiverId is treated as roomId for group chats
                include: { participants: { select: { userId: true } } },
            });
        }
        else {
            // If it's a one-to-one message, use the senderId and receiverId
            room = yield prisma_1.default.room.findFirst({
                where: {
                    OR: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId },
                    ],
                },
                include: { participants: { select: { userId: true } } },
            });
        }
        if (!room) {
            // If no room exists, create a new room for one-to-one chat
            room = yield prisma_1.default.room.create({
                data: {
                    type: 'ONE_TO_ONE', // It's a one-to-one chat
                    senderId, // Set senderId for the one-to-one chat
                    receiverId, // Set receiverId for the one-to-one chat
                    participants: {
                        create: [
                            { userId: senderId }, // Create the connection for the sender
                            { userId: receiverId }, // Create the connection for the receiver
                        ],
                    },
                },
                include: {
                    participants: { select: { userId: true } }, // Include participants to verify the connection
                },
            });
        }
        // Create the chat message
        const chat = yield prisma_1.default.chat.create({
            data: {
                senderId,
                roomId: room.id,
                message,
                images: { set: images || [] },
            },
        });
        // Broadcast the message to all participants in the group
        if (room.type === 'GROUP') {
            room.participants.forEach(participant => {
                const userSocket = userSockets.get(participant.userId);
                if (userSocket) {
                    userSocket.send(JSON.stringify({ type: 'message', chat }));
                }
            });
        }
        else {
            // For one-to-one chat, send the message to both the sender and receiver
            const receiverSocket = userSockets.get(receiverId);
            if (receiverSocket) {
                receiverSocket.send(JSON.stringify({ type: 'message', chat }));
            }
            // Notify the sender as well
            socket.send(JSON.stringify({ type: 'message', chat }));
        }
    });
}
function handleUnreadMessages(userId, payload, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!payload.roomId) {
            console.log('Room ID is undefined');
            return;
        }
        const room = yield prisma_1.default.room.findUnique({
            where: { id: payload.roomId },
        });
        if (!room) {
            console.log('Room not found');
            return;
        }
        const unReadMessages = yield prisma_1.default.chat.findMany({
            where: { roomId: room.id, isRead: false, receiverId: userId },
        });
        const unReadMessagesCount = unReadMessages.length;
        if (unReadMessagesCount === 0) {
            socket.send(JSON.stringify({
                type: 'noUnreadMessages',
                message: 'No unread messages',
            }));
            return;
        }
        socket.send(JSON.stringify({
            type: 'unReadMessages',
            unReadMessages,
            unReadMessagesCount,
        }));
    });
}
function handleMessageList(userId, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const rooms = yield prisma_1.default.room.findMany({
            where: { participants: { some: { userId } } },
            include: {
                chat: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });
        const roomIds = rooms.map(room => room.id);
        const roomsWithUnreadMessages = yield Promise.all(rooms.map((room) => __awaiter(this, void 0, void 0, function* () {
            const unReadMessagesCount = yield prisma_1.default.chat.count({
                where: { roomId: room.id, isRead: false, receiverId: userId },
            });
            return {
                chat: room.chat[0],
                unReadMessagesCount,
            };
        })));
        socket.send(JSON.stringify({ type: 'messageList', rooms: roomsWithUnreadMessages }));
    });
}
function broadcast(wss, data) {
    wss.clients.forEach(client => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
function handleFetchChats(payload, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const { roomId } = payload;
        if (!roomId) {
            console.log('Room ID is undefined');
            return;
        }
        const room = yield prisma_1.default.room.findUnique({
            where: { id: roomId },
            include: {
                chat: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        const chats = yield prisma_1.default.chat.updateMany({
            where: { roomId, isRead: false },
            data: { isRead: true },
        });
        if (!chats) {
            console.log('Error updating chat status');
            return;
        }
        if (!room) {
            console.log('Room not found');
            socket.send(JSON.stringify({
                type: 'error',
                message: 'Room not found',
            }));
            return;
        }
        socket.send(JSON.stringify({
            type: 'fetchChats',
            chats: room.chat,
        }));
    });
}
