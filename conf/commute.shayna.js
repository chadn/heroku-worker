// config file for bin/phantom.commute.js

var stathat_email = require('system').env.STATHAT_EMAIL || '____your____@__email___.com';
var stathatBase = 'https://api.stathat.com/ez?email=' + stathat_email;

var apiServer = 'http://api-sails.herokuapp.com/'+ require('system').env.APPROVED_API_KEY;

var urls = [{
	name: 'To Shayna Studio',
	route: 'https://maps.google.com/maps?hl=en'
	  + '&saddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&daddr=2150+S+Canalport+Ave,+Chicago,+IL+60608,+USA',
	urlSuccess: [
		stathatBase + '&stat=To+Shayna+Studio&value=',
		apiServer +'/driving_time/create?t=To-Shayna-Studio&mins='
	],
	urlError: [
		stathatBase + "&stat=To+Shayna+Studio+Errors&count=1&",
		apiServer +'/driving_time/create?t=To-Shayna-Studio-Error&error=error&note='
	]
},{
	name: 'From Shayna Studio',
	route: 'https://maps.google.com/maps?hl=en'
	  + '&daddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&saddr=2150+S+Canalport+Ave,+Chicago,+IL+60608,+USA',
	urlSuccess: [
		stathatBase + '&stat=From+Shayna+Studio&value=',
		apiServer +'/driving_time/create?t=From-Shayna-Studio&mins='
	],
	urlError: [
		stathatBase + "&stat=From+Shayna+Studio+Errors&count=1&",
		apiServer +'/driving_time/create?t=From-Shayna-Studio-Error&error=error&note='
	]
},{
	name: 'To Optics Planet',
	route: 'https://maps.google.com/maps?hl=en'
	  + '&saddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&daddr=3150+Commercial+Ave,+Northbrook,+IL+60608,+USA',
	urlSuccess: [
		stathatBase + '&stat=To+Optics+Planet&value=',
		apiServer +'/driving_time/create?t=To-Optics-Planet&mins='
	],
	urlError: [
		stathatBase + "&stat=To+Optics+Planet+Errors&count=1&",
		apiServer +'/driving_time/create?t=To-Optics-Planet-Error&error=error&note='
	]
},{
	name: 'From Optics Planet',
	route: 'https://maps.google.com/maps?hl=en'
	  + '&daddr=2733+N+Troy+St,+Chicago,+IL'
	  + '&saddr=3150+Commercial+Ave,+Northbrook,+IL+60608,+USA',
	urlSuccess: [
		stathatBase + '&stat=From+Optics+Planet&value=',
		apiServer +'/driving_time/create?t=From-Optics-Planet&mins='
	],
	urlError: [
		stathatBase + "&stat=From+Optics+Planet+Errors&count=1&",
		apiServer +'/driving_time/create?t=From-Optics-Planet-Error&error=error&note='
	]
}];


var conf = {
	MAX_RETRIES: 3,
	RETRY_DELAY: 5000, // time in ms
	urls: urls
}
