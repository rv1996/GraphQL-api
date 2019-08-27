const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const eventSchema = new Schema();
// or 

const eventSchema = mongoose.Schema({
    title: {
        type:String,
        require:true
    },
    description: {
        type:String,
        require:true
    },
    price: {
        type:Number,
        require:true
    },
    date: {
        type:Date,
        require:true
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }
});


module.exports = mongoose.model("Events",eventSchema);
