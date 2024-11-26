import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import validator from "validator";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: [4, "Please enter atleast four charactres"],
      maxLength: [20, "Too many characters"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: [4, "Too many characters"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter Strong Password");
        }
      },
    },
    refreshToken: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  const hashedPassword = await bcrypt.compare(password, this.password);
  return hashedPassword;
};

userSchema.methods.CREATE_ACCESS_TOKEN = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  return token;
};
userSchema.methods.CREATE_REFRESH_TOKEN = function () {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  return token;
};

export const User = model("User", userSchema);
