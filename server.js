'use strict';

let express = require('express');
let app = express();
let sql = require("mssql");
// config for your database
var config = {
    user: 'sa',
    password: 'diegomary',
    server: 'localhost\\SQLEXPRESS',
    database: 'northwind'
};

app.get('/', function (req, res, next) {

    sql.connect(config,  (err) => {

        if (err) console.log(err);
        let request = new sql.Request();   
        request.query(`select distinct Orders.OrderID from Orders`, (err, rsorders) => {
                if (err) console.log(err)

                request.query(`select Orders.OrderID, Orders.OrderDate, orders.ShipCity,[Order Details].Quantity,
                                [Order Details].ProductID,products.ProductName, Products.UnitPrice from
                                orders inner join  [Order Details] on orders.orderid=[Order Details].orderid
                                inner join Products on [Order Details].ProductID = Products.ProductID;`, (err, rs) => {
                    if (err) console.log(err);
                    let oId = rsorders.recordset;
                    //let order = {};
                    for (let id of oId) {

                        let documents = rs.recordset.filter(function (doc) {
                            return (doc.OrderID === id.OrderID);
                        });

                        id.orderdetails = documents;
                       // console.log(id.OrderID);                   

                    }
                    //console.log(rsorders);
                    res.send(oId);                    
                    sql.close();
                } )              

           
        })
    })
  
});


app.listen(3000, () => {
    console.log(`Application worker ${process.pid} started...`);
});











   

   

    // connect to your database
   

   