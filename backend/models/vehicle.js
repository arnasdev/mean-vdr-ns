const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  registration: { type: String, required: true },
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  tax: { type: String, required: true },
  nct: { type: String, required: true },
  insurance: { type: String, required: true },
  service: { type: String, required: true },
  license: { type: String, required: true },
  cpc: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model('Vehicle', postSchema);
