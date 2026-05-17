import express from 'express'
import cors from 'cors'
import 'dotenv/config' 
import cookieParser from 'cookie-parser'

import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'

const app = express()
const port = process.env.PORT || 4000 
connectDB()

const allowedOrigins = [
  process.env.VITE_FRONTEND_URL,
].filter(Boolean)

// app.use(cors({credentials:true}))
app.use(cors({origin: allowedOrigins, credentials:true}))
app.use(express.json())
app.use(cookieParser())

// api endpoints
app.get("/",(req,res)=>res.send("API WORKING"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

// port 
app.listen(port,()=>{console.log(`Server started on PORT : ${port}`);
})
