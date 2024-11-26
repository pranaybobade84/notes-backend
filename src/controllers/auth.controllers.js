import { options } from "../constants.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessRefreshToken = async (user) => {
  try {
    const accessToken = await user.CREATE_ACCESS_TOKEN();
    const refreshToken = await user.CREATE_REFRESH_TOKEN();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.log(`Error while JWT ${err}`);
  }
};

const login = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail) {
    return res
      .status(422)
      .json({ success: false, message: "Username or email is required" });
  }

  if (!password) {
    return res
      .status(422)
      .json({ success: false, message: "Password is required" });
  }

  const user = await User.findOne({
    $or: [{ userName: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const validPassword = await user.verifyPassword(password);

  if (!validPassword) {
    return res
      .status(401)
      .json({ success: false, message: "Incorrect username or password" });
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(user);

  if (!accessToken) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate access token" });
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message: "Login successful",
      data: { user, accessToken, refreshToken },
    });
});

const logout = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(
    _id,
    {
      $unset: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  if (!_id) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: "Successfully logged out" });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token is missing" });
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(user);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: true,
      message: "Access token refreshed successfully",
      data: { refreshToken, accessToken },
    });
});

export { login, logout, refreshAccessToken };
