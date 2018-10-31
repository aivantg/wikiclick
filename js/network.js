var http = require("http");
var https = require("https");
const URL = require('url').URL

const autoCompletePrefixOptions = function(query) {
  return {
      host: 'en.wikipedia.org',
      port: 443,
      path: '/w/api.php?action=opensearch&search=' + encodeURIComponent(query),
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  };
}

const summaryPrefixOptions = function(id) {
  return {
      host: 'en.wikipedia.org',
      port: 443,
      path: '/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=' + encodeURIComponent(id),
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  };
}

/**
 * getWikiPrefixMatches: Get's and parses result from wikipedia search query
 * @param query: query string
 * @param callback: callback to send back array of {name:'', id:''} objects
 */
exports.getWikiPrefixMatches = function(query, callback) {
  getJSON(autoCompletePrefixOptions(query), function (statusCode, data) {
    var results = [];
    if(data.length != 0) {
      for (i = 0; i < data[1].length; i++) {
        var url = new URL(data[3][i]);
        var id = url.pathname.substring(6);
        results.push({name: data[1][i], id: id});
      }
    }
    callback(results)
  });
}

exports.getWikiSummary = function(id, callback) {
  getJSON(summaryPrefixOptions(id), function(statusCode, data) {
    data = data.query.pages
    summary = data[Object.keys(data)[0]].extract
    if(summary != null) {
      summary = summary.split(' ( listen);').join('')
      summary = summary.split('\n')[0]
      summary_sentences = summary.split('.')
      if (summary_sentences.length > 10) {
        summary = summary_sentences.slice(0, 6).join('.')
        summary += "."
      }
    }
    callback(summary)
  });
}
/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getJSON(options, onResult) {

    var port = options.port == 443 ? https : http;
    var req = port.request(options, function(res) {
        var output = '';
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
