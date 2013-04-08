#!/usr/bin/env node
/*/
 * This script can be run any number of times during the day.
 * It will only update servers once per day, right after UPDATE_HOUR.
/*/

var rest = require('../lib/rest');
var apiServer = 'http://api-sails.herokuapp.com';


var UPDATE_HOUR = '12'; // make noon, 12pm exactly, be the time for a given day, and updates happen after this.

function init() {
	var d = new Date();
	if (d.getHours() < UPDATE_HOUR) {
		console.log(d.getTime() +' node.weather.js skipping, only updating after '+ UPDATE_HOUR);
		return;
	}
	console.log(d.getTime() +' node.weather.js running ');
	
	
	var url = 'http://api-sails.herokuapp.com/forecast?loc=chicago.updating';
	// $.getJSON('http://api.wunderground.com/api/121b8928ea8cca08/forecast10day/q/IL/Chicago.json?callback=?')
    
	rest.getJSON( url, function(err, apiJsonData, response) {
		if (err) return;
		url = 'http://api.wunderground.com/api/121b8928ea8cca08/forecast10day/q/IL/Chicago.json';
		rest.getJSON( url, function(err, wuJsonData, response) {
			if (err) return;
			updateApi(apiJsonData, wuJsonData);
		});
	});
}

/*/

Each forecast document in api server looks like this:
{
  loc: 'chicago' || 'chicago.updating',
  day: <epochSecs>,
  min0d:   // actual min tempFahrenheit for that day
  min1d:   // min tempFahrenheit for day, as guessed 1 day earlier
  min<N>d: // tempFahrenheit, as guessed <N> days earlier
  max0d:   // actual max tempFahrenheit for that day
  max1d:   // max tempFahrenheit for day, as guessed 1 day earlier
  max<N>d: // tempFahrenheit, as guessed <N> days earlier
}

http://api-sails.herokuapp.com/forecast/create?t=From-Shayna-Studio-Error&error=error&note
http://api-sails.herokuapp.com/forecast?loc=chicago.updating
http://heroku-sails.herokuapp.com/forecast/update/51605c1d9491790200000001?name=Sam
/*/

function updateApi(apiJsonData, wuJsonData) {
	var ids = {};
	var ids = {};
	var url, ii;
	var epochSecs;
	var days = wuJsonData.forecast.simpleforecast.forecastday;
	
	for (ii=0; ii < apiJsonData.length; ii++) {
		// create a hash of existing document Ids with 'day' as key
		epochSecs = apiJsonData[ii]['day'];
		ids[epochSecs] = apiJsonData[ii];
		
		// Now change 'chicago.updating' to 'chicago'
		// for ones that have 'for' no longer in future
		var nowMs = normalizeEpochMs();
		if (epochSecs * 1000 < nowMs) {
			url = apiServer + '/forecast/update/'+ ids[epochSecs].id +'?loc=chicago';
			rest.getJSON( url, function() {});
		}
	}

	for (ii=0; ii < days.length; ii++) {
		var ao = parseDay(days[ii]);
		
		// if 'day' exists, update; else create
		if (ids[ao.day]) {
			// only update if hasn't been updated 
			if (ao.minKey in ids[ao.day]) {
				url = '';
				console.log('already updated, skipping: '+ ao.str);
			} else {
				url = apiServer + '/forecast/update/'+ ids[ao.day].id +'?'+ ao.str;
			}
			//url = apiServer + '/forecast/delete/'+ ids[ao.day].id;
		} else {
			url = apiServer + '/forecast/create?loc=chicago.updating&'+ ao.str;
		}
		//console.log(url +' '+ (new Date(parseInt(ao.day)*1000)));
		if (url) {
			rest.getJSON( url, function() {});
		}
    }
}
	

function parseDay(day) {
	var ao = {};
	var nowMs = normalizeEpochMs();
	var daysAhead;
	var dayOffset = 0.5; // what's a good offset?
	
	ao.day = normalizeEpochMs(day.date.epoch*1000)/1000;
	ao.minVal = day.low.fahrenheit;
	ao.maxVal = day.high.fahrenheit;
	
	//daysAhead = Math.floor(dayOffset + (ao.day*1000 - nowMs) / (1000*60*60*24));
	daysAhead = (ao.day*1000 - nowMs) / (1000*60*60*24);
	ao.minKey = 'min'+ daysAhead +'d';
	ao.maxKey = 'max'+ daysAhead +'d';
	
	ao.str = 'day='+ ao.day +'&'+ ao.minKey +'='+ ao.minVal +'&'+ ao.maxKey +'='+ ao.maxVal;
	return ao;
}

// returns the same epoch ms for a given day given any epoch time in that day
function normalizeEpochMs(epochMs) {
	var d = epochMs ? new Date(epochMs) : new Date();
	d.setMilliseconds(0);
	d.setSeconds(0);
	d.setMinutes(0);
	d.setHours(UPDATE_HOUR);
	//console.log("normalizeEpochMs: ", epochMs, d.getTime(), d);
	return d.getTime();
}
init();
