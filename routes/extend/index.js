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

var express = require('express');
var router = express.Router();
//var extendcommonfunctions=require('./extendcommonfunctions');
var History = require('../../models/histories').History;


//get best history by hour
router.get( '/api/best/id/:id/hour/:hour/',  async function(req, res, next) {
  console.log('----' + req.params.id)
  var id = (req.params.id).toString();
  // startdate param in the form: yyyy-mm-dd hh:mm:ss
  var hour =  (req.params.hour).toString();
  var hourDate = new Date(hour);
  //var metaData = (req.params.metavalue).toString();

  if (!id) {
    message = 'No device id';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }

  if (!hour) {
    message = 'Hour not valid';
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  }
var startDate = new Date(hourDate.getTime() - 60*1000*1);
var endDate = new Date(hourDate.getTime() + 60*1000*1);
console.log("Start date: " + new Date(startDate) );
var maxFlow = 1000;
var score = 0;
var color = 'green';
  History.find({idDevice: id, "time": {"$gte": new Date(startDate), "$lt": new Date(endDate)}}).then(function(histories) {
    console.log("Get " +histories.length + " histories for device id: " + id + " and timestamp range");
    if(histories){
      var numberHistories = histories.length;
      var totalFlows = 0;
      histories.forEach(function(anHistory){
        totalFlows= totalFlows + parseInt(anHistory.meta.flow,10);
      });
score = (totalFlows/numberHistories)/maxFlow;
if(score > 0.5 ){
  color = 'red';
}
if(score > 0.5 && score < 0.7){
  color =  'orange'
}
if(score < 0.5 && score > 0.3){
  color = 'blue'
}
console.log('SCore.... ' + score + ' with totalFlows: ' + totalFlows + ' numberHistories: ' + numberHistories )
    }
    if(!score){
      color= 'white';
    }
    //return res.status(201).send(histories);
    return res.status(201).send({score: score, color: color});
  }).catch(error => {
    message = "Error retrieving all histories with device id: " + id + " and timestamp range";
    return res.status(500).json({
      "error": 500,
      "errorMessage": message,
      "moreInfo": config.urlSupport + "500"
    });
  });
}
);


module.exports = router;
