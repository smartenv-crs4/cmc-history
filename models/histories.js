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
 var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create new history schema
var HistorySchema = new Schema({
    idDevice: String,
    meta: [{k:String, v:String}],
},  { timestamps: { createdAt: 'time' } });

// Compile model from schema
var History = mongoose.model('histories', HistorySchema );
module.exports.HistorySchema = HistorySchema;
module.exports.History = History;
