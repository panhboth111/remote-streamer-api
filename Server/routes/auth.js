const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require("../Models/user")
const Credential = require("../Models/credential")
const validate = require("validate.js")
const verify = require("./verifyToken")


//Get Data for sign up
router.post("/signUp", async (req , res ) => {
    email = req.body.email.toLowerCase()
    name = req.body.name
    password = req.body.pwd
    role = ""

    let reg = /[a-z,.]{4,}\d{2,}@kit.edu.kh/ig
    if ( reg.test(email) ){
        role = "Student"
    }else{
        let newReg = /[a-z,.]{4,}@kit.edu.kh/ig
        if ( newReg.test(email) ){
            role = "Lecturer"
        }else{
            return res.json({"message" : "Only KIT email is allowed",errCode : "SU-001"})
        }
    }
        
    await bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) return res.json({err})
            try{
                const user = new User({
                    email : email,
                    name : name
                });
                const credential = new Credential({
                    email : email,
                    pwd : hash,
                    role
                })

                const savedUser = await user.save();
                const savedCredential = await credential.save();
                res.json(savedCredential);
            }catch(err){
                if (err.code == 11000){
                    return res.json({"message" : "Email is already registered!",errCode : "SU-002"})
                }
                res.json({err : err.message , errCode : "SU-003"}) 
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

//change password
router.post("/changePassword", verify , async (req , res ) =>  {
    email = req.user.email
    password = req.body.pwd
    newPassword = req.body.newPwd

    if (password == newPassword) {
        return res.json({"message" : "New password can't be the same to the previous password!", errCode : "CP-001"})
    }

    const constraint = {
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

    const validateRes = validate({password : password, password : newPassword},constraint)

    if (validateRes != undefined) {
        return res.json(validateRes)
    }

    const existUser = await Credential.findOne({email:email})

    bcrypt.compare(password , existUser.pwd , async (err, isMatch) => {
        if (err) return res.json({err})
        if (isMatch){ // if the pwd matches 
            // Generate new hash and pass it into database
            await bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPassword, salt, async (err, hash) => {
                    if (err) return res.json({err})
                    try{
                        const result = await Credential.updateOne({email:email},{pwd:hash});
                        if (result.n >= 1){
                            res.json({message : "Password changed as successfully!"})
                        }else{
                            res.json({message : "Problem Occured during the process of changing password!", errCode : "CP-003"})
                        }  
                    }catch(err){
                        res.json({err : err.message , errCode : "CP-004"}) 
                    }
                })
            })
        }else{ // if the pwd is not match
            res.json({message : "Incorrect Password!", errCode : "CP-002"})
        }
    })

})

module.exports = router