const express = require('express');
const app = express();
const morgan = require('morgan'); //this library is middle ware library 
const mongoose = require('mongoose');
require('dotenv/config');

//Middle Ware
app.use(express.json());
app.use(morgan('tiny'));

const productSchema = mongoose.Schema({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true,
    }
})

const Product = mongoose.model('Product',productSchema);

const api = process.env.API_URL;

// app.get(api+'/products', (req,res)=>{
app.get(`${api}/products`, (req,res)=>{
    const product = {
        id:1,
        name:'hair dresser',
        image:'some_url',
    }
    res.send(product);
})

app.post(`${api}/products`, (req,res)=>{
    const product = new Product({
        name:req.body.name,
        image: req.body.image,
        countInStock:req.body.countInStock,
    })
    
    product.save().then((createdProduct=> {  //this will save the product
        res.status(201).json(createdProduct)
    })).catch((err)=>{
        res.status(500).json({
            error: err,
            success: false,
        })
    })
}) 

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