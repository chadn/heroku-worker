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
  minActual: // actual min tempFahrenheit for that day
  min0d:   // min tempFahrenheit for day, as guessed that day
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
		updateHourUTC: 12, // make noon, 12pm exactly, be the precise 'time' for a given day, note that updates happen after this.
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
		
		// Need to provide real weather underground key - http://www.wunderground.com/weather/api/d/docs
		wuServer: 'http://api.wunderground.com/api/1234567890123456', // need real API key
		getJsonFromWu: 10, // limit of 10 requests per min from api.wunderground.com
		
		loc: 'chicago',
		updateHourUTC: 17 // make 5pm exactly (UTC time), be the precise 'time' for a given day
	};
	this.gotJsonFromWu = 1;
	if (typeof options == 'object') {
		for (var k in options) {
			this.opts[k] = options[k];
		}
	}
	this.startMs = new Date().getTime();
	return this;
}


/**
 * run: fetches new data from wunderground.com and updates apiServer
 */
HistoricalForecast.prototype.run = function(daysBack) {
	
	this.asyncGetJson('api', this.opts.apiServer + '/forecast?loc=chicago.updating');
	this.asyncGetJson('wuForecast', 'http://api.wunderground.com/api/121b8928ea8cca08/forecast10day/q/IL/Chicago.json');
	var me = this;
	this.whenDone(['api', 'wuForecast'], function() { me.updateApiServer() });
	
}

/**
 * updateApiServer: parses json data from api server and wuderground, then updates api server
 */
HistoricalForecast.prototype.updateApiServer = function() {
	var ids = {};
	var ids = {};
	var url, ii;
	var epochSecs;
	var days;

	//console.log('updateApiServer() updateApiHistory ', this.getJ.api.json);
	
	for (ii=0; ii < this.getJ.api.json.length; ii++) {
		// create a hash of existing document Ids with 'day' as key
		epochSecs = this.getJ.api.json[ii]['day'];
		ids[epochSecs] = this.getJ.api.json[ii];
		
		// Handle history data: change 'chicago.updating' to 'chicago'
		// for ones that have 'for' no longer in future
		var nowMs = this.normalizeEpochMs();
		if (epochSecs * 1000 < nowMs) {
			//console.log('updateApiServer() YES updateApiHistory '+ epochSecs, getDateStr(1000*epochSecs));
			this.updateApiHistory(this.getJ.api.json[ii]);
		}else{
			//console.log('updateApiServer() no updateApiHistory '+ epochSecs, getDateStr(1000*epochSecs));
		}
	}

	try {
		days = this.getJ.wuForecast.json.forecast.simpleforecast.forecastday;
	} catch (e) {
		console.log('updateApiServer() aborting wuForecast:', e);
		return;
	}

	// create or update future day's forecast info
	for (ii=0; ii < days.length; ii++) {
		var ao = this.parseWeatherUndergroundDay(days[ii]);
		
		// if 'day' exists, update; else create
		if (ids[ao.day]) {
			// only update if hasn't been updated 
			if (ao.minKey in ids[ao.day]) {
				url = '';
				console.log('already updated, skipping: '+ ao.str);
			} else {
				url = this.opts.apiServer + '/forecast/update/'+ ids[ao.day].id +'?'+ ao.str;
			}
			//url = this.opts.apiServer + '/forecast/delete/'+ ids[ao.day].id;
		} else {
			url = this.opts.apiServer + '/forecast/create?loc=chicago.updating&'+ ao.str;
		}
		//console.log(url +' '+ (new Date(parseInt(ao.day)*1000)));
		if (url) {
			this.getJson( url, function() {});
		}
    }
}


/**
 * updateApiHistory: Saves actual min, max temps, changes "chicago.updating" to "chicago"
 */
HistoricalForecast.prototype.updateApiHistory = function(apiDay) {
	var dailysummary;
	var dateStr = getDateStr(apiDay.day*1000); // YYYYMMDD
	var me = this;
	var historyUrl = 'http://api.wunderground.com/api/121b8928ea8cca08/history_'+ dateStr +'/q/IL/Chicago.json';
	//historyUrl = 'http://localhost:8080/Chicago.json?history_'+ dateStr;

	//console.log('updateApiHistory(): called for day: '+ dateStr, apiDay);

	if (!this.getJ[dateStr]) {
		me.getJ[dateStr] = 'getJson in progress';
		if (this.gotJsonFromWu++ >= this.opts.getJsonFromWu) {
			me.getJ[dateStr] = {
				err: 'updateApiHistory() can only fetch 10 requests per min from weatherunderground, finish later: '+ dateStr
			}
			console.warn(me.getJ[dateStr].err);
			return;
		}
		this.getJson( historyUrl, function(err, json) {
			me.getJ[dateStr] = {
				err: err,
				json: json
			}
			me.updateApiHistory(apiDay);
		});
		return;

	} else if (typeof this.getJ[dateStr] === 'string') {
		// getJson in progress
		setTimeout(function(){
			me.updateApiHistory(apiDay);
		},500);
		return;

	} else if (this.getJ[dateStr].err) {
		console.log('updateApiHistory(): error for '+ historyUrl +' '+ this.getJ[dateStr].err);
		return;

	} else if (!this.getJ[dateStr].json) {
		console.log('updateApiHistory(): no json for '+ historyUrl);
		return;
	}
	
	var url = this.opts.apiServer + '/forecast/update/'+ apiDay.id +'?loc=chicago';
	
	try {
		var dailysummary = this.getJ[dateStr].json.history.dailysummary[0];
		//console.log('updateApiHistory(): dailysummary: ', this.getJ[dateStr].json.history.dailysummary);
		url += '&minActual=' + dailysummary.mintempi;
		url += '&maxActual=' + dailysummary.maxtempi;
		url += '&humdActual=' + (parseInt(dailysummary.maxhumidity) + parseInt(dailysummary.minhumidity))/2;
		//console.log('updateApiHistory: '+ url);
		this.getJson( url, function() {});
		
	} catch (e) {
		console.log('updateApiHistory(): error parsing json for '+ dateStr +': '+ this.getJ[dateStr].json);
		return;
	}
}

