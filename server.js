'use strict';

let express = require('express');
let app = express();
let sql = require("mssql");
// config for your database
var config = {
    user: 'sa',
    password: 'diegomary',
    server: 'localhost\\SQLEXPRESS',
    database: 'netcore'
};

app.get('/', function (req, res, next) {

    sql.connect(config,  (err) => {

        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query('select * from candidates', (err, recordset) => {

            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset);
            sql.close();
        })
    })
  
});


app.listen(3000, () => {
    console.log(`Application worker ${process.pid} started...`);
});











   

   

    // connect to your database
   

   