const mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    email:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:false
    },
    createdEvents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Events'
        }
    ]

})


module.exports = mongoose.model("Users",userSchema);
