/* phantom.js javascript file that scrapes driving times including traffic. To be called like
 *
 * phantomjs phantom.commute.js [configFile]
 *
 */


var page = require('webpage').create();
var args = require('system').args;


var configFile = args[1] || '../conf/commute.ord.js';

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

	if (uo.retries) {
		// delay more on second retry than the first.
		var waitMs = (1 + conf.MAX_RETRIES - uo.retries) * (conf.RETRY_DELAY || 5000);
		
		setTimeout(function(){
			getTimes(uo);
		}, waitMs);
		console.log('Waiting '+ waitMs +'ms, Retries remaining:'+ uo.retries +', for: '+ uo.stathatValue);
	} else {
		getTimes(uo);
	}
}
function retry(uo) {
	if (typeof uo.retries === 'undefined') {
		uo.retries = conf.MAX_RETRIES;
	} else {
		uo.retries--;
	}
	if (uo.retries > 0) {
		console.log('Will Retry ('+ uo.retries +' retries remaining) for stathat:'+ uo.stathatValue);
		conf.urls.push(uo);
	} else {
		console.log(now.getTime() +' No more retries, aborting: ' + uo.stathatValue);
	}
}

function getTimes(uo) {
	if (!(uo && uo.route)) {
		console.log('getTimes() invalid url obj: ', uo);
		next();
		return;
	}
	page.open(uo.route, function (status) {
		var now = new Date();
		if (status !== 'success') {
			console.log(now.getTime() +' '+ status +' '+ uo.route +' -- '+ uo.stathatValue);
			retry(uo);
			next();
			return;
		}
		
		// success! now extract driving time in traffic
		var url;
		var time = page.evaluate(pageEvaluate);

		if (typeof time === 'number') {
			url = uo.stathatValue + time;

		} else {
			// time should be a string
			console.log(now.getTime() +' Error evaluating html for '+ uo.route +' -- '+ time);
			url = uo.stathatError;
		}
		page.open(url, function (status2) {
			now = new Date();
			console.log(now.getTime() +' '+ status2 + ' ' + url);

			var jo;
			if (status2 !== 'success') {
				retry(uo);
			} else {
				try {
					jo = JSON.parse(page.plainText);
				} catch (e) {
				}
			}
			if (!(jo && jo.status == 200)) {
				console.log(now.getTime() +' Unexpected response, will retry. ' + url + ' '+ page.plainText);
				retry(uo);
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
	}
	// Maybe its like this: In current traffic: 1 hour 4 mins
	m = document.getElementById('altroute_0').innerHTML;
	m = m.match(/traffic[^\d]*(\d+)\s+hour[^\d]*(\d+)\s+mins/i);
	if (m && m[1]) {
		return parseInt( m[2] ) + parseInt( m[1] ) * 60;
	} else {
		return 'Fixme: '+ document.getElementById('altroute_0').innerHTML;
	}
}
/*/
var links = page.evaluate(function() {
    return [].map.call(document.querySelectorAll('a.listing-thumb'), function(link) {
        return link.getAttribute('href');
    });
});
/*/
phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};

init();

