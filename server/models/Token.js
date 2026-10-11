const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
    {
        queue:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Queue",
            required: true,
        },
        customer:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tokenNumber:{
            type:Number,
            required:true,
            min:1,
        },
        status:{
            type:String,
            enum:["waiting","serving","completed","cancelled"],
            default:"waiting",
        },
        joinedAt:{
            type:Date,
            default:Date.now,
        },
    },
    {
        timestamps: true
    }
)

// a token number must be unique within its queue
tokenSchema.index(
    {queue:1 , tokenNumber:1},
    {unique:true}
);

module.exports = mongoose.model('Token',tokenSchema);