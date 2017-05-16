'use strict';
let express = require('express');
let app = express();
let sqlconn = require("mssql");
// Mongodb Credentials
let MongoClient = require('mongodb');
let mongoUrl = 'mongodb://booksadmin:dxxxxary@ds061371.mongolab.com:61371/dixxxxxy8x';
// SQL Server express credentials database remember to install Sqlexpress as default instance so you can use localhost
var config = {
    user: 'sa',
    password: 'password',
    server: 'localhost',
    database: 'northwind',
    port:1433
};

function connect() {
    let customerCollection = [];
    return new Promise(function (resolve, reject) {
        sqlconn.connect(config, (err) => {
            if (err) reject(err);
            else {
                let request = new sqlconn.Request();
                request.query(`select Customers.CustomerID,Customers.CompanyName,Customers.ContactName,
                Customers.ContactTitle,Orders.OrderID, Orders.OrderDate,
                [Order Details].ProductID ,[Order Details].Quantity,[Order Details].Discount,
                Products.ProductName, Products.UnitPrice, Categories.CategoryName,
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
                        documentCustomer.CompanyName = documents[0].CompanyName;
                        documentCustomer.ContactName = documents[0].ContactName;                       
                        documentCustomer.ContactTitle = documents[0].ContactTitle;

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
                            orderCollection.push({ OrderID: ord[0].OrderID, OrderDate: ord[0].OrderDate, Detail: ord });
                            ord.map(function (item) {
                                delete item.OrderDate;
                                delete item.CustomerID;
                                delete item.ContactName;
                                delete item.OrderID;
                                delete item.CompanyName;
                                delete item.ContactTitle;
                                return item;
                            });
                        }
                        documentCustomer.orders = orderCollection;
                        customerCollection.push(documentCustomer);                        
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
            MongoClient.connect(mongoUrl, function (err, db) {
                console.log(data);
                db.collection('northwind').drop();
                db.createCollection("northwind");      
                db.collection('northwind').insert(data);                

            });
            res.send('The Data have been moved to MongoDB database in NoSqlFormat');
            sqlconn.close();
        }
        ).then(function () { console.log('Finished') })
        .catch(function (error) {res.send(error) });

});


app.listen(3000, () => {
        console.log(`Application worker ${process.pid} started...`);
    });
