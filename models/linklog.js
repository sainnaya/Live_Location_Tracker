const mongoose = require("mongoose");

const LinkLogSchema = new mongoose.Schema({

    token: String,

    ip: String,

    browser: String,

    userId: String,

    locationPermission: String,

    openedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("LinkLog", LinkLogSchema);