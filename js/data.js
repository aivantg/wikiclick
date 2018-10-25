var mysql = require('mysql')
var connection = mysql.createConnection({
  host     :  process.env.DBURL,
  user     :  process.env.DBUSER,
  password :  process.env.SECRET,
  database : 'wikiworld',
  port     : 3306
});
//'wikiworld-0.cwlhu4azzdsr.us-west-1.rds.amazonaws.com',


connection.connect()
console.log("Connected to remote database")

function cleanseID(id) {
  return id.replace('_', ' ');
}

function buildQuery(show=['src.title', 'count', 'dest.title'], dest='', src='', limit=10, month='', order='DESC'){
  var query = 'SELECT ' + show.collect(', ') + ' ';
  query += 'FROM page as src, page as dest, request '
  query += 'WHERE dest.id = destID AND src.id = srcID AND'
  conditions = [];
  if dest {
    conditions.push('dest.title = "' + dest + '"')
  }
  if src {
    conditions.push('src.title = "' + src + '"')
  }
  if month {
    conditions.push('request.month = "' + month + '"')
  }
  query += conditions.collect(' AND ') + ' '
  if !month {
    query += "GROUP BY srcID, destID "
  }
  query += "ORDER BY count " + order
  query += "LIMIT " + limit
  return query;
}

function executeQuery(query, callback) {
  connection.query(query, function(error,rows, fields) {
    if error {
      console.log("Error querying the database!");
      console.log(err);
      callback([])
    } else {
      callback(rows)
    }
  });
}

exports.getTopClicksToID = function(id, callback, limit=10, month='') {
  let query = buildQuery(show=['src.title', 'count'], dest=id, limit=limit, month=month)
  executeQuery(query, callback)
}

exports.getTopClicksFromID = function(id, callback, limit=10, month='') {
  let query = buildQuery(show=['dest.title', 'count'], src=id, limit=limit, month=month)
  executeQuery(query, callback)
}

exports.shutdown = function() {
  connection.close()
}
