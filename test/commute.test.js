// dependencies
var commute = require('../lib/commute');

// built-in node 
var assert       = require("assert");

describe('with Commute.prototype.findMins', function(){

	it('should parse html correctly, covering hours, mins, with and without traffic', function(){

		var html = ' <span>21.0 mi</span>, <span>30 mins</span>  <span> In current traffic: 1 hour 1 min </span>';
		assert.equal(61, commute.findMins(html));

		html = ' <span>21.0 mi</span>, <span>30 mins</span>  <span> In current traffic: 2 hours 30 mins </span>';
		assert.equal(150, commute.findMins(html));

		html = ' <span>21.0 mi</span>, <span>30 mins</span>  <span> In current traffic: 33 mins </span>';
		assert.equal(33, commute.findMins(html));

		html = ' <span>21.0 mi</span>, <span>30 mins</span>';
		assert.equal(30, commute.findMins(html));

		html = '<div class="dir-altroute-inner">  <div class="altroute-rcol altroute-info">  <span>7.4 mi</span>, <span>14 mins</span>    </div>  <div>I-90 E/I-94 E</div>   <div class="dir-altroute-clear"></div> </div> ';
		assert.equal(14, commute.findMins(html));
		
		html = ' <span>21.0 mi</span>, <span>7 hours 0 mins</span>';
		assert.equal(420, commute.findMins(html));
	});

	it('should handle html from a function', function(){
		assert.equal(49, commute.findMins(function(){
			// #dir_atm - Public Transit example 
			return '<div class="altroute-rcol altroute-info">49 mins</div>      Or take <a href="/maps?xx=yy" onclick="return loadUrl(this.href)">Public Transit</a>  <span class="dir-atm-summary no-wrap"> (Subway) </span>'
		}));
	});

});
