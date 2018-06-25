/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2018 CRS4                                 *
 *       This file is part of CRS4 Microservice IOT - Histories (CMC-Hist).       *
 *                                                                            *
 *       CMC-Hist is free software: you can redistribute it and/or modify     *
 *     it under the terms of the GNU General Public License as published by   *
 *       the Free Software Foundation, either version 3 of the License, or    *
 *                    (at your option) any later version.                     *
 *                                                                            *
 *       CMC-Hist is distributed in the hope that it will be useful,          *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *               GNU General Public License for more details.                 *
 *                                                                            *
 *       You should have received a copy of the GNU General Public License    *
 *       along with CMC-Hist.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */

var History = require('../models/histories').History;
var request = require('request');
var config = require('propertiesmanager').conf;
var domainUrl = process.env.HOST || 'localhost:' + (
process.env.PORT || 3015);
domainUrl = domainUrl + '/api/v0.1';

// save a new history
saveHistory = async function(idDevice, meta) {
  var metaData;
  var timeDevice;
  metaData = meta;
  var history = new History({idDevice: idDevice, meta: metaData});
  return history.save().then(function(history) {
    return history;
  }).catch(error => {
    next(error);
  });
};

// route handler for an history saving
exports.saveAnHistory = async function(req, res, next) {
  if (!req.body.IdDevice && !req.body.data) {
    message = 'No history data or device id';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }
  var idDevice = (req.body.idDevice).toString(),
    meta = req.body.data,
    history;
  try {
    history = await saveHistory(idDevice, meta);
    console.log("Saved a new history: " + JSON.stringify(history))
    return res.status(201).send(history.toJSON());
  } catch (err) {
    message = 'Error saving an history';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }
}

// route handler for an history delete
exports.deleteAnHistory = async function(req, res, next) {
  var id = (req.params.id).toString();
  if (!id) {
    message = 'No device id';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }

  History.remove({idDevice: id}).then(function(result) {
    console.log("Deleted " + result.n + " histories with device id: " + id);
    return res.status(201).send(result);
  }).catch(error => {
    message = "Error deleting all histories with device id: " + id;
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  });

}

// route handler for histories reading
exports.readHistories = async function(req, res, next) {
  var id = (req.params.id).toString();
  if (!id) {
    message = 'No device id';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }

  History.find({idDevice: id}).then(function(histories) {
    console.log("Get all histories for device id: " + id);
    return res.status(201).send(histories);
  }).catch(error => {
    message = "Error retrieving all histories with device id: " + id;
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  });
}

// route handler for histories reading by dates
exports.readHistoriesByDates = async function(req, res, next) {
  var id = (req.params.id).toString();
  // startdate param in the form: yyyy-mm-dd hh:mm:ss
  var startDate =  (req.params.startdate).toString();
  var endDate =  (req.params.enddate).toString();

  if (!id) {
    message = 'No device id';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }

  if (!startDate || !endDate) {
    message = 'Date range not valid';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }
console.log("Start date: " + new Date(startDate) )
  History.find({"time": {"$gte": new Date(startDate), "$lt": new Date(endDate)}}).then(function(histories) {
    console.log("Get all histories for device id: " + id + " and timestamp range");
    return res.status(201).send(histories);
  }).catch(error => {
    message = "Error retrieving all histories with device id: " + id + " and timestamp range";
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  });
}

// route handler for histories reading by dates
exports.readHistoriesByDates = async function(req, res, next) {
  var id = (req.params.id).toString();
  // startdate param in the form: yyyy-mm-dd hh:mm:ss
  var startDate =  (req.params.startdate).toString();
  var endDate =  (req.params.enddate).toString();

  if (!id) {
    message = 'No device id';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }

  if (!startDate || !endDate) {
    message = 'Date range not valid';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }

console.log("Start date: " + new Date(startDate) )
  History.find({idDevice: id, "time": {"$gte": new Date(startDate), "$lt": new Date(endDate)}}).then(function(histories) {
    console.log("Get all histories for device id: " + id + " and timestamp range");
    return res.status(201).send(histories);
  }).catch(error => {
    message = "Error retrieving all histories with device id: " + id + " and timestamp range";
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  });
}
