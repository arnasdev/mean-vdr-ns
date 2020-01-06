const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const Vehicle = require("../models/vehicle");
const Device = require("../models/device");



adminCredential = admin.credential.cert({
    projectId: "mean-vdr-ns",
    clientEmail: "firebase-adminsdk-s55if@mean-vdr-ns.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrhU1bonFtGk5u\n8P0a3zG7MSlCGmanpN6/BanFF9zIntyWlXjZyN0lUkkOS886KtXpU/4S4o1MAbX/\njA8HdTLCc6PMv9D4DVrp3ELwZM8x8UgMRr9DkdDijumMpUfzx6oUc+vbDh/Snejl\npZ8LecYZF1rK2BVOO7dcPJrefbP1Cod3eIzQxg2BvuyFl3X4CooPIU1Iu/8yydjj\nomWD+zuqho02WRtKubvYa9Cahada7rm7H1isGJ7VntU7cmzamDwPbxOyXz/CWmn0\n9JWFoHCpkWX4Y3VpKao3/o0aU0QOEBhktnnZKzS6/VAdpqdAS+R+AyJeDAwTFmJF\nWzQYMGLBAgMBAAECggEAEH4Xk3PNJhltKLDGfakWSv9UQS8KgOmf1RlfAWMk6SuR\nXwkA+MJrAhwyU/J8YVKRUa39LjHkaUZFPeacFiXLgc24MEdsRg9h49ifA40fkstP\n5Lizl0E0DZzohL9RA4/G4TZjG711C0qaauT5vcY+gwoiW+l0MjR+xWehP24x4CIz\np/+owiWogoptwrgRqO/bdnflisb3Q99lDl/yF7xPmyfsL8XhBX/3dG4xavNFBs6n\nD6JYHFdzq2N6Bz4nMoqWKHrLZXige7KpAp0KEDofQypQ2dZ8S1Sm7j7LhW/neC5N\ni8E0ZiyuPMXDJc+LHWAuLD+SJd705ZLaDRkz4s6vawKBgQDxI+JXKcbYs/tPY3VR\nYUXFTdUZKFYUzF2mrEHWlOgmZsg//0DTxm8gKFfQuB2KQuOHYKpxCcqecGp6vhAz\np0IaB9EcSseRM/eixQMCG2yJzjwyxsgC37OkiLnGX2mqmdW/x3bVZ8FMcQ2scWiR\nRsGwysnbFmy0QwUIyNxxnYF3vwKBgQC2FyI0nscq0YUv2VBQGubDQUfyIDkdIj/H\n426HvXoCosUPScmN7l6EB03PPlsATPQGrM0cG8nA/OFbqLGSlOMt6Nmza/7FZNu4\nJjyQhhd4MYzH8LaIvtOrjWhU7MPjUCOCpUDnUKGIhQ1VqvSBtnlVOdNM3jDeEt80\n1l+cIDDFfwKBgAiljsItX1H58jMAj/5hDI1sow2J4rxQL7OATcQSBtkJqniRAJQX\nc3ilubBkSbrhdyMtli8DeN6BjW/lTNNtVfN1AEyRaeKNCH4vrlHvBc9TM9lmQ1nH\nB7wIoxC37yQM7Bs6Xcp9M/M3wpPCZUuATAW439AZV8CG/rE38p+oVDIlAoGBAIAp\nMiMVKhuCEpsF+lgXRxpgpTHO6kQOKhQXiGEzxF98jvReu+UQxCdrOKHIQqaogwz7\nrPW+vTb/BeLMjgcckfVrMWbueQgYH+mxx+j06Cnpviuvydnfbf4N7kPvzUP90LCQ\nfWkRwE/lTehhBe0SML4CkC1HKd/0KnP2+p5ZrdojAoGAdPFPa45i0ZCTMJ6glW6Y\ndIGYdXzKkGMwq+OLdco5k3MU9gLh+T/BBglclj6quF9ZP9wpnPMmJGcCfRcL7Z9r\naESQkVd3qwwSRyCEkD7jkNrYy8ll7SQZIhAf+4UU4ZGrhFenC9GwXhS8aug8O7xS\nZZ0TwXlLedBu21ji/FVKSuM=\n-----END PRIVATE KEY-----",
});


admin.initializeApp({
    apiKey: "AIzaSyByDcW38N3xamvQ34oF_gXoBT728tmj2w8",
    projectNumber: "424686651251",
    databaseURL: "https://mean-vdr-ns.firebaseio.com",
    storageBucket: "mean-vdr-ns.appspot.com",
    projectId: "mean-vdr-ns",
    credential: adminCredential
});



