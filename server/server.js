import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app = express();
app.use(cors());

app.post(
  "/api/clerk/webhook",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// normal json for other routes
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("API is working"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`server is working in port ${PORT}`)
);
