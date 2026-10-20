const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        
    },
    phone:{
        type:String,
        required:true
    },
    bloodGroup:{
        type:String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required:true
    },
    dateOfBirth:{
        type:Date,
        required:true
    },
    city:{
        type:String,
        required:true

    },
    role:{
        type:String,
        enum:["Donor","Admin"],
        default:"Donor"
    }
},{
    timestamps:true


    
});
module.exports=mongoose.model("User",userSchema);


