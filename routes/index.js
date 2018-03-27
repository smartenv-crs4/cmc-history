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
var commonFunction=require('./commonfunctions');
var version = require('../package.json').version;
var config = require('propertiesmanager').conf;
var auth = require('tokenmanager');
var authField = config.decodedTokenFieldName;
var restApiRoot  = '/api' + (config.restApiVersion !='' ? '/v' + config.restApiVersion : '');

auth.configure({
  authorizationMicroserviceUrl:config.authUrl+ '/tokenactions/checkiftokenisauth',
  decodedTokenFieldName:authField,
  authorizationMicroserviceToken:config.auth_token
});

//authms middleware wrapper for dev environment (no authms required)
function authWrap(req, res, next) {
if (!req.app.get("nocheck"))
  auth.checkAuthorization(req, res, next);
else
  next();
}

// get home page
router.get('/', function(req, res, next) {
res.render('index', {title: 'Cmc Histories'});
});

//save an history
router.post(restApiRoot + '/histories', authWrap, commonFunction.saveAnHistory);

//read an history
router.get(restApiRoot + '/histories/:id',  authWrap, commonFunction.readHistories);

//delete an entire history by id
router.delete(restApiRoot + '/histories/:id',  authWrap, commonFunction.deleteAnHistory);

//search histories by date range
router.get(restApiRoot + '/histories/:id/:startdate/:enddate',  authWrap, commonFunction.readHistoriesByDates);

module.exports = router;