exports.setNotification = (req, res, next) => {
    let devices;

    Device.findOne({ owner: req.userData.userId }).then(device => {
        device.notifications = req.body.notification;

        Device.updateOne({ owner: device.owner }, device).then(result => {
            if(result.n > 0) {
                res.status(200).json({message: "Update successful"});
            } else {
                res.status(401).json({message: "Not authorized"});
            }
            console.log("button updated to: "+device.notifications);
        })
        .catch(error => {
            res.status(500).json({
                message: "Error updating device notification"
            })
        });
    })
}

exports.getNotification = (req, res, next) => {
    Device.findOne({ owner: req.userData.userId })
    .then(device => {
        res.status(200).json({
            message: "notification fetched",
            notification: device.notifications
        });
    })
    .catch(err => {
        res.status(500).json({
            message: "fetching notification failed"
        })
    });
}


exports.scheduleRequiredNotifications = () => {
    Vehicle.find()
    .then(vehicles => {
        currentDate = new Date();

        let message = "";
        let remindersArray = [];
        vehicles.forEach(vehicle => {
            remindersArray = [];
            message = "";

            taxReminder = constructNotificationString("tax", currentDate, vehicle.tax, vehicle.creator);
            nctReminder = constructNotificationString("nct", currentDate, vehicle.nct, vehicle.creator);
            insuranceReminder = constructNotificationString("insurance", currentDate, vehicle.insurance, vehicle.creator);
            serviceReminder = constructNotificationString("service", currentDate, vehicle.service, vehicle.creator);
            licenseReminder = constructNotificationString("license", currentDate, vehicle.license, vehicle.creator);

            if(taxReminder !== ""){
                remindersArray.push(taxReminder);
            }
            if(nctReminder !== ""){
                remindersArray.push(nctReminder);
            }
            if(insuranceReminder !== ""){
                remindersArray.push(insuranceReminder);
            }
            if(serviceReminder !== ""){
                remindersArray.push(serviceReminder);
            }
            if(licenseReminder !== ""){
                remindersArray.push(licenseReminder);
            }

            if(remindersArray.length === 1){
                message = remindersArray[0] + " on your vehicle " + vehicle.registration;
            }
            else{
                message = "You have multiple items expiring or already expired on your vehicle " + vehicle.registration;
            }

            console.log("Amount of reminders: " + remindersArray.length+", " + "Creator: "+vehicle.creator);

            sendNotification(message, vehicle.creator)
        });
    });
};

sendNotification = (message, userId) => {
    Device.find({ owner: userId })
    .then(devices => {
        for(var dI = 0; dI < devices.length; dI++){
            if(devices[dI].notifications === false){
                continue;
            }
            for(var dtI = 0; dtI < devices[dI].deviceTokens.length; dtI++){
                queueNotification(message, "", devices[dI].deviceTokens[dtI], userId);
            }
        }
    })
    .catch(error => {
        console.log(error);
    });
}

constructNotificationString = (notificationName, currentDate, expiryDateString, user) => {
    daysLeft = isExpiringSoon(currentDate, expiryDateString);
    if(daysLeft !== ""){
        return "Your " + notificationName + " " + daysLeft;
    }
    else{
        return "";
    }
}

function isExpiringSoon(currentDate, expiryDateString) {
    if(expiryDateString === "N/A"){
        return "";
    }

    expiryDate = new Date(expiryDateString);

    timeLeft = expiryDate - currentDate;
    if(timeLeft < 0){
        return "is overdue for renewal";
    }

    daysLeft = timeLeft / (1000 * 3600 * 24);
    if(daysLeft < 1) {
        return "is due for renewal in one day";
    }
    else if(daysLeft < 2) {
        return "is due for renewal in two days";
    }
    else if(daysLeft < 7){
        return "is due for renewal in less than 7 days";
    }
    else if(daysLeft < 14){
        return "is due for renewal in less than 14 days";
    }
    else{
        return "";
    }
}

function queueNotification(title, body, deviceToken, userId) {
    const notificationData = {
        payload: {
            notification: {
                title,
                body
            }
        },
        deviceToken
    };

    admin.messaging().sendToDevice(notificationData.deviceToken, notificationData.payload)
    .then(() => {
        console.log("notification sent to: "+notificationData.deviceToken + " with message: "+notificationData.payload.notification.title);
    })
    .catch(() => {
        console.log("notification failed");
    });
}
