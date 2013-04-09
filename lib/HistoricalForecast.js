/*/ 
Usage: This module is designed to be called from node, phantomjs, or included in browser

Overview: Makes it easy to deal with historical weather forecast data

Components:

apiServer = where forecast weather data is stored
weather underground = source of forecast data
highcharts = used to display forecast data

Details: 

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

https://api-sails.herokuapp.com/forecast?loc=chicago.updating
https://api-sails.herokuapp.com/forecast/create?loc=chicago.updating&day=1365526800&min3d=40&max3d=60
https://api-sails.herokuapp.com/forecast/update/51605c1d9491790200000001?min3d=40&max3d=60


/*/


/**
 * var hf = new HistoricalForecast({
		updateHour: 12, // make noon, 12pm exactly, be the precise 'time' for a given day, note that updates happen after this.
		apiServer: 'https://api-sails.herokuapp.com/'+ process.env.APPROVED_API_KEY,
		getJsonMethod: function(url, cb) {
			rest.getJSON( url, cb );
		}
 * });
 *
 * @return {Object} HistoricalForecast
 */
var HistoricalForecast = function(options){
	if ( !(this instanceof HistoricalForecast) ) {
		return new HistoricalForecast( options );
	}
	this.opts = {
		apiServer: 'https://api-sails.herokuapp.com',
		loc: 'chicago',
		updateHour: 12 // make noon, 12pm exactly, be the precise 'time' for a given day
		// note that updates happen after this
	};
	this.getJson(); // sets this.opts.getJsonMethod(), which can be overwritten, 
	if (typeof options == 'object') {
		for (var k in options) {
			this.opts[k] = options[k];
		}
	}
	this.startMs = new Date().getTime();
	return this;
}

/**
 * api2series: convert json data from api to 'series' format for highcharts
 * @param {Object} apiData fetched from api server
 * @param {String} keyMatch (optional) only include fields matching keyMatch. Ex: min, max, 
 */
HistoricalForecast.prototype.api2highcharts = function(apiData, keyMatch) {
	keyMatch = keyMatch || '(min|max|humd)';
	keyMatch = new RegExp(keyMatch, 'i'); // ignore case
	/*/
	// highcharts wants series data like this: [[1144627200000,32.50], [1144627500000,35.50]]
	// highcharts can have multiple series in chart, each has its own name and data, like:
	[{
		name : 'high',
		data : high
	}, {
		name : 'low',
		data : low
	}];
	/*/
	var foundData = {};
	var seriesData = [];
	var ii, key, epochMs;
	//console.log('api2highcharts parsing:',apiData.length,keyMatch);

	function foundDataUpdate(doc){
		var epochMs = doc.day * 1000;
		var key, val;
		for (key in doc) {
			//console.log('api2highcharts parsing doc key:'+key, doc[key]);
			if (!key.match(keyMatch)) {
				//console.log('api2series skipping key('+key+') because it does not match keyMatch:', keyMatch);
				continue;
			}
			if (!foundData[key]) {
				foundData[key] = [];
			}
			val = parseFloat(doc[key]);
			if (isNaN(val)) {
				console.log('api2highcharts bad val for key '+key+' in document: ', doc);
			} else {
				foundData[key].push([epochMs, val]);
			}
		}
	}
	for (ii=0; ii < apiData.length; ii++) {
		//console.log('api2highcharts parsing ii:'+ii,apiData[ii]);
		foundDataUpdate(apiData[ii]);
	}
	for (key in foundData) {
		foundData[key].sort(function(a,b){return a[0]-b[0]});
		seriesData.push({name:key, data:foundData[key]});
		//console.log('api2highcharts adding '+ foundData[key].length +' values to series: '+ key, foundData[key]);
	}
	return seriesData;
}

/**
 * getJson: fetches json data from url, uses jquery or user supplied function, getJsonMethod
 *
 * @param {String} url to fetch.  If none passed, it merely sets getJsonMethod
 * @param {Object} cb(err, jsonData) called with url fetch is complete
 */
HistoricalForecast.prototype.getJson = function(url, cb) {
	if (!this.opts.getJsonMethod) {
		if (typeof jQuery != 'undefined' && jQuery.getJSON) {
			this.opts.getJsonMethod = this.getJsonJQuery;
		} else {
			console.warn('no jquery found, must supply getJsonMethod in options');
			return;
		}
	}
	if (url && cb) {
		this.opts.getJsonMethod(url,cb);
	}
};

HistoricalForecast.prototype.getJsonJQuery = function(url, cb) {
	var startMs = new Date().getTime();
	var me = 'getJsonJQuery';
	var errors;
	
	var jqxhr = jQuery.getJSON(url);
	jqxhr.always(function(data){
		// NOTE on 'data': if jqxhr.status is 2xx, data is json object response sent by server.
		// If jqxhr.status is 4xx, data is jqxhr object, not json from server.
		// In both cases jqxhr.responseText is string version of server's json object response,
		// so we just ignore data and use jqxhr.responseText
		var jsonData = jqxhr.responseText ? jQuery.parseJSON(jqxhr.responseText) : {};

		me += ' '+ (new Date().getTime() - startMs) + 'ms: ';
		if (('undefined' === typeof jqxhr.status) || (jqxhr.status === 0)) {
			errors = 'Bad jqxhr, bad response from jquery ajax('+ jqxhr.status +'), perhaps network is down?';
			console.log(me + " had errors: ", errors, jqxhr);
			cb(errors);
		} else {
			if (jqxhr.status >= 400) {
				errors = 'Bad HTTP code('+ jqxhr.status +') from server.';
				console.log(me + " had errors: ", errors);
				cb(errors, jsonData);
			} else {
				cb(null, jsonData);
			}
		}
	});
};

HistoricalForecast.prototype.fetchWeatherUnderground = function(data) {
};

HistoricalForecast.prototype.parseWeatherUndergroundDay = function(day) {
	var ao = {};
	var todayMs = this.normalizeEpochMs();
	var daysAhead;
	
	ao.day = this.normalizeEpochMs(day.date.epoch*1000)/1000;
	ao.minVal = day.low.fahrenheit;
	ao.maxVal = day.high.fahrenheit;
	ao.hVal = day.avehumidity;
	
	daysAhead = (ao.day*1000 - todayMs) / (1000*60*60*24);
	ao.minKey = 'min'+ daysAhead +'d';
	ao.maxKey = 'max'+ daysAhead +'d';
	ao.hKey = 'humd'+ daysAhead +'d';
	
	ao.str = 'day='+ ao.day 
		+'&'+ ao.hKey +'='+ ao.hVal 
		+'&'+ ao.minKey +'='+ ao.minVal 
		+'&'+ ao.maxKey +'='+ ao.maxVal;
	return ao;
}

// returns the same epoch ms for a given day given any epoch time in that day
HistoricalForecast.prototype.normalizeEpochMs = function(epochMs) {
	var d = epochMs ? new Date(epochMs) : new Date();
	d.setMilliseconds(0);
	d.setSeconds(0);
	d.setMinutes(0);
	d.setHours(this.opts.updateHour);
	//console.log("normalizeEpochMs: ", epochMs, d.getTime(), d);
	return d.getTime();
}

if (typeof module !== 'undefined') {
	module.exports = HistoricalForecast;
}

/*/
also implemented via 'pastcast' feature of 
http://weatherspark.uservoice.com/forums/88675-general/suggestions/1593753-overlay-historical-forecast-with-historical-data-
more on historical weather data
http://weatherspark.com/history/30851/2013/Chicago-Illinois-United-States
/*/

