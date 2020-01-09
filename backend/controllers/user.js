const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const https = require('https');


const User = require("../models/user");
const Device = require("../models/device");
const Vehicle = require("../models/vehicle");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {

      let socialUser = false;

      if(req.socialLogin){
        socialUser = true;
      }

      const user = new User({
        email: req.body.email,
        password: hash,
        socialUser: socialUser,
        fbLinked: false
      });
      user.save()
        .then(result => {
          this.createDeviceTokens(user, req.body.deviceToken);

          console.log(socialUser);

          if(socialUser){
            this.userLogin(req, res, next);
          }
          else{
            res.status(201).json({
              message: "User created!",
              result: result
            });
          }

        })
        .catch(err => {
          console.log(err);
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

            if(user.fbLinked === false && user.socialUser === true){
              user.fbLinked = true;
              user.socialUser = false;
            }

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

exports.facebookDetails = (req, res, next) => {
  let accessToken = req.body.accessToken;
  console.log(accessToken);
  https.get("https://graph.facebook.com/me?fields=id,name,email&access_token="+accessToken, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      let jsonData = JSON.parse(data);
      let facebookEmail = jsonData.email;
      console.log(jsonData);
      User.findOne({email: facebookEmail}).then(user => {
        if(user){
          if(!user.fbLinked){
            user.fbLinked = false;
          }
          res.status(200).json({
            facebookEmail: facebookEmail,
            emailExists: true,
            fbLinked: user.fbLinked,
            socialUser: user.socialUser
          });
        } else {
          res.status(200).json({
            facebookEmail: facebookEmail,
            emailExists: false,
            fbLinked: false,
            socialUser: false
          });
        }
      });
    });
  });
}

exports.facebookLink = (req, res, next) => {
  let email = req.body.email;
  let facebookEmail = req.body.facebookEmail;
  console.log(facebookEmail);
  let fetchedUser;
  let duplicateError = false;

  User.findOne({email: email}).then(user => {
    if(!user){
      console.log("res 400");
      res.status(400).json({message:"Error linking facebook account"});
    }
    fetchedUser = user;
  }).then(() => {
    fetchedUser.socialUser = false;
    fetchedUser.fbLinked = true;
    if(facebookEmail){
      // Check if facebookEmail already exists
      User.findOne({email: facebookEmail}).then(duplicateUser => {
        if(duplicateUser){
          duplicateError = true;
        }
        else{
          fetchedUser.email = facebookEmail;
        }
      }).then(() => {
        if(duplicateError){
          res.status(400).json({
            message:"Account exists for both emails"
          });
          return;
        }
        User.updateOne({_id: fetchedUser._id}, fetchedUser).then(result => {
          res.status(200).json({
            message:"Updated user with facebook link"
          })
        }).catch( err => {
          res.status(400).json({
            message:"Error updating user with facebook link"
          })
        });
      });
    }
  }).catch(err => {
    res.status(400).json({
      message: "Error updating user"
    });
  })
}

exports.facebookUnlink = (req, res, next) => {
  let email = req.body.email;
  let fetchedUser;

  console.log("unlink email"+email);

  User.findOne({email: email}).then(user => {
    if(!user){
      res.status(400).json({message:"Error unlinking facebook account"});
    }
    fetchedUser = user;
  }).then(() => {
    fetchedUser.socialUser = false;
    fetchedUser.fbLinked = false;
    User.updateOne({_id: fetchedUser._id}, fetchedUser).then(result => {
      res.status(200).json({
        message:"Updated user with unlinked facebook"
      })
    }).catch( err => {
      res.status(400).json({
        message:"Error updating user with unlinked facebook"
      })
    });
  })

}

exports.facebookLogin = (req, res, next) => {
  let accessToken = req.body.accessToken;
  let deviceToken = req.body.deviceToken;
  let email = req.body.email;
  req.socialLogin = true;

  User.findOne({email: email}).then(user => {
    if(user){
      req.comparePassword = false;

      if(user.socialUser === false && user.fbLinked === false){
        res.status(400).json({message:"Error logging in"});
      } else{
        this.userLogin(req, res, next);
      }
    }
    else{
      console.log("creating social user");
      req.body.password = "";
      this.createUser(req, res, next);
    }
  });
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
      if(!device){
        return;
      }
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
      console.log("Error retriving deviceTokens for user: "+error);
    })
}

exports.userLogin = (req, res, next) => {
  comparePassword = req.comparePassword

  if(comparePassword === undefined){
    comparePassword = true;
  }

  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if(!user){
        return res.status(401).json({
          message: "Auth failed"
        })
      }
      if(!req.socialLogin && user.socialUser){
        return res.status(401).json({
          message: "Auth failed"
        })
      }
      fetchedUser = user;
      if(comparePassword){
        return bcrypt.compare(req.body.password, user.password);
      }
      else{
        return true;
      }
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
        userId: fetchedUser._id,
        email: fetchedUser.email,
        fbLinked: fetchedUser.fbLinked,
        socialUser: fetchedUser.socialUser
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
