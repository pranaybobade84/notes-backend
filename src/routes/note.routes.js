import { Router } from "express";
import {
  createNote,
  deleteNote,
  editNote,
  getAllNotes,
  getPrivateNotes,
  searchNotes,
  updateIsEncrypted,
  updateNotePinned,
} from "../controllers/note.controllers.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

router.route("/add").post(verifyToken, createNote);

router.route("/edit/:id").patch(verifyToken, editNote);

router.route("/").get(verifyToken, getAllNotes);

router.route("/delete/:id").delete(verifyToken, deleteNote);

router.route("/is-pinned/:noteId").patch(verifyToken, updateNotePinned);

router.route("/is-encrypted/:noteId").patch(verifyToken, updateIsEncrypted);

router.route("/private-notes").get(verifyToken, getPrivateNotes);

router.route("/search").get(verifyToken, searchNotes);

export default router;
