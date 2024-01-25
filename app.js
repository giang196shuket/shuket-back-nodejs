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
const fcmRouter = require("./src/router/fcm");
const importRouter = require("./src/router/import");
const appBuilderRouter = require("./src/router/appBuilder");
const imagesRouter = require("./src/router/images");
const deliveryRouter = require("./src/router/delivery");
const productRouter = require("./src/router/product");
const userRouter = require("./src/router/user");
const noticeRouter = require("./src/router/notice");
const catalogRouter = require("./src/router/catalog");
const appConfigRouter = require("./src/router/appConfig");
const appInfoRouter = require("./src/router/appInfo");
const orderRouter = require("./src/router/order");

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
app.use("/main", mainRouter); // pos // partner
app.use("/mart", martRouter);
app.use("/fcm", fcmRouter);
app.use("/import", importRouter);
app.use("/appbuilder", appBuilderRouter);
app.use("/images", imagesRouter);
app.use("/delivery", deliveryRouter);
app.use("/product", productRouter);
app.use("/users", userRouter);
app.use("/notice", noticeRouter);
app.use("/catalogs", catalogRouter);
app.use("/appconfig", appConfigRouter);
app.use("/appinfo", appInfoRouter);
app.use("/order", orderRouter);

module.exports = app;
