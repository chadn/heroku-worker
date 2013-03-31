/* phantom.js javascript file, to be called like
 *
 * phantomjs phantom.to-shayna-studio.js
 *
 */

var url1 = 'https://maps.google.com/maps?hl=en'
 + '&saddr=2733+N+Troy+St,+Chicago,+IL'
 + '&daddr=2150+S+Canalport+Ave,+Chicago,+IL+60608,+USA';

// '#altroute_0 .altroute-aux span' == \d mins

var page = require('webpage').create();

function pageEvaluate() {
	
	var m = document.getElementById('altroute_0').innerHTML;
	m = m.match(/traffic[^\d]*(\d+)\s+mins/i);
	if (m && m[1]) {
		return parseInt( m[1] );
	} else {
		return 'Fixme: '+ document.getElementById('altroute_0').innerHTML;
	}
	// works only for localhost, not stathat.com
	/*
	var el = document.createElement('script');
	el.src = 'http://127.0.0.1:5000/phantomjs.js?s=3';
	el.src = 'http://127.0.0.1:5000/ez?email=chad@chadnorwood.com&stat=Shayna+to+work&value=14';
	document.body.appendChild(el);
	*/
}


page.open(url1, function (status) {
	var now = new Date();
	if (status !== 'success') {
		console.log(now +' Unable to access network');
		return;
	}
	var url2 = 'https://api.stathat.com/ez?email=dev@chadnorwood.com';

	var time = page.evaluate(pageEvaluate);

	if (typeof time === 'number') {
		url2 += '&stat=To+Shayna+Studio&value='+ time;

	} else if (typeof time === 'string') {
		url2 += '&stat=To+Shayna+Studio+Errors&count=1';
		console.log(now +' '+ time);
	}
	// http://chad-php.herokuapp.com/phantom/'+p
	page.open(url2, function (status2) {
		console.log(now +' '+ status2 + ' ' + url2);
		phantom.exit()
	});
});

	/* https://github.com/ariya/phantomjs/wiki/Page-Automation */
	//page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
	//page.includeJs("http://code.jquery.com/jquery-1.9.1.min.js", function() {
		
