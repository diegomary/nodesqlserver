NODE SQLSERVER -> MONGO

This repository is a study on communication between Sql Server (EXPRESS) and Mongodb.
Not only the drivers for both database engines are used to demonstrate connectivity; also the transformation from related data Join style to the document style in Mongodb.
It is important to become accustumed to the difference between SQL and no SQL database in a way to see how they can work together to 
supply data modeling for single page applications.

The limitations of the Relational model when we are in need to visualize data are rather marked compared to the flexibility of No Sql databases.

Coverting relational data to document style data is also a way to solve problem of cuncurrency in mongodb during transations. Infact, MongoDB has a very neat approach to cuncurrency when documents are updated by different applications. The relational data stored in subdocuments are a solution to cuncurrency.





