const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const deviceSchema = mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notifications: { type: Boolean, required: true },
    deviceTokens: { type: [String] },
});

deviceSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Device', deviceSchema);
