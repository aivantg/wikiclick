var mysql = require('mysql')
var connection = mysql.createConnection({
  host     :  process.env.DB_HOST,
  user     :  process.env.DB_USER,
  password :  process.env.DB_PASS,
  database : 'wikiworld',
  port     : 3306
});
//,


connection.connect()
console.log("Connected to remote database")

function cleanseID(id) {
  return id.split('_').join(' ');
}

function createURL(id) {
  return "/detail?id=" + id + "&name=" + cleanseID(id)
}

function numberWithCommas(x){
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function buildQuery(show=['src.title', 'count', 'dest.title'], type='link', dest='', src='', limit=10, month='', order='DESC'){
  var query = 'SELECT ' + show.join(', ') + ' ';
  query += 'FROM page as src, page as dest, request '
  query += 'WHERE type = "' + type + '" AND dest.id = destID AND src.id = srcID AND '
  conditions = [];
  if(dest != '') {
    conditions.push('dest.title = "' + dest + '"')
  }
  if(src != '') {
    conditions.push('src.title = "' + src + '"')
  }
  if(month != '') {
    conditions.push('request.month = "' + month + '"')
  }
  query += conditions.join(' AND ') + ' '
  if(month == '') {
    query += "GROUP BY srcID, destID "
  }
  query += "ORDER BY count " + order + ' '
  query += "LIMIT " + limit
  // console.log("Built Query: " + query)
  return query;
}

function executeQuery(query, callback) {
  connection.query(query, function(error,rows, fields) {
    if(error){
      console.log("Error querying the database!");
      console.log(error);
      callback([])
    } else {
      callback(rows.map((row) => {
        return { title: cleanseID(row.title), count: numberWithCommas(row.count), url: createURL(row.title)}
      }));
    }
  });
}


exports.getTopClicksToID = function(id, callback, limit=10, month='') {
  let query = buildQuery(show=['src.title', 'count'], type='link', dest=id, src='', limit=limit, month=month)
  executeQuery(query, callback)
}

exports.getTopClicksFromID = function(id, callback, limit=10, month='') {
  let query = buildQuery(show=['dest.title', 'count'], type='link', dest='', src=id, limit=limit, month=month)
  executeQuery(query, callback)
}

exports.getSearchHits = function(id, callback) {
  let query = buildQuery(show=['dest.title', 'sum(count) AS count'], type='external', dest=id, src='other-search', limit=10, month='');
  executeQuery(query, callback);
}

exports.getTopMonth = function(id, callback) {
  let query = 'SELECT month, count FROM page AS src, page AS dest, request WHERE destID = dest.id AND srcID = src.id AND dest.title="' + id + '" AND src.title="other-search" ORDER BY count DESC'
  connection.query(query, function(error,rows, fields) {
    if(error){
      console.log("Error querying the database!");
      console.log(error);
      callback([])
    } else {
      callback(rows.map((row) => {
        return { month: row.month, count: numberWithCommas(row.count) }
      }));
    }
  });
}

exports.trackVisit = function(id) {
  let query = 'INSERT INTO history (page_title, visitDate) VALUES ("' + id +'", NOW())'
  connection.query(query, function(error, rows, fields) {
    if(error) {
      console.log("Error tracking visit");
      console.log(error);
    }
  });
}

exports.shutdown = function() {
  connection.close()
}
