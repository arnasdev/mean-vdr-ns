const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cron = require("node-cron");

const vehiclesRoutes = require("./routes/vehicles");
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notification");

const NotificationController = require("./controllers/notification");

const app = express();

mongoose.connect("mongodb+srv://arnas:" + process.env.MONGO_ATLAS_PW + "@cluster0-t1jap.mongodb.net/vdr?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(() => {
    console.log("Failed to connect to DB");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoutes);

cron.schedule("0 0 */12 * * *", function() {
  let date = new Date();
  console.log("running cron job: "+ date.toTimeString());

  NotificationController.scheduleRequiredNotifications();
});

module.exports = app;
