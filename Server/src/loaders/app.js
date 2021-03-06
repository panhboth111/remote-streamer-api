const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// // Import Routes
const userRoute = require("../routes/users");
const authRoute = require("../routes/auth");
const streamRoute = require("../routes/stream");

module.exports = async app => {
  //MiddleWares
  app.use(function(req, res, next) {
  	res.header('Access-Control-Allow-Origin', '*');
    	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  	next();
  });
  app.use(bodyParser.json({ limit: "10mb", extended: true }));
  app.use(cors());
  app.use("/users", userRoute);
  app.use("/auth", authRoute);
  app.use("/streams", streamRoute);
  return app;
};
