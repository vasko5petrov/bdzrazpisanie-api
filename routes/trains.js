const express = require('express');
const router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

module.exports = router;

router.get('/route/:fromstation&:tostation' , (req, res) => {
    var fromstation = req.params.fromstation;
    var tostation = req.params.tostation;
    
    var trains = [];

    var arr = [];
    var kat = [];
    var departure = [];
    var arrives = [];
    
    var data = [];
    
    request.get({
        url: `http://razpisanie.bdz.bg/mobile/search.jsp?fromstation=${fromstation}&tostation=${tostation}`, encoding: null
    }, function(err, resp, body) {
        if(!err && resp.statusCode == 200) {
            var correctEncodingBody = iconv.decode(new Buffer(body), "WINDOWS-1251");
            var $ = cheerio.load(correctEncodingBody);
            var index = 4;
    
            $('.TableBlue td a').each(function() {
                var el = this.children[0].data;
    
                if(el != undefined) {
                    trains.push(el);
                }
            });
    
            $('.TableBlue td').each(function() {
    
                arr.push(this.children[0].data);
            });
    
            for(var i = 3; i < arr.length; i += index) {
                kat.push(arr[i]);
            }
            
            for(var i = 4; i < arr.length; i += index) {
                departure.push(arr[i]);
            }
            
            for(var i = 4; i < arr.length; i += index) {
                arrives.push(arr[i]);
            }
    
            for(var j = 0; j < trains.length; j++) {
                var object = {
                    'number': trains[j],
                    'type': kat[j],
                    'departure': departure[j],
                    'arrives': arrives[j]
                }
                data.push(object);
            }
    
            if(data == '') {
                data = {error: 'No results'}
            }
            res.json({route: {fromstation, tostation}, data: data});
        }
    });
});

router.get('/train/:trainNumber', (req, res) => {
    var trainNumber = req.params.trainNumber;

    var arr = [];
    var stations = [];
    var departure = [];
    var arrives = [];
    var diff = [];

    var data = [];

    request.get({
        url: `http://razpisanie.bdz.bg/mobile/infotrain.jsp?train=${trainNumber}`,
        encoding: null
    }, function(err, resp, body) {
        if(!err && resp.statusCode == 200) {
            var correctEncodingBody = iconv.decode(new Buffer(body), "WINDOWS-1251");
            var $ = cheerio.load(correctEncodingBody);
            var index = 3;
    
            $('.TableBlue td').each(function() {
                arr.push(this.children[0].data);
            });

            $('.TableBlue td label font').each(function() {
                diff.push({
                    'time': this.parent.parent.children[0].data, 
                    'delay': this.children[0].data
                });
            });
            
            for(var i = 1; i < arr.length; i += index) {
                stations.push(arr[i]);
            }

            for(var i = 2; i < arr.length; i += index) {
                arrives.push(arr[i]);
            }

            for(var i = 2; i < arr.length; i += index) {
                departure.push(arr[i]);
            }

            for(var j = 0; j < stations.length; j++) {
                var object = {
                    'station': stations[j],
                    'arrives': {
                        time: arrives[j],
                        delay: null
                    },
                    'departure': {
                        time: departure[j],
                        delay: null
                    }
                }
                for(var i = 0; i < diff.length; i++) {
                    var d = diff[i];
                    if(arrives[j] === d.time) {
                        object.arrives.delay = d.delay;
                    } else if(departure[j] === d.time) {
                        object.departure.delay = d.delay;
                    }
                }

                data.push(object);
            }

            res.json({train: trainNumber, data: data});
        }
    });
});