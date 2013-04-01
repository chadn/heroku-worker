/* phantom.js javascript file that scrapes driving times including traffic. To be called like
 *
 * phantomjs phantom.to-shayna-studio.js
 *
 */

var stathatBase = 'https://api.stathat.com/ez?email=dev@chadnorwood.com';

var urls = [{
	route: 'https://maps.google.com/maps?hl=en'
	  + '&saddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&daddr=2150+S+Canalport+Ave,+Chicago,+IL+60608,+USA',
	stathatValue: stathatBase + '&stat=To+Shayna+Studio&value=',
	stathatError: stathatBase + '&stat=To+Shayna+Studio+Errors&count=1'
},{
	route: 'https://maps.google.com/maps?hl=en'
	  + '&daddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&saddr=2150+S+Canalport+Ave,+Chicago,+IL+60608,+USA',
	stathatValue: stathatBase + '&stat=From+Shayna+Studio&value=',
	stathatError: stathatBase + '&stat=From+Shayna+Studio+Errors&count=1'
},{
	route: 'https://maps.google.com/maps?hl=en'
	  + '&saddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&daddr=3150+Commercial+Ave,+Northbrook,+IL+60608,+USA',
	stathatValue: stathatBase + '&stat=To+Optics+Planet&value=',
	stathatError: stathatBase + '&stat=To+Optics+Planet+Errors&count=1'
},{
	route: 'https://maps.google.com/maps?hl=en'
	  + '&daddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&saddr=3150+Commercial+Ave,+Northbrook,+IL+60608,+USA',
	stathatValue: stathatBase + '&stat=From+Optics+Planet&value=',
	stathatError: stathatBase + '&stat=From+Optics+Planet+Errors&count=1'
}];

// '#altroute_0 .altroute-aux span' == \d mins

var page = require('webpage').create();

function next() {
	if (urls.length) {
		getTimes(urls.pop());
	} else {
		phantom.exit();
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
		// http://chad-php.herokuapp.com/phantom/'+p
		page.open(url, function (status2) {
			if (status2 !== 'success') {
				console.log(now +' Unable to access network. '+ url);
			} else {
				console.log(now.getTime() +' '+ now +' '+ status2 + ' ' + url);
			}
			next();
		});
	});
}

function pageEvaluate() {
	
	var m = document.getElementById('altroute_0').innerHTML;
	m = m.match(/traffic[^\d]*(\d+)\s+mins/i);
	if (m && m[1]) {
		return parseInt( m[1] );
	} else {
		return 'Fixme: '+ document.getElementById('altroute_0').innerHTML;
	}
}
next();

