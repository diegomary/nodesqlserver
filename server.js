'use strict';
let express = require('express');
let app = express();
let sqlconn = require("mssql");
// config for your database
var config = {
    user: 'sa',
    password: 'diegomary',
    server: 'localhost\\SQLEXPRESS',
    database: 'northwind'
};

function connect() {
    let customerCollection = [];
    return new Promise(function (resolve, reject) {
        sqlconn.connect(config, (err) => {
            if (err) reject(err);
            else {
                let request = new sqlconn.Request();
                request.query(`select Customers.CustomerID,Customers.ContactName, Orders.OrderID, Orders.OrderDate,
                [Order Details].ProductID ,[Order Details].Quantity,[Order Details].Discount,
                Products.ProductID, Products.ProductName, Products.UnitPrice, Categories.CategoryName,
                Categories.Description from Customers inner join Orders on 
                customers.CustomerID = orders.CustomerID inner join
                [Order Details] on orders.OrderID = [Order Details].OrderID inner join Products on
                [Order Details].ProductID = Products.ProductID join  Categories 
                on Products.CategoryID = Categories.CategoryID  order by Customers.CustomerID,
                Orders.OrderID;`, (err, customers) => {
                    
                    // Getting the values of customer IDs
                    let cId = new Set();
                    for (let customer of customers.recordset) {
                        cId.add(customer.CustomerID);
                    };
                    let arrayCustIds = [...cId];
                    for (let id of arrayCustIds) {

                        let documents = customers.recordset.filter(function (doc) {
                            return (doc.CustomerID === id);
                        });
                        
                        let documentCustomer = {};
                        documentCustomer.CustomerID = id;
                        documentCustomer.ContactName = documents[0].ContactName;

                        // work on documents now
                        let orderCollection = [];                       
                        let dId = new Set();
                        for (let doc of documents) {
                            dId.add(doc.OrderID);
                        };
                        let arrayOrdIds = [...dId];
                        for (let oid of arrayOrdIds) {
                            let ord = documents.filter(function (doc) {
                                return (doc.OrderID === oid);
                            });
                            orderCollection.push(ord);
                        }
                        documentCustomer.orders = orderCollection;
                        customerCollection.push(documentCustomer);
                        break;
                    }

                    // Use the spread operator to transform a set into an Array.
                    resolve(customerCollection);
                  })
            }

        })
    });
}



app.get('/', function (req, res, next) {
       
    connect()
        .then(
        function (data) {
            res.send(data); sqlconn.close();}
        ).then(function () { console.log('Finished') })
        .catch(function (error) {res.send(error) });

});


app.listen(3000, () => {
        console.log(`Application worker ${process.pid} started...`);
    });
