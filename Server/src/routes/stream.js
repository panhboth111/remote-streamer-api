const express = require("express");
const router = express.Router();
const StreamService = require("../services/StreamService");
const streamService = new StreamService();
const verify = require("../utilities/VerifyToken");
// Start stream
router.post("/startStream", verify, async (req, res) => {
  const response = await streamService.startStream(
    { owner: req.user.email, ownerName: req.user.name },
    req.body
  );
  return res.json(response);
});
// Device start stream
router.post("/deviceStartStream", verify, async (req, res) => {
  const response = await streamService.deviceStartStream(
    { deviceEmail: req.user.email, deviceName: req.user.name },
    req.body
  );
  return res.json(response);
});
// Join Stream
router.post("/joinStream", verify, async (req, res) => {
  const response = await streamService.joinStream(req.user, {
    streamCode: req.body.streamCode,
    password: req.body.pwd
  });
  return res.json(response);
});
// Stop stream
router.post("/stopStream", verify, async (req, res) => {
  console.log("I'm here");
  const response = await streamService.stopStream(req.user.email);
  return res.json(response);
});

router.post("/adminStopStream", verify, async (req, res) => {
  console.log("I'm also here");
  const response = await streamService.adminStopStream(req.user, req.body);
  return res.json(response);
});

// Edit stream
router.post("/editstream", verify, async (req, res) => {
  const response = await streamService.editStream(req.body, req.user);
  return res.json(response);
});
// Get currently stream of all class participated
router.post("/getCurrentlyStream", verify, async (req, res) => {
  var limit = req.body.limit == null ? 0 : req.body.limit;
  var status = req.body.status;
  const response = await streamService.getCurrentStreams(limit, status);
  return res.json(response);
});
// Get Stream Detials
router.post("/getStreamDetail", verify, async (req, res) => {
  const response = await streamService.getStreamDetail(req.body);
  return res.json(response);
});

module.exports = router;
