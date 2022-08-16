const express = require("express"); //famous library to host server from node js
const app = express();
const morgan = require("morgan"); //this library is middle ware library 
const mongoose = require("mongoose");
const cors = require("cors"); //confusion 1
require("dotenv/config");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler')


app.use(cors()); //confusion
app.options("*", cors()); //some type of http request

//middleware
app.use(express.json());
app.use(morgan("tiny"));  //confusion 2   what does this line means 
app.use(authJwt());   // now our server is secured on base of token
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));  //dirname returns root path of application 
app.use(errorHandler);
 
//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//productsRoutes => contains CRUD operation of all products
//${api}/products => this is the route on web for accessing this api




//Database CONNECTION
mongoose
    .connect(process.env.CONNECTION_STRING)
    .then(() => {
        console.log("Database Connection is ready...");
    })
    .catch((err) => {
        console.log(err);
    });

//Server
app.listen(3000, () => {
    console.log("server is running http://localhost:3000");
});