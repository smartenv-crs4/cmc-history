/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2018 CRS4                                 *
 *       This file is part of CRS4 Microservice IOT - User (CMC-Devices).       *
 *                                                                            *
 *       CMC-Devices is free software: you can redistribute it and/or modify     *
 *     it under the terms of the GNU General Public License as published by   *
 *       the Free Software Foundation, either version 3 of the License, or    *
 *                    (at your option) any later version.                     *
 *                                                                            *
 *       CCMC-Devices is distributed in the hope that it will be useful,          *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *               GNU General Public License for more details.                 *
 *                                                                            *
 *       You should have received a copy of the GNU General Public License    *
 *       along with CMC-Devices.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */

var conf=require('../config').conf;
var util=require('util');
var request=require('request');
var async=require("async");
var db = require("../models/db");
var server;
var app = require('../app');
var Port = 3010;
var _=require("underscore");
var authHost = conf.authUrl;


exports.setAuthMsMicroservice=function(doneCallback){

    var url=authHost;
    async.series([
        function(callback){ // check if AuthMs is in dev mode
            request.get(url+"/env", function(error, response, body){

                if(error) {
                    throw error;
                }else{
                    var env=JSON.parse(body).env;
                    if(env=="dev"){
                        db.connect(function (err) {
                            if (err) console.log("######   ERRORE BEFORE : " + err +"  ######");

                            app.set('port', process.env.PORT || Port);

                            server = app.listen(app.get('port'), function () {
                                console.log('TEST Express server listening on port ' + server.address().port);
                                callback(null,"one");
                            });
                        });
                    }else{
                        throw (new Error('NO authms in dev mode'));
                        callback(null,"one");
                    }
                }
            });
        },
        function(callback){ // create admins and users type tokens
            var users=conf.testConfig.admintokens.concat(conf.testConfig.usertokens);
            var usersId=[];
            async.eachSeries(users,function(tokenT,clb){
                var rqparams={
                    url:url+"/usertypes",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token},
                    body:JSON.stringify({usertype:{name:tokenT}})
                };
                request.post(rqparams, function(error, response, body){
                    if(error) {
                        throw err;
                        clb("err");
                    }else{
                        usersId.push(JSON.parse(body)._id);
                        clb();
                    }
                });

            },function(err){
                conf.testConfig.usersId=usersId;
                callback(null,"two");
            });
        },
        function(callback){// create Authorized(webUI) app Type type tokens
            var apps=conf.testConfig.authApptokens;
            var appsId=[];
            async.eachSeries(apps,function(tokenT,clb){
                var rqparams={
                    url:url+"/apptypes",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token},
                    body:JSON.stringify({apptype:{name:tokenT}})
                };
                request.post(rqparams, function(error, response, body){

                    if(error) {
                        throw err;
                        clb("err");
                    }else{
                        appsId.push(JSON.parse(body)._id);
                        clb();
                    }
                });

            },function(err){
                conf.testConfig.appsId=appsId;
                callback(null,"three");
            });
        },
        function(callback){// create webUiToken
            var appBody = JSON.stringify({app:conf.testConfig.webUiAppTest});
            request.post({
                url: url + "/authapp/signup",
                body: appBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
            }, function (error, response,body) {
                if(error) {
                    throw error;
                    callback(error,null);
                }else{
                    var results = JSON.parse(response.body);
                    if(!results.error) {
                        conf.testConfig.myWebUITokenToSignUP = results.apiKey.token;
                        conf.testConfig.webUiID=results.userId;
                    }
                    callback(null,"five");
                }
            });

        },
        function(callback){ // create Auth Roles
            var roles=conf.testConfig.AuthRoles;
            async.forEachOf(roles,function(value,key,clb){
                var rqparams={
                    url:url+"/authms/authendpoint",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token},
                    body:JSON.stringify({microservice:{name:"cmc-devices",URI:value.URI, authToken:value.token, method:value.method}})
                };
                request.post(rqparams, function(error, response, body){
                    if(error) {
                        throw err;
                        clb("err");
                    }else{
                        value.id=JSON.parse(body)._id;
                        clb();
                    }
                });

            },function(err){
                conf.testConfig.AuthRoles=roles;
                callback(null,"four");
            });

        }
    ],function(err,resp){
        if(err)
            doneCallback(err);
        else
            doneCallback();
    });
}

exports.resetAuthMsStatus = function(callback) {

    async.series([
        function(clb){
            request.del({
                url: authHost + "/authapp/"+conf.testConfig.webUiID,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
            }, function (error, response,body) {
                if(error) {
                    clb(error,"ONE");
                }else{
                    clb(null,"ONE");
                }
            });
        },
        function(clb){
            var roles=conf.testConfig.AuthRoles;
            async.forEachOf(roles,function(value,key,clbeach){
                var rqparams={
                    url: authHost+"/authms/authendpoint/"+ value.id,
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
                };

                request.delete(rqparams, function(error, response, body){
                    if(error) {
                        clbeach(error);
                    }else{
                        clbeach();
                    }
                });

            },function(err){
                if(err)
                    clb(err,"TWO");
                else
                    clb(null,"TWO");
            });
        },
        function(clb){
            var roles=conf.testConfig.appsId;
            async.forEachOf(roles,function(value,key,clbeach){
                var rqparams={
                    url: authHost+"/apptypes/"+ value,
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
                };

                request.delete(rqparams, function(error, response, body){
                    if(error) {
                        clbeach(error);
                    }else{
                        clbeach();
                    }
                });

            },function(err){
                if(err)
                    clb(err,"THREE");
                else
                    clb(null,"THREE");
            });
        },
        function(clb){
            var roles=conf.testConfig.usersId;
            async.forEachOf(roles,function(value,key,clbeach){
                var rqparams={
                    url: authHost+"/usertypes/"+ value,
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
                };

                request.delete(rqparams, function(error, response, body){
                    if(error) {
                        clbeach(error);
                    }else{
                        clbeach();
                    }
                });

            },function(err){
                if(err)
                    clb(err,"FOUR");
                else
                    clb(null,"FOUR");
            });
        }
    ],function(err,respo){
        if(err)
            throw (err);
        else{
            server.close();
            db.disconnect(function (err,res) {
                if (err) console.log("######   ERRORE After 2: " + err +"  ######");
                callback(null);
            });
        }

    });

};
