const express = require('express');
const app = express();
const morgan = require('morgan'); //this library is middle ware library 
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

app.use(cors());
app.options('*', cors())  //some type of http request


const api = process.env.API_URL;
const productRouter = require('./routers/products');


//Middle Ware
app.use(express.json());
app.use(morgan('tiny'));

//Routers
app.use(`${api}/products`, productRouter)






const Product = require('./models/product')



mongoose.connect(process.env.CONNECTION_STRING )
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=>{
    console.log(err); 
})
app.listen(3000, ()=>{

    console.log("server is running at http://localhost:3000")
})