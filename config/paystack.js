export const paystack ={
    async post (path ,body){
        const res =await fetch (`https://api.paystack.co${path}`,{
            method :"POST",
            headers:{
                "Authorization" :`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type":"application/json",
            },
            body:JSON.stringify(body),
        });

        const data =await res.json().catch(()=> ({}));
        if  (!res.ok){
            const err=new Error ("Paystack request failed");
            err.response={data};
            throw err;
        }
        return {data};
    },

    async get (path ){
        const res =await fetch(`https://api.paystack.co${path}`,{
            method:"GET",
            headers:{
                Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        const data =await res.json().catch(()=>({}));
        if (!res.ok){
            const err =new Error ("paystack request failed");
            err.response={data}
            throw err;
        }
        return {data};
    }
}