import { Schema, model } from "mongoose";

export const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noteColor: {
      type: String,
      enum: ["#fcc96e", "#00d3fb", "#e3ee8e", "#fd9c71", "#b493fb", "#ffffff"],
      default: "#ffffff",
    },
    isEncrypted: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
  },
  { timestamps: true }
);

export const Note = model("Note", noteSchema);
