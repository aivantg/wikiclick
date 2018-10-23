const express = require('express')
const createTrie = require('autosuggest-trie')
const requests = require('./requests.js')
const app = express()
const URL = require('url').URL
const port = process.env.PORT || 3000
var path = require("path");

var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'wikiworld-0.cwlhu4azzdsr.us-west-1.rds.amazonaws.com',
  user     : 'wikiworld',
  password : 'agwikipass23',
  database : 'wikiworld',
  port     : 3306
});

connection.connect()

app.get('/', (req, res) => res.sendFile(path.join(__dirname+'/index.html')));
app.get('/query', (req, res) => {
  var id = req.query["id"];
  connection.query('SELECT src.title, dest.title, count FROM page AS src, page AS dest, request WHERE destID = dest.id AND srcID = src.id AND src.title = "' + id + '" GROUP BY srcID, destID ORDER BY count DESC LIMIT 10;'  , function (err, rows, fields) {
    if (err) throw err
    res.send(rows);
  })
});

app.post('/autocomplete', (req, res) => {
  var query = req.query["query"]
  console.log("Recieved Query:" + query);
  if(query.length > 2) {
    var options = {
        host: 'en.wikipedia.org',
        port: 443,
        path: '/w/api.php?action=opensearch&search=' + query,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    requests.getJSON(options, function(statusCode, result) {
      console.log("Got back status: " + statusCode);
      var results = [];
      for (i = 0; i < result[1].length; i++) {
        var url = new URL(result[3][i]);
        var id = url.pathname.substring(6);
        results.push({name: result[1][i], id: id});
      }
      res.send(results)
      console.log("Finished Query with " + results.length + " results");
    });
  }else {
    res.send([])
    console.log("Query too short!")
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

