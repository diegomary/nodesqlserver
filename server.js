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
                    for (let id of oId) {
                        let documents = rs.recordset.filter(function (doc) {
                            return (doc.OrderID === id.OrderID);
                        });

                        id.orderdetails = {};
                        id.orderdetails.OrderID = documents[0].OrderID;
                        id.orderdetails.OrderDate = documents[0].OrderDate;
                        id.orderdetails.ShipCity = documents[0].ShipCity;                        

                        id.orderdetails.products = [];
                        for (let dc of documents) {
                            delete dc.OrderID;delete dc.OrderDate;delete dc.ShipCity;
                            id.orderdetails.products.push(dc);
                        }

                        delete id.OrderID;
                    }                    
                    res.send(oId);                    
                    sql.close();
                })           
        })
    })
  
});


app.listen(3000, () => {
    console.log(`Application worker ${process.pid} started...`);
});











   

   

    // connect to your database
   

   