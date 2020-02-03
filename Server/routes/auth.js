const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require("../Models/user")
const Credential = require("../Models/credential")
const validate = require("validate.js");


//Get Data for sign up
router.post("/signUp", async (req , res ) => {
    await bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.pwd, salt, async (err, hash) => {
            if (err) return res.json({err})

            try{
                const user = new User({
                    email : req.body.email,
                    name : req.body.name
                });
                const credential = new Credential({
                    email : req.body.email,
                    pwd : hash
                })

                const savedUser = await user.save();
                const savedCredential = await credential.save();
                res.json(savedCredential);
            }catch(err){
                if (err.code == 11000){
                    res.json({"message" : "Email is already registered!",errCode : "SU-001"})
                }
                res.json({err : err.message , errCode : "SU-002"}) 
            }
        })
    })


})

router.post("/deviceSignUp", async (req , res ) => {
    const {email,name} = req.body
    await bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.pwd, salt, async (err, hash) => {
            if (err) return res.json({err})
            const user =  new User({email,name})
            const credential = new  Credential({email,pwd:hash,role:"device"})
            const savedUser = await user.save()
            const savedCredential = await credential.save()
            res.json(savedCredential)
        })
    })
})

//Login
router.post("/login", async (req , res ) => {
    const email = req.body.email
    const password = req.body.pwd
    console.log("New Login from : "+email)
    // console.log(email + " " + pwd)

    const constraint = {
        email : {
            presence: true,
            email : true
        },
        password : {
            presence : true,
            length : {
                minimum : 4,
                maximum : 16,
                tooShort : "is too short",
                tooLong : "is too long"
            }
        }
    }

    const validateRes = validate({email,password},constraint)

    if (validateRes != undefined){
        return res.json({message:"Validation error"})
    }

    const existUser = await Credential.findOne({email:email})
    //Check if the user is exist
    if (!existUser) return res.json({"message" : "Email does not exist"})
    //Get User to get the username later
    const user = await User.findOne({email})
    //Validate encrypted pass
    const validPass = bcrypt.compare(password , existUser.pwd , (err, isMatch) => {
        if (err) return res.json({err})
        if (isMatch){ // if the pwd matches 
            // Sign the token
            const token = jwt.sign({email : email, name: user.name, role:existUser.role}, process.env.TOKEN_SECRET)
            //Put token in the header
            return res.header("auth-token",token).json({"message" : "Login Success", "token" : token})
        }else{ // if the pwd is not match
            return res.json({"message" : "Password entered is incorrect"})
        }
    })
})

module.exports = router