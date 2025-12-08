import express from 'express'

import adminLogin from '../controllers/adminAuth.js'

const adminRouter =express.Router()

adminRouter.post('/',adminLogin)

export default adminRouter