const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
    {
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },

        date: {
            type: String,
            required: true,
        },

        lastTokenNumber: {
            type: Number,
            default: 0,
            min: 0,
        },

        status: {
            type: String,
            enum: ["open","paused","closed"],
            default: "open",
        },
    },
    {
        timestamps: true,
    }
);

queueSchema.index(
    {service: 1 , date: 1},
    {unique: true}
);

module.exports = mongoose.model("Queue",queueSchema);
