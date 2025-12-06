import dotenv from 'dotenv'
import "dotenv/config"
import express from 'express'
import {testConnection} from "./db/index.js"
import adminRouter from './routes/adminroute.js'

const app=express()
const port =process.env.PORT ||4000

app.use(express.json());
app.use("/api/admin",adminRouter)

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
  