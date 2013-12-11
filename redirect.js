var express = require('express'),
	argv = require('optimist').argv,
	fs = require('fs-extra'),
	_ = require('underscore'),
	path = require('path'),
	mapFile = path.normalize(argv.m || argv.map || __dirname + '/map.sample.json'),
	Map,

	mapDefaults =
	{
		"newRootUrl": "",
		indexOf: [

		],
		"paths": {

		}
	},

	log = argv.v || argv.verbose ? function(msg){ console.log('[bb-redirector] ' + msg ); } : function(){},

	getNewRoute = function(route) {
		var newRoute = '', match = false;

		for (var i = 0; i < Map.startWith.length; i++) {
			var startWith = Map.oldPrefix + Map.startWith[i];
			var idx = route.indexOf(startWith);
			if (idx >= 0) {
				newRoute += appendToNewRoute(route, startWith, idx);
				match = true;
				break;
			}
		}

		if (!match) {
			log('no startWith match');
			newRoute += pathsMatch(route);
		}

		return newRoute;
	},

	pathsMatch = function (route){
		route =  stripTrailingSlash(route);
		return Map.paths[route] || '';
	},

	stripTrailingSlash = function (url){
		return ('' + url).replace(/\/+$/, '');
	},

	appendToNewRoute = function (route, startWith, idx){
		var postFix = route.substr(idx + startWith.length);
		var variable = postFix.split('/')[0] || postFix;
		return pathsMatch(startWith + variable);
	};

if (fs.existsSync(mapFile)) {
	log('reading map file: ' + mapFile + ' please be patient...');
	Map = _.extend(mapDefaults, fs.readJsonSync(mapFile) || {});

	// clean trailing slashes from the paths keys
	var tempPathsMap = {};
	Object.keys(Map.paths).forEach(function(k){
		var v = Map.paths[k];
		k = stripTrailingSlash(k);
		tempPathsMap[k] = v;
	});
	Map.paths = tempPathsMap;
	tempPathsMap = null;
} else {
	var er = new Error('[Error] map file: ' + mapFile + ' does not exist.');
	log(er);
	throw er;
}

var app = express();

var hasProtocol = Map.newRootUrl.match(/^http(?:s)?:\/\//);
app.get('*', function(req, res) {
	var newRoute = getNewRoute(req._parsedUrl.pathname);
	var query = req._parsedUrl.query;
	var redirectTo = (hasProtocol ? Map.newRootUrl : req.protocol + '://' + Map.newRootUrl)
		+ (newRoute || '')
		+ (query ? '?' + query : '');

	log(req.url + ' --> ' + redirectTo);
	res.end(redirectTo);
	res.redirect(301, redirectTo);
});

var port = argv.p || argv.port || 3000;
var host = argv.h || argv.host || 'localhost';
app.listen(port, host);
console.log('running on ' + host + ':' + port);
