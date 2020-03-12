const mongoose = require("mongoose");

const schema = mongoose.Schema({
  action: {
    type: String
  },
  stream: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Streamings"
  },
  email: {
    type: String
  }
});

module.exports = mongoose.model("History", schema);
