const mongoose = require("mongoose");
const { DB_CONNECTION } = require("../utilities/configs");
module.exports = async () => {
  const connection = await mongoose.connect(DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  return connection.connection.db;
};
