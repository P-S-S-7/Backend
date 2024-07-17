import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
.then (() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port:${process.env.PORT}`);
  })
})
.catch((err) => {
    console.error("MongoDB connection error: ", err);
})


/*
import express from "express";

const app = express();

// IIFE(Immediately Invoked Function Expression) to connect to MongoDB
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log("Connected to MongoDB");

    app.on("error", (error) => {
        console.error("Error starting server: ", error);
        throw error;
        });
    app.listen(process.env.PORT, () => {
        console.log(`Server started at http://localhost:${process.env.PORT}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
    throw error;
  }
})()
*/