/* phantom.js javascript file that scrapes driving times including traffic. To be called like
 *
 * phantomjs phantom.commute.js [configFile]
 *
 */


var webpage = require('webpage');
var args = require('system').args;
var commute = require('../lib/commute');

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
		console.log((new Date()).getTime() + ' Starting, MAX_RETRIES:'+ conf.MAX_RETRIES +', number urls:'+ conf.urls.length);
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
		console.log('Waiting '+ waitMs +'ms, Retries remaining:'+ uo.retries +', for: '+ uo.name);
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
		console.log('Will Retry ('+ uo.retries +' retries remaining) for stathat:'+ uo.name);
		conf.urls.push(uo);
	} else {
		console.log(now.getTime() +' No more retries, aborting: ' + uo.name);
	}
}

function getTimes(uo) {
	if (!(uo && uo.route)) {
		console.log('getTimes() invalid url obj: ', uo);
		next();
		return;
	}
	page = webpage.create();
	page.open(uo.route, function (status) {
		var now = new Date();
		if (status !== 'success') {
			console.log(now.getTime() +' '+ status +' '+ uo.route +' -- '+ uo.name);
			retry(uo);
			page.close();
			next();
			return;
		}
		
		// success! now extract driving time in traffic
		var ii, urls;
		var time = page.evaluate(commute.findMins);
		page.close();

		var evalSuccess = typeof time === 'number';
		if (evalSuccess) {
			console.log(now.getTime() +' Success evaluating html for '+ uo.route +' -- '+ time);
			urls = uo.urlSuccess;

		} else {
			console.log(now.getTime() +' Error evaluating html for '+ uo.route +' -- '+ time);
			urls = uo.urlError;
		}
		if (typeof urls === 'string') {
			urls = [urls];
		}

		// note that we don't wait for responses from postResults, but we delay next()
		for (ii = 0; ii < urls.length; ii++) {
			postResults(uo, urls[ii] + time);
			/*/
			/*/
		}
		setTimeout(function(){
			next();
		}, 2000); // wait 2 secs
	});
}

function postResults(uo, url) {
	var page = webpage.create();
	var now = new Date();
	//console.log(now.getTime() +' Trying: ' + url);
	page.open(url, function (status2) {
		page.close();
		now = new Date();
		//console.log(now.getTime() +' '+ status2 + ' ' + url);

		var jo;
		if (status2 === 'success') {
			try {
				jo = JSON.parse(page.plainText);
			} catch (e) {
			}
		}
		if (jo && (jo.id || jo.status == 200)) {
			console.log(now.getTime() +' postResults Success ' + url);

		} else {
			console.log(now.getTime() +' postResults got Unexpected response, will retry. ' + url + ' '+ page.plainText);
			retry(uo);
		}
	});
	
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

