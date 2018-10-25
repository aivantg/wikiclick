var http = require("http");
var https = require("https");

const prefixOptions = {
    host: 'en.wikipedia.org',
    port: 443,
    path: '/w/api.php?action=opensearch&search=' + query,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * getWikiPrefixMatches: Get's and parses result from wikipedia search query
 * @param query: query string
 * @param callback: callback to send back array of {name:'', id:''} objects
 */
exports.getWikiPrefixMatches = function(query, callback) {
  getJSON(prefixOptions, function (statusCode, data) {
    var results = [];
    if(data.length != 0) {
      for (i = 0; i < data[1].length; i++) {
        var url = new URL(data[3][i]);
        var id = url.pathname.substring(6);
        results.push({name: data[1][i], id: id});
      }
    }
    callback(results)
  }
}
/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getJSON(options, onResult) {
    console.log("rest::getJSON");

    var port = options.port == 443 ? https : http;
    var req = port.request(options, function(res) {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        console.log("error: " + err.message);
        onResult(res.statusCode, [])
    });

    req.end();
};
