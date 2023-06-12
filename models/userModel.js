const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    first_name : String,
    last_name : String,
    email : String,
    phone : String,
    password : String,
    adddress : {
            text : String,
            country : String,
            state : String,
            city : String
            },
    location : {
                type:{type:String,enum:['Point'],default:'Point'},
                coordinates:{type:[Number]}
             },

        otp:String
    
},{timestamps : true});



userSchema.index({"location":"2dsphere"});
module.exports = mongoose.model("user",userSchema);