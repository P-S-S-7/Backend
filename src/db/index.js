// require("dotenv").config({path: "./env"});

import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config({ path: "./env" });

const connectDB = async () => {
  try {
    const connectionInstance =  await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log(`\n Connected to MongoDB !! DB HOST: ${connectionInstance.connection.host} \n`);

  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
    process.exit(1);
  }
}

export default connectDB;