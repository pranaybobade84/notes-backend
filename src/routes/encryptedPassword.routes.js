import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createEncryptedKey,
  getKey,
  resetEncryptedKey,
  verifyEncryptionKey,
} from "../controllers/encryptedPassword.controllers.js";

const router = Router();

router.route("/create-key").post(verifyToken, createEncryptedKey);
router.route("/edit-key").patch(verifyToken, resetEncryptedKey);
router.route("/verify-key").post(verifyToken, verifyEncryptionKey);
router.route("/").get(verifyToken, getKey);

export default router;
