import { Note } from "../models/note.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createNote = asyncHandler(async (req, res) => {
  const { title, content, noteColor, isEncrypted } = req.body;
  const { _id } = req.user;
  if (!title || !content) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const note = new Note({
    title,
    content,
    userId: _id,
    noteColor,
    isEncrypted,
  });

  await note.save();
  return res
    .status(201)
    .json({ success: true, message: "Note created successfully" });
});

const editNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, isPinned, noteColor } = req.body;

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (isPinned !== undefined) updateData.isPinned = isPinned;
  if (noteColor !== undefined) updateData.noteColor = noteColor;

  const updatedNote = await Note.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!updatedNote) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  if (updatedNote?.userId?.toString() !== req.user?._id?.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "You cannot edit this note" });
  }

  return res
    .status(200)
    .json({ success: true, message: "Note updated successfully" });
});

const getAllNotes = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const notes = await Note.find({ userId: _id, isEncrypted: false }).sort({
    isPinned: -1,
  });

  if (!notes) {
    return res.status(404).json({ success: false, message: "No notes found" });
  }

  return res.status(200).json({
    success: true,
    message: "Notes fetched successfully",
    data: notes,
  });
});

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;

  const note = await Note.findOne({ _id: id, userId: _id });
  if (!note) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  await Note.deleteOne({ _id: id, userId: _id });

  return res
    .status(200)
    .json({ success: true, message: "Note deleted successfully" });
});

const updateNotePinned = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { _id } = req.user;
  const { pinStatus } = req.body;

  if (typeof pinStatus !== "boolean") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid pin status" });
  }

  const note = await Note.findById(noteId);

  if (!note) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  if (note.userId.toString() !== _id.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "You cannot edit this note" });
  }

  note.isPinned = pinStatus;
  await note.save();

  return res.status(200).json({
    success: true,
    message: pinStatus
      ? "Note pinned successfully"
      : "Note unpinned successfully",
  });
});

const updateIsEncrypted = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { isEncrypted } = req.body;
  const { _id } = req.user;

  if (typeof isEncrypted !== "boolean") {
    return res
      .status(400)
      .json({ success: false, message: "Value must be a boolean" });
  }

  const note = await Note.findById(noteId);
  if (!note) {
    return res.status(404).json({ success: false, message: "Note not found" });
  }

  if (note?.userId?.toString() !== _id?.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "You cannot edit this note" });
  }

  note.isEncrypted = isEncrypted;
  await note.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: isEncrypted
      ? "Note added to private notes"
      : "Note removed from private notes",
  });
});

const getPrivateNotes = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { key } = req.body;

  try {
    const notes = await Note.find({ userId: _id, isEncrypted: true }).sort({
      isPinned: -1,
    });
    if (!notes) {
      return res
        .status(404)
        .json({ success: false, message: "No private notes found" });
    }

    return res.status(200).json({
      success: true,
      message: "Private notes fetched successfully",
      data: notes,
    });
  } catch (error) {
    console.error("Error fetching private notes:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

const searchNotes = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const { _id } = req.user;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Search keyword is required",
    });
  }

  const notes = await Note.find({
    userId: _id,
    isEncrypted: false,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ],
  });

  if (!notes.length) {
    return res.status(404).json({
      success: false,
      message: "No notes found matching the search criteria",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Notes retrieved successfully",
    data: notes,
  });
});

export {
  searchNotes,
  createNote,
  editNote,
  getAllNotes,
  deleteNote,
  updateNotePinned,
  getPrivateNotes,
  updateIsEncrypted,
};
