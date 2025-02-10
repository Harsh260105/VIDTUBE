import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(
      `\n MongoDB connected ! DB host: ${connectionInstance.connection.host} \n`
    );
  } catch (error) {
    console.log("Failed to connect the database...");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
