import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';


const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
};

export const adminLogin= async (req,res)=>{
    try {
        const {email,password}=req.body;
        if (email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token =createToken(email);
            return res.json({sucess:true,token})
        }else {
            return res.json({suceess:false ,message:"invalid credentials"})
        }
    } catch (error) {
        console.error (error)
        res.json({sucess:false,message :error.message})
    }
}