import dotenv from "dotenv";
dotenv.config();

import "dotenv/config";
import cors from "cors";
import express from "express";
import { testConnection } from "./db/index.js";
import adminRouter from "./routes/auth.js";
import paystackRoutes from "./routes/paystackroute.js";
import adminRoutes from "./routes/adminRoutes.js";


const app=express()
const port =process.env.PORT ||4000

const allowedOrigins = [
  process.env.FRONTEND_URL,
];

const corsOptions = {
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/api/auth",adminRouter)
app.use("/api/paystack",paystackRoutes)
app.use("/api/admin",adminRoutes)

const start =async ()=>{
    try {
      await testConnection();
       app.listen(port, ()=>{
        console.log(`server is running on PORT :${port}`)
    })
    } catch (error) {
        console.error('failed to start server:',error)
        process.exit(1)
    }
}

start();
  