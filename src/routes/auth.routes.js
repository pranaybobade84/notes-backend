import { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

//POST ROUTE : http://localhost:4000/api/v1/auth/user/login
router.route("/login").post(login);

//POST ROUTE : http://localhost:4000/api/v1/auth/user/logout
router.route("/logout").post(verifyToken, logout);

router.route("/refresh-token").post(refreshAccessToken);

export default router;
