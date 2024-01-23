const express = require("express");
const cluster = require("cluster");
const logger = require("./config/logger");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const appRoot = require("app-root-path");
const createError = require("http-errors");
const compression = require('compression');
const helmet = require('helmet');

//get router
const authRouter = require("./src/router/auth");
const mainRouter = require("./src/router/main");
const martRouter = require("./src/router/mart");
const posRouter = require("./src/router/pos");
const partRouter = require("./src/router/partner");
const fcmRouter = require("./src/router/fcm");
const importRouter = require("./src/router/import");
const appBuilderRouter = require("./src/router/appBuilder");
const imagesRouter = require("./src/router/images");
const deliveryRouter = require("./src/router/delivery");
const productRouter = require("./src/router/product");

const app = express();
dotenv.config({ path: `${appRoot}/config/config.env` });

app.use(helmet()); // bảo vệ http
app.use(compression()); // nén response cho nhẹ băng thông
app.use(express.static("src/excel"));
app.use(cors({ origin: process.env.CLIENT_ADDRESS, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(function (err, req, res, next) {
  console.log("error app.js", err);
});

// error handler ==> app crash
process.on("unhandledRejection", (err) => {
    logger.writeLog("error", `${err}`);
    process.exit(0);
});
process.on("uncaughtException", (err) => {
    logger.writeLog("error", `${err}`);
    process.exit(0);
});

app.use(function (err, req, res, next) {
  console.log(`công nhân ${process.pid} làm việc : ${new Date()}`);
  // logger.writeLog("info", `công nhân ${process.pid} làm việc`);
  next();
});

//use router
app.use("/auth", authRouter);
app.use("/main", mainRouter);
app.use("/sales_collection", martRouter);
app.use("/pos", posRouter);
app.use("/partner", partRouter);
app.use("/fcm", fcmRouter);
app.use("/import", importRouter);
app.use("/appbuilder", appBuilderRouter);
app.use("/images", imagesRouter);
app.use("/delivery", deliveryRouter);
app.use("/product", productRouter);

module.exports = app;
