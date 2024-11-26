import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const EncryptedNoteKeySchema = new Schema(
  {
    privateKey: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

EncryptedNoteKeySchema.pre("save", async function (next) {
  try {
    if (this.isModified("privateKey") || this.isNew) {
      this.privateKey = await bcrypt.hash(this.privateKey, 10);
    }
    next();
  } catch (err) {
    next(err);
  }
});

EncryptedNoteKeySchema.methods.verifyEncryptionKey = async function (key) {
  return await bcrypt.compare(key, this.privateKey);
};

export const EncryptedNoteKey = model(
  "EncryptedNoteKey",
  EncryptedNoteKeySchema
);
