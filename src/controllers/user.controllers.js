import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;
  if (
    [userName, fullName, email, password].some((field) => field.trim() === "")
  ) {
    return res.status(400).send({ message: "All fields are required" });
  }
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    return res
      .status(409)
      .json({ success: false, message: "User already exists" });
  }

  const user = new User({
    userName,
    fullName,
    email,
    password,
  });

  await user.save();

  return res
    .status(201)
    .json({ success: true, message: "User created successfully" });
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, conformPassword } = req.body;
  console.log(oldPassword, newPassword, conformPassword);

  if (
    [oldPassword, newPassword, conformPassword]?.some(
      (field) => field?.trim() === ""
    )
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const user = await User.findById(req?.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const isPasswordCorrect = await user.verifyPassword(oldPassword);
  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid old password" });
  }

  if (newPassword !== conformPassword) {
    return res.status(400).json({
      success: false,
      message: "New password and confirmation password do not match",
    });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
});

const getUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  if (!_id) {
    return res.status(401).json({
      success: false,
      message: "You are not authenticated, please login",
    });
  }

  const user = await User.findById(_id).select("-password -refreshToken");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res
    .status(200)
    .json({
      success: true,
      message: "User data fetched successfully",
      data: user,
    });
});

const editInfo = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { userName, fullName } = req.body;

  if (!_id) {
    return res.status(401).json({ success: false, message: "Please login" });
  }

  const user = await User.findById(_id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (userName !== undefined && userName.trim() !== "") {
    user.userName = userName;
  }
  if (fullName !== undefined && fullName.trim() !== "") {
    user.fullName = fullName;
  }

  try {
    await user.save();
    return res.status(200).json({
      success: true,
      message: "User information updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user information",
      error: error.message,
    });
  }
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required to delete account",
    });
  }

  const user = await User.findById(_id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isValidPassword = await user.verifyPassword(password);

  if (!isValidPassword) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  await User.findByIdAndDelete(_id);

  return res
    .status(200)
    .json({ success: true, message: "Account deleted successfully" });
});

export {
  registerUser,
  changeCurrentPassword,
  getUser,
  deleteAccount,
  editInfo,
};
