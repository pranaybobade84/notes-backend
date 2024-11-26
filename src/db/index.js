import mongoose from "mongoose";
import app from "../app.js";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URL + DB_NAME
    );
    app.on("error", () => {
      console.log(`ERROR OCCURED on Connecting ${error}`);
    });

    console.log(
      `\n MONGODB CONNECTED HOST !! ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.log(`ERROR WHILE CONNNECTION ${err}`);
  }
};

export default connectDB;
