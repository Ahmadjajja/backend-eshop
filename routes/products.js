const {Product} = require('../models/product');
const express = require('express');  //for routing function we are using express library here
const router = express.Router();  



// `/` => this route uses for connection of backend with frontend

router.get(`/`, async (req, res) =>{
    const productList = await Product.find().select('name image -_id');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send(productList);
})

router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id);

    if(!product) {
        res.status(500).json({success: false})
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send(product);
})

router.post(`/`,async (req, res) =>{
    const category =await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')


    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        runReviews: req.body.runReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save()

    if(!product)
    return res.status(500).send('The product cannot be created')

    res.send(product);
})

module.exports =router;