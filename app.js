const express = require("express");
const cluster = require("cluster");
const logger = require("./config/logger");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const appRoot = require('app-root-path') 
const createError = require("http-errors");

const authRouter = require("./src/router/auth");

const app = express();
dotenv.config({ path: `${appRoot}/config/config.env` });

app.use(cors({ origin: process.env.CLIENT_ADDRESS, credentials: true,}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(function (err, req, res, next) {
 console.log('error app.js', err)
});

app.use(function (req, res, next) {
  console.log(`công nhân ${process.pid} làm việc : ${new Date()}` );
  // logger.writeLog("info", `công nhân ${process.pid} làm việc`);
  next()
});

//router
app.use("/auth", authRouter);

module.exports = app;
