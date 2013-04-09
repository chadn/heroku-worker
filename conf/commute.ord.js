// config file for bin/phantom.commute.js

// TODO: replace ____your____@__email___.com 
// with your stathat email here:
// .. or you can do this: heroku config:set STATHAT_EMAIL='xx@abc.com'
var stathat_email = require('system').env.STATHAT_EMAIL || '____your____@__email___.com';
var stathatBase = 'https://api.stathat.com/ez?email=' + stathat_email;

var apiServer = 'http://api-sails.herokuapp.com/'+ require('system').env.APPROVED_API_KEY;

// TODO: optionally pick new source address (saddr) and destination address (daddr)
// Test URL in browser to make sure address works.
var urls = [{
	// https://maps.google.com/maps?hl=en&saddr=Chicago+O'Hare+International+Airport,+10000+West+O'Hare+Avenue,+Chicago,+IL&daddr=55+North+Michigan+Avenue,+Chicago,+IL+60601
  name: 'OHare-To-Chicago-Bean',
  route: 'https://maps.google.com/maps?hl=en'
    + "&saddr=Chicago+O'Hare+International+Airport,+10000+West+O'Hare+Avenue,+Chicago,+IL"
    + '&daddr=Chicago+Bean,+55+North+Michigan+Avenue,+Chicago,+IL+60601',
  urlSuccess: [
	stathatBase + "&stat=From+O'Hare+To+Chicago+Bean&value=",
	apiServer +'/driving_time/create?t=OHare-To-Chicago-Bean&mins='
	],
  urlError: [
    stathatBase + "&stat=From+O'Hare+To+Chicago+Bean+Errors&count=1&",
	apiServer +'/driving_time/create?t=OHare-To-Chicago-Bean-Error&error=error&note='
	]
},{
  name: 'OHare-From-Chicago-Bean',
  route: 'https://maps.google.com/maps?hl=en'
    + "&daddr=Chicago+O'Hare+International+Airport,+10000+West+O'Hare+Avenue,+Chicago,+IL"
    + '&saddr=Chicago+Bean,+55+North+Michigan+Avenue,+Chicago,+IL+60601',
  urlSuccess: [
	stathatBase + "&stat=To+O'Hare+From+Chicago+Bean&value=",
	apiServer +'/driving_time/create?t=OHare-From-Chicago-Bean&mins='
	],
  urlError: [
    stathatBase + "&stat=To+O'Hare+From+Chicago+Bean+Errors&count=1&",
	apiServer +'/driving_time/create?t=OHare-To-Chicago-Bean-Error&error=error&note='
	]
}];


var conf = {
	MAX_RETRIES: 3,
	RETRY_DELAY: 5000, // time in ms
	urls: urls
}
