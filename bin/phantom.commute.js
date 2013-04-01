/* phantom.js javascript file that scrapes driving times including traffic. To be called like
 *
 * phantomjs phantom.commute.js
 *
 */

var page = require('webpage').create();
var configFile = '../conf/config.phantom.commute.js';

function init() {

	// don't use require() like in node, use injectjs()
	//var conf = require('../conf/config.js');
	// https://groups.google.com/forum/?fromgroups=#!topic/phantomjs/CvQPn_KltiY
	// https://github.com/ariya/phantomjs/wiki/API-Reference-phantom#wiki-phantom-injectJs
	phantom.injectJs(configFile); // sets conf

	if (!(conf && conf.urls)) {
		console.log('Could not find conf.urls, Check config file: '+ configFile);
		//console.log('phantom.libraryPath',phantom.libraryPath);
		phantom.exit();
	} else {
		console.log('Starting, MAX_RETRIES:'+ conf.MAX_RETRIES +', number urls:'+ conf.urls.length);
	}
	next()
}

function next() {
	if (!conf.urls.length) {
		phantom.exit();
	}
	var uo = conf.urls.shift();
	if (uo.remainingRetries) {
		var waitMs = (1 + conf.MAX_RETRIES - uo.remainingRetries) * (conf.RETRY_DELAY || 5000);
		setTimeout(function(){
			getTimes(uo);
		}, waitMs);
		console.log('Waiting '+ waitMs +'ms, Retries left:'+ uo.remainingRetries +' for stathat:'+ uo.stathatValue);
	} else {
		getTimes(uo);
	}
}
function retry(uo) {
	if (typeof uo.remainingRetries === 'undefined') {
		uo.remainingRetries = conf.MAX_RETRIES;
	} else {
		uo.remainingRetries--;
	}
	if (uo.remainingRetries > 0) {
		conf.urls.push(uo);
	}
}

function getTimes(uo) {
	if (!(uo && uo.route)) {
		console.log('invalid: ', uo);
		phantom.exit();
		return;
	}
	page.open(uo.route, function (status) {
		var now = new Date();
		if (status !== 'success') {
			console.log(now +' Unable to access network. '+ uo.route);
			return;
		}
		var url;
		var time = page.evaluate(pageEvaluate);

		if (typeof time === 'number') {
			url = uo.stathatValue + time;

		} else if (typeof time === 'string') {
			url = uo.stathatError;
			console.log(now +' '+ time);
		}
		page.open(url, function (status2) {
			if (status2 !== 'success') {
				console.log(now +' Error fetching URL ('+ status2 +'): '+ url);
				retry(uo);
			} else {
				console.log(now.getTime() +' '+ now +' '+ status2 + ' ' + url);
			}
			next();
		});
	});
}

function pageEvaluate() {
	
	// '#altroute_0 .altroute-aux span' == \d mins
	var m = document.getElementById('altroute_0').innerHTML;
	m = m.match(/traffic[^\d]*(\d+)\s+mins/i);
	if (m && m[1]) {
		return parseInt( m[1] );
	} else {
		return 'Fixme: '+ document.getElementById('altroute_0').innerHTML;
	}
}

init();

