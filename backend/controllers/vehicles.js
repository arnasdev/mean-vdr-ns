const REG_SEARCH_URL = "https://www.cartell.ie/ssl/servlet/step1?whitelabel=aaireland&registration=";
const https = require("https");

const Vehicle = require("../models/vehicle");

exports.searchRegistration = (req, res, next) => {
  const registration = req.params.registration;
  const url = REG_SEARCH_URL + registration;

  https.get(url, (resp) => {
    let data = "";

    resp.on("data", (chunk) => {
      data += chunk;
    });

    resp.on("end", () => {
      res.status(200).json({
        message: "Scraped webpage successfully",
        data: data
      });
    });
  }).on("error", (error) => {
    res.status(500).json({
      message: "Error scraping webpage"
    });
  });
}

exports.createVehicle = (req, res, next) => {
  const vehicle = new Vehicle({
    registration: req.body.registration,
    manufacturer: req.body.manufacturer,
    model: req.body.model,
    tax: req.body.tax,
    nct: req.body.nct,
    insurance: req.body.insurance,
    service: req.body.service,
    license: req.body.license,
    cpc: req.body.cpc,
    creator: req.userData.userId
  });

  vehicle.save().then(createdVehicle => {
    res.status(201).json({
      message: "Vehicle added successfuly",
      vehicle: {
        id: createdVehicle._id,
        registration: createdVehicle.registration,
        manufacturer: createdVehicle.manufacturer,
        model: createdVehicle.model,
        tax: createdVehicle.tax,
        nct: createdVehicle.nct,
        insurance: createdVehicle.insurance,
        service: createdVehicle.service,
        license: createdVehicle.license,
        cpc: createdVehicle.cpc,
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating vehicle failed"
    })
  });
}

exports.editVehicle = (req, res, next) => {
  const vehicle = new Vehicle({
    _id: req.body.id,
    registration: req.body.registration,
    manufacturer: req.body.manufacturer,
    model: req.body.model,
    tax: req.body.tax,
    nct: req.body.nct,
    insurance: req.body.insurance,
    service: req.body.service,
    license: req.body.license,
    cpc: req.body.cpc
  });

  Vehicle.updateOne({_id: req.params.id, creator: req.userData.userId }, vehicle).then(result => {
    if(result.n > 0) {
      res.status(200).json({message: "Update successful"});
    } else {
      res.status(401).json({message: "Not authorized"});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: "Error updating vehicle"
    })
  });
}

exports.getVehicles = (req, res, next) => {
  let fetchedVehicles;
  const postQuery = Vehicle.find({ creator: req.userData.userId }).then(documents => {
    fetchedVehicles = documents;
  }).then(() => {
    res.status(200).json({
      message: "Vehicles fetched",
      vehicles: fetchedVehicles
    });
  })
  .catch(error => {
    res.status(500).json({
      message: "Fetching vehicles failed"
    })
  });
}

exports.deleteVehicle = (req, res, next) => {
  console.log("deleting vehicle");
  Vehicle.deleteOne({_id: req.params.id, creator: req.userData.userId })
    .then(result => {
      console.log(result);
      if(result.deletedCount > 0){
        res.status(200).json({message:"Vehicle deleted"});
      } else {
        res.status(401).json({message: "Not authorized"});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting vehicle failed"
      })
    });
}

