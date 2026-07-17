const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({

    id: String,

    lat: Number,

    lng: Number,

    speed: Number,

    accuracy: Number,

    status: String,

    lastUpdated: String,

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Location", LocationSchema);