
//handling in try catch and using async and await 



export const asyncHandler = (requestHandler)=> async(req,res,next)=>{
    try{
        await requestHandler(req,res,next);
    }catch(err){
        next(err);
    }
}


