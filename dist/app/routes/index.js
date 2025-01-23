"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const parcel_routes_1 = require("../modules/parcel/parcel.routes");
const comment_routes_1 = require("../modules/comment/comment.routes");
const terminal_routes_1 = require("../modules/terminal/terminal.routes");
const trip_routes_1 = require("../modules/trip/trip.routes");
const terminalFeed_routes_1 = require("../modules/terminalFeed/terminalFeed.routes");
const category_routes_1 = require("../modules/category/category.routes");
const review_routes_1 = require("../modules/review/review.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_routes_1.AuthRouters,
    },
    {
        path: '/users',
        route: user_routes_1.UserRouters,
    },
    {
        path: '/parcels',
        route: parcel_routes_1.ParcelRoutes,
    },
    {
        path: '/comments',
        route: comment_routes_1.commentRoutes
    },
    {
        path: '/terminals',
        route: terminal_routes_1.terminalRoutes
    },
    {
        path: '/trips',
        route: trip_routes_1.tripRoutes
    },
    {
        path: '/terminal-feeds',
        route: terminalFeed_routes_1.terminalFeedRoutes
    },
    {
        path: '/categories',
        route: category_routes_1.categoryRoutes
    },
    {
        path: '/reviews',
        route: review_routes_1.reviewRoutes
    },
    {
        path: '/payments',
        route: payment_routes_1.PaymentRoutes
    }
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
