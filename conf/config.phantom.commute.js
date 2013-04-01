// config file for bin/phantom.commute.js

// TODO: add your stathat email here:
var stathatBase = 'https://api.stathat.com/ez?email=____your____@__email___.com';

var urls = [{
  route: 'https://maps.google.com/maps?hl=en'
    + "&saddr=Chicago+O'Hare+International+Airport,+10000+West+O'Hare+Avenue,+Chicago,+IL"
    + '&daddr=Chicago+Bean,+55+North+Michigan+Avenue,+Chicago,+IL+60601',
  stathatValue: stathatBase + "&stat=From+O'Hare+To+Chicago+Bean&value=",
  stathatError: stathatBase + "&stat=From+O'Hare+To+Chicago+Bean+Errors&count=1"
},{
  route: 'https://maps.google.com/maps?hl=en'
    + "&daddr=Chicago+O'Hare+International+Airport,+10000+West+O'Hare+Avenue,+Chicago,+IL"
    + '&saddr=Chicago+Bean,+55+North+Michigan+Avenue,+Chicago,+IL+60601',
  stathatValue: stathatBase + "&stat=To+O'Hare+From+Chicago+Bean&value=",
  stathatError: stathatBase + "&stat=To+O'Hare+From+Chicago+Bean+Errors&count=1"
}];


var conf = {
	MAX_RETRIES: 3,
	RETRY_DELAY: 5000, // time in ms
	urls: urls
}
