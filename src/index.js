import dotenv from "dotenv";
import connectDB from "./db";
import app from "./app";

dotenv.config({
    path:"./env"
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`server is listening on port: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO DB connect FAILED",err)
})