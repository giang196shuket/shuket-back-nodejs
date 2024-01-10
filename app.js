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

//get router
const authRouter = require("./src/router/auth");
const mainRouter = require("./src/router/main");
const saleCollecRouter = require("./src/router/saleCollection");
const posRouter = require("./src/router/pos");
const partRouter = require("./src/router/partner");
const fcmRouter = require("./src/router/fcm");
const productRouter = require("./src/router/product");

const app = express();
dotenv.config({ path: `${appRoot}/config/config.env` });

app.use(express.static('src/excel')); 
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

//use router
app.use("/auth", authRouter);
app.use("/main", mainRouter);
app.use("/sales_collection", saleCollecRouter);
app.use("/pos", posRouter)
app.use("/partner", partRouter)
app.use("/fcm", fcmRouter)
app.use("/product", productRouter)


module.exports = app;
