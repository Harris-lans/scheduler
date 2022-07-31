const express = require("express");
const twilio = require("twilio");

// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/token", (req, res) => {
  const accessToken = new twilio.jwt.AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET
  );
  accessToken.identity = Math.random().toString(36).substring(2);
  const grant = new twilio.jwt.AccessToken.SyncGrant({
    serviceSid: process.env.TWILIO_SYNC_SERVICE_SID,
  });
  accessToken.addGrant(grant);
  res.send({
    token: accessToken.toJwt(),
  });
});

module.exports = router;
