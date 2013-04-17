/*/ This module is designed to be called from node or phantomjs 
/*/

	
var Commute = function (options){
	if ( !(this instanceof Commute) ) {
		return new Commute( options );
	}
	this.opts = {};
	if (typeof options == 'object') {
		for (var k in options) {
			this.opts[k] = options[k];
		}
	}
	this.startMs = new Date().getTime();
	return this;
}
/**
 * findMins: finds the number of minutes of the driving time in traffic of google maps directions.
 * Note this function can be evaluated by phantomJS in the context of the google maps web page,
 * where 'document' is set, or html can be passed in
 *
 * @param {String|Function} html, used as is if string, if function its called to get html
 * @return {Number|String} if found, returns a number (mins), else returns a string of HTML
 */
Commute.prototype.findMins = function(html) {
	var ii, m, hours;

	if (typeof html == 'undefined') {
		html = document.getElementById('altroute_0').innerHTML;
	} else if (typeof html == 'function') {
		html = html();
		//console.log('html function results: ', html);
	}
	
	// try to match in the following order:
	var regexs = [
		/traffic[^\d]*(\d+)\s+hours?[^\d]*(\d+)\s+min/i, // In current traffic: 1 hour 4 mins
		/traffic[^\d]*(\s+)(\d+)\s+min/i,
		/(\d+)\s+hour[^\d]*(\d+)\s+min/i, // no traffic info, so just get time
		/([^\d]+?)(\d+)\s+min/i
	]
	for (ii=0; ii<regexs.length; ii++) {
		m = html && html.match(regexs[ii]);
		//console.log('findMins checking: ii='+ii, regexs[ii], m);
		if (m && m.length > 1) {
			//console.log('findMins match: ii='+ii, regexs[ii], m);
			hours = parseInt( m[1] ) || 0;
			return parseInt( m[2] ) + (hours * 60);
		}
	}
	//console.log('findMins no match. Fixme: '+ html);
	return 'Fixme: '+ html;
};


module.exports = Commute();

