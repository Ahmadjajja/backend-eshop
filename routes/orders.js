const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const express = require('express');
// const mongoose = require("mongoose");
const router = express.Router();

//getting order list

router.get(`/`, async (req, res) => {
    console.log("get request is working")
    const orderList = await Order.find().populate("user", "name").sort({ 'dateOrdered': -1 }); //populate function will return the whole detail of users(this will return name coz 2nd parameter is name)
    //above sort method means that order them from newest to oldest 
    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList);
})
//getting single order 

router.get(`/:id`, async (req, res) => { //Conclusion: Population concept is very important with relational point of view
    console.log("get request is working")
    const order = await Order.findById(req.params.id)
        .populate("user", "name") //populate function will return the whole detail of users(this will return name coz 2nd parameter is name)
        //.populate("orderItems");//populate function will return the whole detail of orderItems in Array in from of object
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        }) //this will return product key from orderItems from id's. 
    //VERY IMPORTANT: above code contains all the information about order
    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order);
})

//creating order

router.post(`/`, async (req, res) => {
    console.log("post request is working")
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;
    console.log(orderItemsIdsResolved);

    //sending total price from frontend is not a good practice 
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))

    console.log(totalPrices)

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0); //reduce method will sum all values in array

    console.log(totalPrice);
    // in this way,we guaranted that the total price is coming only from our database, not from the frontend
    //Now our payment is secured from hackers


    let order = new Order({
        orderItems: orderItemsIdsResolved,  //we only need a array of Ids of orderItems
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order)
        return res.status(404).send('the order cannot be created!')

    res.status(200);
})

//updating order status

router.put(`/:id`, async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
        //Here it means i want to return new updated data
    )

    if (!order)
        return res.status(404).send('the order cannot be updated!')

    res.send(order);
})

//deleting order status

router.delete(`/:id`, async (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {  //very interesting logic used here
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)  //(orderItem) => means orderItem is id coz in database there are stored id's of orderItems.
            })
            return res.status(200).json({ success: true, message: 'the order is deleted' })
        } else {
            return res.status(404).json({ success: false, message: 'the order not found' })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

//Deleting Order is not enough, we still have the related order items in the database. Rewrite the "Delete Request" code to make it able to delete also the order items after success of deleting the order

//getting total sales in admin panel

router.get(`/get/totalsales`, async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }  //$sum is reserved word in mongoose
    ])

    if (!totalSales) {
        return res.status(400).send('The Order sales cannot be generated')
    }

    return res.send({ totalsales: totalSales.pop().totalsales })
})

//getting total no of products

router.get(`/get/count`, async (req, res) => {
    let count;  //this code is extra then tutor code but valid code

    let orderCount = await Order.countDocuments({ count: count });
    // await orderCount.clone();

    if (!orderCount) {
        res.status(500).json({ success: false })
    }
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send({
        orderCount: orderCount
    });
})

//getting order list for specific user

router.get(`/get/userorders/:userid`, async (req, res) => {
    console.log("get request is working")
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        }) //this will return product key from orderItems from id's. 
        .sort({ 'dateOrdered': -1 }); //populate function will return the whole detail of users(this will return name coz 2nd parameter is name)
    //above sort method means that order them from newest to oldest 
    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList);
})

module.exports = router;