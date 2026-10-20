const mongoose=require("mongoose");
const connectDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongodb connect successfully");
        
    }catch(error){
        console.log("mongo db not connects",error.message);
        
    }
};
module.exports=connectDB;
