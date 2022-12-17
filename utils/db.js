import mongoose from "mongoose";
import { DB_URL } from "../config/constants.js";

export function connectDB() {
  try {
    mongoose.set("strictQuery", false);
    mongoose
      .connect(DB_URL)
      .then(() => console.log("Connected to Database successfully"))
      .catch((err) => {
        throw new Error(err.message);
      });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
