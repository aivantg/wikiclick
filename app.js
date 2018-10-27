require('dotenv').config()

const express = require('express')
const network = require('./js/network.js')
const data = require ('./js/data.js')


var path = require("path");


const app = express()
const port = process.env.PORT || 3000


app.get('/', (req, res) => res.sendFile(path.join(__dirname+'/index.html')));

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
  res.sendFile(path.join(__dirname + '/detail.html'))
})

// Autocomplete Query Lookup
app.get('/autocomplete', (req, res) => {
  var query = req.query["query"]
  network.getWikiPrefixMatches(query, (results) => res.send(results))
});

app.listen(port, () => console.log(`WikiClick listening on port ${port}!`))
