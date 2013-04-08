
module.exports = (function() {
	var rest = this;
	var urlNode = require('url');
	var http = require('http');
	var https = require('https');

	/**
	 * getJSON:  REST get request returning JSON object(s)
	 *
	
	var url = 'http://somesite.com/some/path?a=1'
	var options = {
	    host: 'somesite.com',
	    port: 443,
	    path: '/some/path',
	    method: 'GET',
		agent: http.globalAgent, // TODO: Controls Agent behavior. When an Agent is used request will default to Connection: keep-alive. Possible values:
	    headers: {
	        'Content-Type': 'application/json'
	    }
	};
	rest.getJSON( <options|url>,  function(err, jsonData, response) {
		if (err || response.statusCode != 200) {
			console.log('error, not done ', err, response.statusCode);
			return res.send('error: ' + err);
		}
		res.render('chad1', {
			products: jsonData
		});
	});

	 * @param options: http options object
	 * @param callback: callback function, passed these params: err, jsonData, response
	 * @param callback err: string error message, if not successful.
	 * @param callback jsonData: if no err, is JSON data results.
	 * @param callback response: response object containing headers, statusCode, etc.
	 */
	rest.getJSON = function(options, callback){
		var startMs = new Date().getTime();
		var socketTimeoutMs = process.env.BOT_GETJSON_TIMEOUT || 20000; // wait at most this long.  Heroku's timeout is 30sec, so this should be less than 30000
		var socketTimedout = false;
		var output = '';
		
		// newrelic barfs if we use string, so parse it.
		if (typeof options === 'string') {
			//console.log('===== rest.getJSON() '+ options, urlNode.parse(options));
			options = urlNode.parse(options); // http://nodejs.org/docs/latest/api/url.html
		}
		// first figure out which protocol to use for request, http or https
		var protocol = http;
		if ((options.href && options.href.match(/^https:/i)) 
		   || (options.port && options.port == 443)) {
			protocol = https;
		}
		
		// request - see http://nodejs.org/docs/v0.8.21/api/http.html#http_class_http_clientrequest
		var request = protocol.request(options, function(response) {
			// response - see http://nodejs.org/docs/v0.8.21/api/http.html#http_http_clientresponse
			response.setEncoding('utf8');

			response.on('data', function (chunk) {
				output += chunk;
			});

			response.on('end', function() {
				var elapsMs = new Date().getTime() - startMs;
				var jsonData = {};
				if (output.length) {
					try {
						// always wrap JSON.parse() with try/catch to prevent node server from crashing.
						jsonData = JSON.parse(output);
					} catch (e) {
						console.warn('rest.getJSON '+ response.statusCode +' '+ elapsMs +'ms, JSON parse ERROR ('+ e.message +')', options.href || options);
						return callback('error parsing json', output, response);
					}
				}
				console.log('rest.getJSON '+ response.statusCode +' '+ elapsMs +'ms '+ output.length, options.href || options);
				callback(null, jsonData, response); // success
			});
		});

		request.setTimeout(socketTimeoutMs, function (){
			var elapsMs = new Date().getTime() - startMs;
			console.warn('rest.getJSON - '+ elapsMs +'ms, request timeout', options.href || options);
			socketTimedout = true;
			request.destroy();
			callback('request timeout after '+ elapsMs +'ms', output, {} );
		});

		request.on('error', function(err) {
			if (socketTimedout) {
				//console.log('rest.getJSON skipping error from request, since timed out', options.href || options);
				return;
			}
			var elapsMs = new Date().getTime() - startMs;
			console.warn('rest.getJSON '+ elapsMs +'ms, error:', err.message, options.href || options);
			callback(err.message, output, {} );
		});

		// request.setSocketKeepAlive(true);

		request.end();
		return request; 
	};
	return rest;
})();

