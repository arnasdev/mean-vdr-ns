const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Device = require("../models/device");
const Vehicle = require("../models/vehicle");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {

          this.createDeviceTokens(user, req.body.deviceToken);

          res.status(201).json({
            message: "User created!",
            result: result
          });
        })
        .catch(err => {
          if(err.errors.email.properties.type === "unique"){
            res.status(500).json({
                message: "Email address is already taken"
            });
          }

          res.status(500).json({
              message: "Invalid authentication credentials!"
          });
        });
    });
}


exports.editUser = (req, res, next) => {
  let userId = req.params.id;

  User.findOne({_id: userId})
    .then(user => {
        let authenticated = false;

        bcrypt.compare(req.body.currentPassword, user.password).then(result => {
          authenticated = result;


          if(authenticated) {


            bcrypt.hash(req.body.newPassword, 10).then(hash => {
                user.password = hash;
                User.updateOne({_id: req.params.id}, user).then(result => {
                    console.log(result);

                    if(result.nModified > 0) {
                      const token = jwt.sign(
                        { email: user.email, userId: user._id }, process.env.JWT_KEY
                      );
                      console.log("update successful");
                      res.status(200).json({
                        token: token,
                        userId: user._id
                      });
                    }
                    else{
                        console.log("error updating");
                      res.status(400).json({message:"Error updating user with new password"});
                    }
                });
            })
          }
          else{
            res.status(400).json({message:"Error authenticating new/old password"});
          }
        });
    });
}

exports.userLogout = (req, res, next) => {
  let userId = req.body.userId;
  let deviceToken = req.body.deviceToken;
  this.deleteDeviceToken(userId, deviceToken, req, res, next);
}

exports.deleteDeviceToken = (userId, token, req, res, next) => {
  Device.findOne({owner: userId})
    .then(device => {
      if(device.deviceTokens.includes(token)){

        let removeIndex = device.deviceTokens.indexOf(token);
        device.deviceTokens.splice(removeIndex, 1);

        Device.updateOne({owner: device.owner}, device).then(result => {
          if(result.n > 0) {
            console.log("Successfully updated deviceTokens");
            res.status(200).json({message:"Successfully updated deviceTokens"});
          } else {
            console.log("Updating deviceTokens failed");
            res.status(200).json({message:"Updating deviceTokens failed"});
          }
        });
      }
      else{
        console.log("Token not present");
        res.status(200).json({message:"Token not present"});
      }
    })
    .catch(err => {
      console.log("Error removing user deviceToken on logout");
      res.status(400).json({message:"Error removing user deviceToken on logout"});
    });
}

exports.createDeviceTokens = (user, token) => {
  const device = new Device({
    owner: user.id,
    notifications: true,
    deviceTokens: [token]
  });

  device.save()
    .then(result => {
      console.log("Created Device data for user");
    })
    .catch(err => {
      console.log("Error, unable to create Device data");
    });
};

exports.tryAppendDeviceToken = (user, token) => {
  Device.findOne({ owner: user._id })
    .then(device => {
      if(device.deviceTokens.includes(token)){
        console.log("deviceToken already registered");
      }
      else{
        device.deviceTokens.push(token);
        console.log("Registering new deviceToken");
        Device.updateOne({owner: user._id}, device).then(result => {
          if(result.n > 0) {
            console.log("Successfully registered");
          } else {
            console.log("deviceToken registration failed");
          }
        });
      }
    })
    .catch(error => {
      console.log("Error retriving deviceTokens for user");
    })
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if(!user){
        return res.status(401).json({
          message: "Auth failed"
        })
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if(!result){
        return res.status(401).json({
          message: "Auth failed"
        })
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id }, process.env.JWT_KEY
      );
      console.log(token);
      this.tryAppendDeviceToken(fetchedUser, req.body.deviceToken);
      res.status(200).json({
        token: token,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      })
    });
}

exports.deleteUser = (req, res, next) => {
  console.log("deleting user");
  console.log(req.params.id);

  User.findOne({_id: req.params.id}).then((user) => {
    if(!user){
      return res.status(401).json({
        message:"User not found"
      })
    }

    Vehicle.deleteMany({ creator: user.id }).then((result) => {
      if(result.deletedCount > 0){
      console.log("Vehicles deleted for user: " +user.id);

      } else{
      console.log("Vehicles not deleted or no vehicles for user: " +user.id);
      }
    });

    Device.deleteMany({ owner: user.id }).then((result) => {
      if(result.deletedCount > 0){
        console.log("DeviceTokens deleted for user: "+user.id);
      } else {
        console.log("DeviceTokens not deleted or no deviceTokens for user: " +user.id);
      }
    });

    User.deleteOne({ _id: user.id }).then((result) => {
      console.log(result);
      if(result.deletedCount > 0){
        res.status(200).json({message:"User deleted"});
      } else {
        res.status(401).json({message: "Not authorized"});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting user failed"
      })
    });
  })
}