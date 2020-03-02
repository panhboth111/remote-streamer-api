const express = require("express");
const router = express.Router();
const verify = require("../utilities/VerifyToken");
const UserService = require("../services/UserService");
const userService = new UserService();

// Get all user info
router.get("/allUsers", verify, async (req, res) => {
  const users = await userService.allUsers(req.user.role, req.user.email);
  return res.json(users);
});

// Get user Info
router.get("/user", verify, async (req, res) => {
  const user = await userService.user(req.user);
  return res.json(user);
});

// Change user's name
router.post("/changeName",verify, async(req,res) => {
  const response = await userService.changeName(req.user, req.body)
  return res.json(response)
})

// Changer user role
router.post("/changeRole", verify, async (req, res) => {
  const response = await userService.changeRole(req.user, {
    targetUser: req.body.email,
    targetRole: req.body.role
  });
  return res.json(response);
});
// Change cover
router.post("/changeCover", verify, async (req, res) => {
  const response = await userService.changeCoverPic(req.body, req.user);
  return res.json(response);
});
// Change profile picture
router.post("/changeProfile", verify, async (req, res) => {
  const response = await userService.changeProfilePic(req.body, req.user);
  return res.json(response);
});
// Get user history
router.get("/userHistory", verify, async (req, res) => {
  const response = await userService.getUserHistory(req.user);
  return res.json(response);
});

module.exports = router;
