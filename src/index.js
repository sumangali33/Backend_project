import connectDB from "./db/index.js";
import {app} from "./app.js";
connectDB()
.then(()=>{
    app.on("error", (error)=>{
        console.log("error ",error);
        throw error;
    });
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`http://localhost:${process.env.PORT}/`);
    })
})
.catch((err)=>{
console.log("MONGODB connection error:",err);
});
