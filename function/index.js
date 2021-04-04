var mysql = require('mysql');

exports.handler = async function(event, context) {
  const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
  });

  connection.connect();

  var getItems = function (query) {
    return new Promise(function (resolve, reject) {
        var sql = `SELECT * FROM recyclables where MATERIAL='${query}' ORDER BY ITEM`;
        connection.query(sql, [query], function (err, result) {
            if (!err) {
              resolve(result);
            } else {
              resolve({
                  status: "error",
                  message: "Error Getting Data",
                  debug: err
              });
            }
        });
    });
  };

  var endConnection = function () {
    return new Promise((resolve, reject) => {
        connection.end(error => error ? reject(error) : resolve());
    });
  }

  let results;
  let returnObj;
  try {
    results = await getItems(event.query);
    await endConnection();
    let itemNames = [];
    let itemDescriptions = [];
    let binTypes = [];
    let recyclables = [];
    let comments = [];

    for (let i = 0; i < results.length; i++) {
      itemNames.push(results[i].ITEM);
      itemDescriptions.push(results[i].DESCRIPTION);

      // binTypes.push(results[i].RECYCLING_POINT);
      recyclables.push(results[i].RECYCLABLE);
      comments.push(results[i].COMMENTS);
      if (results[i].RECYCLING_POINT == null) {
        binTypes.push([]);
      } else {
        binTypes.push(results[i].RECYCLING_POINT.split(","));
      }
    }
    returnObj =  {'itemNames': itemNames, 'itemDescriptions': itemDescriptions, 'binTypes': binTypes, 'recyclables': recyclables, 'comments': comments}
  } catch (e) {
    console.log(e);
  }

  const response = {
    statusCode: 200,
    body: returnObj
  };
  return response;
};