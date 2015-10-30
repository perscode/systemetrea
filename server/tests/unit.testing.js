var artikelDBService = require('../services/dataServices/artikel.db.service');
var deliveryService = require('../services/dataServices/delivery.service');
var apiStreamer = require('./../services/dataServices/api.streamer.service');
var async = require('async');
var _ = require('underscore')._;
var mailPackage = {};

exports.run = function(next){
    var arr = [];
    var userMap = "";
    async.waterfall([
        function(callback){
            apiStreamer.beginScan(function(err, data){
                if(err){
                    console.log("@unittest, 1, err: ", err);
                }
                callback(null, data);
            });
            
        },function(arg1, callback){
            
            async.map(arg1, getUsers, function(err){
                if(err){
                    return callback(err);
                }

                callback(null, ":D");
            });
        },
    ],
        function (err, result) {
            if(err && err != "next"){
                return err;
            }if(result.length == 0){
                return next(null, "No data fetched");
            }
            next(null, result);
            
        }
    );
    
};

exports.fetchUsers = function(callback) {
    async.waterfall([
        function(callback){
            listModified(callback);
        },
        function(arg1, callback){
            async.map(JSON.parse(JSON.stringify(arg1)), setData, function(err, result){
                if(err){ 
                    //console.log(err);
                    return callback(err);
                }else{
                    callback(null, result);
                }
            });
        },
        function(arg1, callback){
            var fs = require('fs');
            fs.writeFile('./server/services/dataServices/data/db.json', JSON.parse(JSON.stringify(arg1)), function(err){
                if(err) return callback(err);
                console.log('results > db.json');
            });
            callback(null, arg1);
        },
        function(arg1, callback){
            
            async.map(arg1, getUsers, function(err){
                if(err){
                    return callback(err);
                }

                callback(null, ":D");
            });
        },
    ],
        function(err, results){
            if(err){
              return callback(err);  
            } 
            console.log(results);
            callback(null, mailPackage);
        }
    );
    
    function listModified(next){
        artikelDBService.getLeastFive(function(err, data){
            if(err){
                return next(err);
            }
             next(null, data);
        });
    }
};

function setData(artikelData, next) {
    try{
        var dbResult = {
            "Varnummer": artikelData.Varnummer,
            "NyttPris": artikelData.Prisinklmoms,
            "GammaltPris": artikelData.Prishistorik[1].pris,
            "Namn": artikelData.Namn,
            "Varugrupp": artikelData.Varugrupp,
            "Procent": artikelData.PrissanktProcent,
            "Volymiml": artikelData.Volymiml
        };
    }catch(e){
        var vm = {
            'Error Message': "Error Message: " + e.message,
            'Error Code': "Error Code: " + e.number,
            'Error Name': + e.name
        };
        return next(vm);
    }
    next(null, dbResult);
}

function getUsers(data, next) {
    
    deliveryService.fetchUsers(data, function(err, recipients){
        if(err){
            console.log("Error happened");
            return next(err);
        }
        for(var i = 0; i<recipients.length; i++){
            var email = JSON.stringify(recipients[i]);
            if(!mailPackage.hasOwnProperty(email)){
                mailPackage[email] = [];
//                        console.log("not true, thus mailPackage[recipient][0] should be undefined: ", mailPackage[email][0]);
                mailPackage[email][0] = data;
            }else{
                // console.log("content of mail: ", email, "  if a property of mailPackage: ", mailPackage.hasOwnProperty(email), " and is of the type: ", typeof email,
                //"it's current length if: ", mailPackage[email].length, "prior to set...");
                mailPackage[email][(mailPackage[email].length)] = data;
                //console.log("after set: ", mailPackage[email].length, "length and hasownProperty check returns: ", mailPackage.hasOwnProperty(email));
            }
        }
        next(null);
    });
}     
