import express from 'express';
import { UserRouters } from '../modules/user/user.routes';
import { AuthRouters } from '../modules/auth/auth.routes';
import { ParcelRoutes } from '../modules/parcel/parcel.routes';
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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
