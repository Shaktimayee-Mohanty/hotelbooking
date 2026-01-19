import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js"
import { clerkMiddleware } from '@clerk/express'
import clerkwebhooks from "./controllers/clerkWebhooks.js";


connectDB()

const app=express()
app.use(cors())

//Middleware used
app.use(express.json)
app.use(clerkMiddleware())

//API tio listrn to clerk webhooks
app.use("/api/clerk",clerkwebhooks)



app.get('/',(req,res)=>res.send("API is working"))

const PORT=process.env.PORT || 4000;

app.listen(PORT,()=>console.log(`server is working in port ${PORT}`));