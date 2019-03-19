var commonFunction=require('../commonfunctions');


var express = require('express')
  , router = express.Router()


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