function getDateStr(epochMs) {
	var d = new Date(epochMs);
	return '' + d.getFullYear() + addZero(d.getMonth() + 1) + addZero(d.getDate()); // YYYYMMDD
	function addZero(num) {
		return num < 10 ? '0'+num : num; 
	}
}

/**
 * api2highcharts: convert json data from api to 'series' format for highcharts
 * @param {Object} apiData fetched from api server
 * @param {String} keyMatch (optional) only include fields matching keyMatch. Ex: min, max, 
 * @param {String} offset (optional) if true, make values be the difference between actual and 
 *        corresponding min, max, or humd values (ex: min1d, min2d, etc). Requires keyMatch.
 */
HistoricalForecast.prototype.api2highcharts = function(apiData, keyMatch, offset) {
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
	if (offset) offset = keyMatch + 'Actual';
	keyMatch = keyMatch || '(min|max|humd)';
	keyMatch = new RegExp(keyMatch, 'i'); // ignore case
	var foundData = {};
	var seriesData = [];
	var ii, key, epochMs;
	//console.log('api2highcharts parsing:',apiData.length,keyMatch);

	function foundDataUpdate(doc){
		var epochMs = doc.day * 1000;
		var key, val;
		var minActual, maxActual, humdActual;
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
				console.log('api2highcharts bad val for key '+ key +' in document: ', doc);
				return;
			}
			if (offset) {
				val = val - parseFloat(doc[offset]);
			}
			if (isNaN(val)) {
				console.log('api2highcharts bad or no val for offset '+ offset +' in document: ', doc);
				return;
			}
			foundData[key].push([epochMs, val]);
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
	d.setUTCHours(this.opts.updateHourUTC);
	//console.log("normalizeEpochMs: ", epochMs, d.getTime(), d);
	return d.getTime();
}

/**
 * asyncGetJson: runs getJson and assigns results to this[key] object, use with whenDone
 * @param {String} key name of object where err and data will go
 */
HistoricalForecast.prototype.asyncGetJson = function(key, url) {
	var me = this;
	if (!me.getJ) me.getJ = {};
	me.getJ[key] = {};
	this.getJson( url, function(err, json) {
		me.getJ[key].err = err;
		me.getJ[key].json = json;
	});
}

/**
 * whenDone: a way to manage async events.
 * @param {Array} keys names of object where err and data will go
 */
HistoricalForecast.prototype.whenDone = function(keys, cb) {
	var me = this;
	var keyStr = keys.join('-') + '--' + new Date().getTime();
	if (!me.waiting) me.waiting = {};
	me.waiting[keyStr] = [keys, cb];

	// this isDone is custom for getJson callback
	// TODO: allow isDone function to be passed to whenDone
	function isDone(keys) {
		var keyObj;
		for (var ii=0; ii<keys.length; ii++) {
			keyObj = me.getJ[keys[ii]];
			if (!keyObj.err && !keyObj.json) {
				// both err and data are still not set, so not done
				return false;
			}
		}
		return true;
	}
	// part of isDone: validate that the keys were created by asyncGetJson
	for (var ii=0; ii<keys.length; ii++) {
		if (!me.getJ[keys[ii]]) {
			console.warn('whenDone() called with key that will never trigger:'+ keys[ii]);
			me.getJ[keys[ii]] = {err:'whenDone trigggered, code error'};
		}
	}

	function timer() {
		var numLeft = 0;
		var keys;
		for (keyStr in me.waiting) {
			numLeft++;
			if (isDone(me.waiting[keyStr][0])) {
				numLeft--;
				//console.log(new Date().getTime() + ' DONE: '+ keyStr);
				callback(me.waiting[keyStr][1]);
				delete me.waiting[keyStr];
			} else {
				//console.log(new Date().getTime() + ' not done: '+ keyStr);
			}
		}
		if (numLeft === 0) {
			//console.log(new Date().getTime() + ' clearing interval. ');
			clearInterval(me.whenDoneTimer);
		}
	}
	function callback(cb) {
		setTimeout(function(){
			cb();
		},1);
	}
	if (!me.whenDoneTimer) {
		//console.log(new Date().getTime() + ' setting interval. ');
		me.whenDoneTimer = setInterval(timer, 100);
	}
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

