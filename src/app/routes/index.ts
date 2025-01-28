import express from 'express';
import { UserRouters } from '../modules/user/user.routes';
import { AuthRouters } from '../modules/auth/auth.routes';
import { ParcelRoutes } from '../modules/parcel/parcel.routes';
import path from 'path';
import { commentRoutes } from '../modules/comment/comment.routes';
import { terminalRoutes } from '../modules/terminal/terminal.routes';
import { tripRoutes } from '../modules/trip/trip.routes';
import { terminalFeedRoutes } from '../modules/terminalFeed/terminalFeed.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { reviewRoutes } from '../modules/review/review.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { destinationRoutes } from '../modules/destination/destination.routes';
import { NotificationRoutes } from '../modules/Notification/Notification.routes';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/parcels',
    route: ParcelRoutes,
  },
  {
    path: '/comments',
    route: commentRoutes,
  },
  {
    path: '/terminals',
    route: terminalRoutes,
  },
  {
    path: '/trips',
    route: tripRoutes,
  },
  {
    path: '/terminal-feeds',
    route: terminalFeedRoutes,
  },
  {
    path: '/categories',
    route: categoryRoutes,
  },
  {
    path: '/reviews',
    route: reviewRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/destinations',
    route: destinationRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
