#!/usr/bin/env node
/*/
 * This script can be run any number of times during the day.
 * It will only update servers once per day, right after hf.updateHourUTC.
/*/

var rest = require('../lib/rest');
var HistoricalForecast = require('../lib/HistoricalForecast');
console.log(' node.weather.js starting up ');

var hf = new HistoricalForecast({
	updateHourUTC: 17, // make 5pm UTC, about noon chicago, be the precise 'time' for a given day.
	apiServer: 'https://api-sails.herokuapp.com/'+ (process.env.APPROVED_API_KEY || ''),
	getJsonMethod: function(url, cb) {
		rest.getJSON( url, cb );
	}
});

var d = new Date();
if (d.getUTCHours() < hf.opts.updateHourUTC) {
	console.log(d.getTime() +' node.weather.js skipping, hoursUTC='+ d.getUTCHours() +', only updating after '+ hf.opts.updateHourUTC);
	//return;
}
console.log(d.getTime() +' node.weather.js running ');

hf.run();
