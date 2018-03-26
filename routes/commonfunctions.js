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
  var metaData = [];
  Object.keys(meta).forEach(function(key) {
    var keyString = key.toString();
    var valueString = meta[key].toString();
    metaData.push({k: keyString, v: valueString});
  });

  var history = new History({idDevice: idDevice, meta: metaData});
  return history.save().then(function(history) {
    return history;
  }).catch(error => {
    console.log(error)
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
