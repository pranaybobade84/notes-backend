import { EncryptedNoteKey } from "../models/encryptedPassword.js";
import { Note } from "../models/note.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createEncryptedKey = asyncHandler(async (req, res) => {
  const { key } = req.body;
  const { _id } = req.user;

  if (!key) {
    return res.status(400).json({ success: false, message: "Key is required" });
  }

  const existedKey = await EncryptedNoteKey.findOne({ userId: _id });
  if (existedKey) {
    return res.status(400).json({ success: false, message: "Key already set" });
  }

  const encKey = new EncryptedNoteKey({
    privateKey: key,
    userId: _id,
  });

  await encKey.save();
  return res
    .status(201)
    .json({ success: true, message: "Key created successfully" });
});

const getKey = asyncHandler(async (req, res) => {
  const key = await EncryptedNoteKey.findOne({ userId: req.user._id });

  if (!key) {
    return res.status(404).json({ success: false, message: "Key not found" });
  }

  return res
    .status(200)
    .json({ success: true, message: "Key found", data: key });
});

const resetEncryptedKey = asyncHandler(async (req, res) => {
  const { oldKey, newKey, conformKey } = req.body;
  console.log(oldKey, newKey, conformKey)
  const { _id } = req.user;

  if (!oldKey || !newKey || !conformKey) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const key = await EncryptedNoteKey.findOne({ userId: _id });

  if (!key) {
    return res.status(404).json({ success: false, message: "Key not found" });
  }

  const isValidKey = await key.verifyEncryptionKey(oldKey);
  if (!isValidKey) {
    return res.status(400).json({ success: false, message: "Invalid old key" });
  }

  if (conformKey !== newKey) {
    return res
      .status(400)
      .json({ success: false, message: "New keys don't match" });
  }

  key.encryptionKey = newKey;
  await key.save();

  return res
    .status(200)
    .json({ success: true, message: "Key updated successfully" });
});

const verifyEncryptionKey = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { privateKey } = req.body;

  if (!privateKey) {
    return res.status(400).json({ success: false, message: "Key is required" });
  }

  const key = await EncryptedNoteKey.findOne({ userId: _id });
  if (!key) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid user ID or key not found" });
  }

  const isValidKey = await key.verifyEncryptionKey(privateKey);
  if (!isValidKey) {
    return res.status(400).json({ success: false, message: "Invalid key" });
  }

  const notes = await Note.find({ userId: _id, isEncrypted: true });

  if (!notes || notes.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No encrypted notes found" });
  }

  return res
    .status(200)
    .json({ success: true, message: "Key is correct", data: notes });
});

export { createEncryptedKey, getKey, resetEncryptedKey, verifyEncryptionKey };
