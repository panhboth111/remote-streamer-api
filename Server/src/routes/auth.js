const express = require("express");
const router = express.Router();
const verify = require("../utilities/VerifyToken");
const UserService = require("../services/UserService");
const userService = new UserService();
// Sign Up for an account
router.post("/signUp", async (req, res) => {
  const response = await userService.signUp(req.body);
  res.send(response);
});
//Login
router.post("/login", async (req, res) => {
  const response = await userService.signIn(req.body);
  return res.json(response);
});
//change password
router.post(
  "/changePassword",
  verify,
  async ({ password, newPassword }, res) => {
    const response = await userService.changePassword(
      req.user.email,
      password,
      newPassword
    );
    return res.json(response);
  }
);
module.exports = router;
