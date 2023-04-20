require("dotenv").config();
const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./router/index.js");
const errorMiddlware = require("./middlwares/error-middleware.js");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use("/api", router);
app.use(errorMiddlware);

// console.log(fs.readFileSync("nproject.charity.key", { encoding: "utf8" }));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    https
      .createServer(
        {
          key: fs.readFileSync("nproject.charity.key", { encoding: "utf8" }),
          cert: fs.readFileSync("nproject.charity.pem", { encoding: "utf8" }),
        },
        app
      )
      .listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
      });
  } catch (error) {
    console.log(error);
  }
};

start();
