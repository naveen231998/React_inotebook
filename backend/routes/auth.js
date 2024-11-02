const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = "Hello_Sir"
// Strong password regex
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Creating a user using: Post "/api/auth/createuser" no log in required
router.post('/createuser', [
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long.'),
    body('email').isEmail().withMessage('Email must be a valid email address.'),
    body('password').matches(strongPasswordRegex).withMessage('Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.'),
], async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    console.log(errors.array());
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET)
        console.log(authtoken)
        // res.status(201).json(user);
        res.status(201).json({authtoken});
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({ errors: [{ msg: 'Email already exists.' }] });
        }
        // Handle other possible errors
        console.error(error);
        res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
});

// Creating a user using: Post "/api/auth/login" login required
router.post('/login', [
    body('email').isEmail().withMessage('Email must be a valid email address.'),
    body('password').exists().withMessage('Password Can not be Empty')
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;

    try {
        let user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({error: "Please enter correct Credential"})
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "Please enter correct Credential"})
        }
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET)
        console.log(authtoken)
        // res.status(201).json(user);
        res.status(201).json({authtoken});

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
});

// Creating a user using: Post "/api/auth/login" login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userid = req.user.id; // Use const here
        const user = await User.findById(userid).select("-password"); 
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user); // Respond with the user data

    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }


});




module.exports = router;
