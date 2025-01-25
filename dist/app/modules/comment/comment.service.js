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
exports.commentService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createCommentIntoDb = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.create({
        data: {
            tripId: data.tripId,
            comment: data.comment,
            userId: userId,
            parentId: data.parentId || null, // Ensure parentId is null if not provided
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Comment not created');
    }
    return result;
});
const getNestedReplies = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
    // Recursively fetch replies for a given parentId
    const replies = yield prisma_1.default.comment.findMany({
        where: {
            parentId: parentId, // Fetch replies for the current comment
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    image: true,
                    role: true,
                },
            },
            replies: false, // We will handle the recursive replies in the parent function
        },
    });
    // For each reply, fetch its nested replies
    for (const reply of replies) {
        reply.replies = yield getNestedReplies(reply.id); // Recursively fetch replies for this reply
    }
    return replies.map(reply => (Object.assign(Object.assign({}, reply), { replies: reply.replies || [] })));
});
const getCommentListFromDb = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch all comments for the given tripId, including top-level comments and replies
    const comments = yield prisma_1.default.comment.findMany({
        where: {
            tripId: tripId, // Fetch all comments for the given tripId
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    image: true,
                    role: true,
                },
            },
            replies: false, // We will manually fetch the replies for each comment
        },
    });
    if (comments.length === 0) {
        return [];
    }
    // Organize comments into a hierarchical structure
    const topLevelComments = comments.filter(comment => comment.parentId === null);
    // For each top-level comment, fetch its nested replies
    for (const comment of topLevelComments) {
        comment.replies = yield getNestedReplies(comment.id);
    }
    return topLevelComments.map(comment => (Object.assign(Object.assign({}, comment), { replies: comment.replies || [] })));
});
const getCommentsByTripId = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Fetch all comments for the trip
    const comments = yield prisma_1.default.comment.findMany({
        where: { tripId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    image: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc', // Sort comments by creation time
        },
    });
    // Step 2: Prepare comment map and top-level comments
    const commentMap = {};
    const topLevelComments = [];
    comments.forEach(comment => {
        const commentWithReplies = Object.assign(Object.assign({}, comment), { replies: [], user: comment.user });
        commentMap[comment.id] = commentWithReplies;
        if (!comment.parentId) {
            // Add top-level comments to the result array
            topLevelComments.push(commentWithReplies);
        }
    });
    // Step 3: Link all replies to their parent comments
    comments.forEach(comment => {
        if (comment.parentId && commentMap[comment.parentId]) {
            commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        }
    });
    // Step 4: Flatten nested replies into a single level for each top-level comment
    topLevelComments.forEach(topLevelComment => {
        const allReplies = [];
        // Helper function to collect all nested replies
        const collectReplies = (replies) => {
            replies.forEach(reply => {
                allReplies.push(reply); // Add the reply
                if (reply.replies.length > 0) {
                    collectReplies(reply.replies); // Recursively collect nested replies
                }
            });
        };
        collectReplies(topLevelComment.replies); // Flatten replies for this top-level comment
        topLevelComment.replies = allReplies; // Assign flattened replies
    });
    return topLevelComments;
});
const getCommentByIdFromDb = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.findUnique({
        where: {
            id: tripId,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    }
    return result;
});
const replyCommentByTripIdFromDb = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.findUnique({
        where: {
            id: data.commentId,
            tripId: data.tripId,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    }
    const reply = yield prisma_1.default.comment.create({
        data: {
            tripId: data.tripId,
            parentId: data.parentId,
            userId: userId,
            comment: data.comment,
        },
    });
    if (!reply) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Comment not created');
    }
    return reply;
});
const updateCommentIntoDb = (userId, tripId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.update({
        where: {
            id: tripId,
            userId: userId,
        },
        data,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_MODIFIED, 'Comment not updated');
    }
    return result;
});
const deleteCommentItemFromDb = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch all replies for the comment
    const replies = yield prisma_1.default.comment.findMany({
        where: {
            parentId: commentId,
        },
    });
    // Collect all comment IDs to delete
    let commentIdsToDelete = [commentId, ...replies.map(reply => reply.id)];
    // Perform batch deletion
    const deletedItems = yield prisma_1.default.comment.deleteMany({
        where: {
            id: { in: commentIdsToDelete },
            userId: userId, // Ensure the user is authorized to delete the comment
        },
    });
    if (deletedItems.count === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Comment not deleted');
    }
    return deletedItems;
});
exports.commentService = {
    createCommentIntoDb,
    getCommentListFromDb,
    getCommentByIdFromDb,
    updateCommentIntoDb,
    deleteCommentItemFromDb,
    replyCommentByTripIdFromDb,
    getCommentsByTripId,
};
