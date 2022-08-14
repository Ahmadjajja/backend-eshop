const {Product} = require('../models/product');
const {Category} = require('../models/category')
const express = require('express');  //for routing function we are using express library here
const mongoose = require('mongoose');
const router = express.Router();
// const mongoose = require('mongoose')


// `/` => this route uses for connection of backend with frontend

router.get(`/`, async (req, res) =>{
    
    //localhost:3000/api/v1/products?categories=2342342,234234
    let filter = {};
    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    } 

    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send(productList);
})

router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false})
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send(product);
})

router.put(`/:id`, async (req, res) =>{
    const category = await Category.findById(req.body.category);    //Here may be error
    if(!category) return res.status(400).send('Invalid Category');


    const product = await Product.findByIdAndUpdate(
        req.params.id,
          {
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
        },{ new: true }
        )

    if(!product) {
        res.status(500).json('The product cannot be updated')
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send(product);
})

router.post(`/`,async (req, res) =>{
    const category =await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')


    let product = new Product({
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


router.delete(`/:id`, async (req, res) =>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json('Invalid Product Id')
    }

    Product.findByIdAndRemove(req.params.id).then(product => {
        if(product) {
            return res.status(200).json({success: true, message: 'the product is deleted'})
        } else {
            return res.status(404).json({success: false, message: 'the product not found'})  
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

router.get(`/get/count`, async (req, res) =>{
    let count;

    let productCount = await Product.countDocuments({count: count});
    // await productCount.clone();

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send({productCount: productCount});
})

router.get(`/get/featured/:count`, async (req, res) =>{
    let count = req.params.count? req.params.count: 0;
    // let count;
    let productFeatured = await Product.find({isFeatured: true}).limit(Number(count));
    // await productCount.clone();

    if(!productFeatured) {
        res.status(500).json({success: false})
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send(productFeatured);
})

module.exports =router;