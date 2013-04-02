// config file for bin/phantom.commute.js

var stathat_email = require('system').env.STATHAT_EMAIL || '____your____@__email___.com';
var stathatBase = 'https://api.stathat.com/ez?email=' + stathat_email;

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


var conf = {
	MAX_RETRIES: 3,
	RETRY_DELAY: 5000, // time in ms
	urls: urls
}
