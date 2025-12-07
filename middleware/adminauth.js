import jwt from 'jsonwebtoken'

export const adminAuth =(req, res ,next)=>{
    try {
        const authHeader =req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({sucess:false, messsage :"not authorized .login again"})
        }
        
        const token =authHeader.split(" ")[1];
        const decoded =jwt.verify(token,process.env.JWT_SECRET);

        if (decoded.id !== process.env.ADMIN_EMAIL){
            return res.status (401).json({success:false,message:"not authorized .login again "})
        }
        next()

    } catch (error) {
        console.error(error);
        res.status(401).json({sucess:false,message:"invalid credentials"})
    }
}