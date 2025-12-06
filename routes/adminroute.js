import express from 'express'

import adminLogin from '../controllers/admin.js'

const adminRouter =express.Router()

adminRouter.post('/',adminLogin)

export default adminRouter