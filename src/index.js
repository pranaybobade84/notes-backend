import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 4005;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SERVER LISTENING ON ${PORT}`);
  });
});
