import dotenv from 'dotenv'
import "dotenv/config"
import express from 'express'
import {testConnection} from "./db/index.js"

const app=express()
const port =process.env.PORT ||4000

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
  