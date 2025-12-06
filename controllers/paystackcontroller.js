import { paystack } from "../config/paystack";

export const initializePayment =async (req,res)=>{
    try {
        const {name,email,address,totolAmount}=req.body

        if (!email || !totalAmount){
            return res
            .status (400)
            .json({success:false ,message:"missing fields"})
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({success:false,message:"server error"})
    }
}

export const verifyPayment =async (req,res)=>{
    const reference =req.query.reference || req.query.trxref;
    if (!reference){
        return res 
        .status(400)
        .json({success:false ,message :"missing transaction reference"})
    }
};


export const paystackWebhook = async (req,res)=>{
    console.log("webhook Payload :", JSON.stringify(req.body,null,2))

    const crypto =await import ("crypto");
    const hash =crypto
    .createHmac("sha512",process.env.PAYSTACK_SECRET_KEY)
    .update (JSON.stringify(req.body))
    .digest("hex");

    const signature =req.headers["x-paystack-signature"];
    if (hash !==signature){
        console.error ("invalid webhook signature");
        return res.status (400).send("invalid signature");
    }
}