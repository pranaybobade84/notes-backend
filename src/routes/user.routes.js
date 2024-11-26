import { Router } from "express";
import {
  changeCurrentPassword,
  deleteAccount,
  editInfo,
  getUser,
  registerUser,
} from "../controllers/user.controllers.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/reset-password").patch(verifyToken, changeCurrentPassword);

router.route("/me").get(verifyToken, getUser);

router.route("/delete-account").delete(verifyToken, deleteAccount);
router.route("/edit-info").patch(verifyToken, editInfo);

export default router;
