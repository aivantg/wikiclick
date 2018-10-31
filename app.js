require('dotenv').config()

const express = require('express')
const network = require('./js/network.js')
const data = require ('./js/data.js')
const iplocation = require("iplocation").default;


var path = require("path");


const app = express()
const port = process.env.PORT || 3000


app.get('/', (req, res) => {
  if(req.query["id"]) {
    res.redirect('/detail?id=' + encodeURIComponent(req.query["id"]));
  } else {
    res.sendFile(path.join(__dirname+'/index.html'));
  }
});

app.get('/summary', (req, res) => {
    var id = req.query["id"]
    network.getWikiSummary(id, (summary) => res.send(summary));
});

app.get('/topClicksTo', (req, res) => {
  var id = req.query["id"];
  data.getTopClicksToID(id, (results) => res.send(results))
});

app.get('/topClicksFrom', (req, res) => {
  var id = req.query["id"];
  data.getTopClicksFromID(id, (results) => res.send(results))
});

app.get('/searchHits', (req, res) => {
  var id = req.query["id"];
  data.getSearchHits(id, (results) => res.send(results))
});

app.get('/topMonth', (req, res) => {
  var id = req.query["id"]
  data.getTopMonth(id, (results) => res.send(results))
});

app.get('/detail', (req, res) => {
  var id = req.query["id"]
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  iplocation(ip, [], (error, ip_data) => {
    if(error) {
      console.log("Error finding data for ipaddress: " + ip);
      console.log("Error Message: " + error.message)
      ip_data = {ip: ip, city: 'nil', longitude: 0.0, latitude: 0.0};
    }
    data.trackVisit(id, ip_data);
  });
  res.sendFile(path.join(__dirname + '/detail.html'))
})

// Autocomplete Query Lookup
app.get('/autocomplete', (req, res) => {
  var query = req.query["query"]
  network.getWikiPrefixMatches(query, (results) => res.send(results))
});

app.listen(port, () => console.log(`WikiClick listening on port ${port}!`))
