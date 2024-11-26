import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "https://notes-frontend-uzu3.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import noteRouter from "./routes/note.routes.js";
import encryptedRouter from "./routes/encryptedPassword.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/note", noteRouter);
app.use("/api/v1/enc", encryptedRouter);

app.get("/", (req, res) => {
  res.json({ message: "Successfull" });
});

app.use(errorHandler);

export default app;
