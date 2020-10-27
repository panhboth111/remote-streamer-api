const mongoose = require("mongoose");

module.exports = async () => {
  const connection = await mongoose.connect(process.env.DBCONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return connection.connection.db;
};
