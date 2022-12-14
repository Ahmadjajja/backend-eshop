const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// getting list of users
router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        return res.status(500).json({ success: false })
    }
    return res.send(userList);
})

//getting single user
router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        return res.status(500).json({ message: 'The user with the given ID was not found!' })
    }
    return res.status(200).send(user);
})

//creating user

router.post('/', async (req, res) => {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    return res.send(user);
})

//Update user

router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

// login
router.post(`/login`, async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found')
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin:user.isAdmin
            },
            secret,   //secret is uses here for generating token
            { expiresIn: '1d' }
        )
        return res.status(200).send({ user: user.email, token: token })
    } else {
        return res.status(400).send("password is wrong!");
    }
})

//register
router.post('/register', async (req, res) => {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    return res.send(user);
})

//delete user

router.delete(`/:id`, async (req, res) =>{
    User.findByIdAndRemove(req.params.id).then(user => {
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted'})
        } else {
            return res.status(404).json({success: false, message: 'the user not found'})  
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})


router.get(`/get/count`, async (req, res) =>{
    let count;
    // const userCount = await User.countDocuments((count) => count) //tutor code
    let userCount = await User.countDocuments({count: count});  //my code
    // await productCount.clone();

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    //if we not write this code, in case of error answer will be in html code instead of `success: false`
    res.send({
        userCount: userCount
    });
})



module.exports = router;