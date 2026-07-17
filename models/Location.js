const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    name: {
    type: String
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    },

    speed: {
        type: Number,
        default: 0
    },

    accuracy: {
        type: Number,
        default: 0
    },

    address: {
        type: String,
        default: "Address Not Found"
    },

    status: {
        type: String,
        default: "Online"
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Location", LocationSchema);