const functions = require("firebase-functions");
const express = require("express");
const routes = require("./routes");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

routes(app);

exports.api = functions.https.onRequest(app);
