/* eslint-disable require-jsdoc */
const twilioRoutes = require("./twilio");

function routes(app) {
  app.use("/twilio", twilioRoutes);
}

module.exports = routes;
