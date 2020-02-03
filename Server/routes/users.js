const express = require('express')
const app = express()
const axios = require('axios')
const User = require("../Models/user")
const _Class = require("../Models/class")
const router = express.Router();
const uID = require("../JS/UniqueCode")
const verify = require("./verifyToken")
const Streaming = require('../Models/streaming')

//Routes
router.get("/", async (req , res) => {
    try{
        const user = await User.find();
        res.json(user)
    }catch(err){
        res.json({
            message : "Error Occured : " + err
        })       
    }
})

//Get all classes that student participated
router.get("/class", verify , async (req , res) => {
    try{
        const user = await User.findOne({email : req.user.email});
        const classCodes = user.classParticipated;
        const classOwned = user.classOwnerShip;
        var classParticipated = []
        var classOwnerShip = []
        // Loop through class code and retrieve each class's data from database with the help of class code
        for (i = 0; i < classCodes.length ; i++){
            var nClass = await _Class.findOne({code : classCodes[i]})
            //Seperate classOwned and ClassJoined
            if (classOwned.includes(classCodes[i])){
                classOwnerShip.push(nClass) 
            }else{
                classParticipated.push(nClass)
            }
        }
        console.log({classOwnerShip , classParticipated})
        res.json({classOwnerShip , classParticipated})
        
    }catch(err){
        res.json({err})       
    }
})

//Get user Info
router.get("/user", verify , async (req, res) => {
    const email = req.user.email
    const user = await User.findOne({email})
    const {name,isStreaming} = user
    const _user = {
        email,
        name,
        isStreaming,
        role:req.user.role
    }
    res.json(_user)
})

// Start stream
router.post("/startStream", verify, async (req, res) => {
    console.log("hello")
    const owner = req.user.email
    const ownerName = req.user.name
    const {streamTitle,description,isPrivate,password} = req.body
    try{
        var streamCode = null
        var isNotUnique = null

    //     //Check if the class is belong to the user
    //     const ownClass = await _Class.findOne({code, owner})
    //     if (!ownClass){ //If class is not belong to user
    //        return res.json({"message" : "You have no rights to start streaming!"})
    //     }

        // Check if stream code is available 
        do{
            streamCode = uID(12)
            isNotUnique = await Streaming.findOne({streamCode})
        }while(isNotUnique)

        const newStream = new Streaming({
            streamCode,
            streamTitle,
            description,
            isPrivate,
            password,
            owner,
            ownerName
        })
        const savedStream = await newStream.save()
        await User.updateOne({email:owner},{isStreaming : true})
        // await axios.post('http://10.10.15.11:4000/createRoom',{roomName:streamTitle,roomId:streamCode}).catch(er => console.log(er))
        res.json({streamCode : savedStream.streamCode,streamTitle : savedStream.streamTitle, Description : savedStream.Description})
    }catch (err){
        console.log(err)
        res.json(err)
    }

})

router.post('/deviceStartStream',verify,async(req,res)=>{
    const deviceEmail = req.user.email
    const {streamTitle,description,isPrivate,password,streamBy} = req.body
    const _U = await User.findOne({email:streamBy})
    try{
        var streamCode = null
        var isNotUnique = null
        do{
            streamCode = uID(12)
            isNotUnique = await Streaming.findOne({streamCode})
        }while(isNotUnique)

        const newStream = new Streaming({
            streamCode,
            streamTitle,
            description,
            isPrivate,
            password,
            owner:streamBy,
            ownerName:_U.name,
            streamFrom:deviceEmail
        })
        const savedStream = await newStream.save()
        await User.updateOne({email:streamBy},{currentStream:streamCode})
        await User.updateOne({email:streamBy},{isStreaming : true})
        await axios.post('http://10.10.15.11:4000/createRoom',{roomName:streamTitle,roomId:streamCode}).catch(er => console.log(er))
        axios.post('http://10.10.15.11:3001/devices/redirect',{streamBy,streamCode}).catch((er)=> console.log(er))
        res.json({streamCode : savedStream.streamCode,streamTitle : savedStream.streamTitle, Description : savedStream.Description})


    }catch (err){
        console.log(err)
        res.json(err)
    }
})

// Join Stream
router.post("/joinStream", verify, async(req,res) => {
    const email = req.user.email
    const name = req.user.name
    const streamCode = req.body.streamCode
    const password = req.body.pwd
    const domain = 'meet.jit.si';
    
    try{
        //Get stream info
        const theStream = await Streaming.findOne({streamCode});
        // Check Stream status
        if (!theStream.isActive){
            res.json({message : "Stream is not currently available", errCode : "ST-001"})
        }
        // Check Stream privacy
        if (!theStream.isPrivate){
            if (!password.equals("") && password.equals(null)){
                if(!theStream.password.equals(password)){
                    res.json({message : "Incorrect password", errCode : "ST-002"})
                }
            }else{
                res.json({message : "Password is required", errCode : "ST-003"})
            }     
        }

        // Check ownership
        if ((theStream.owner === email && theStream.streamFrom == 'none') || (theStream.streamFrom === email)){ // Owner
            // For Streamer/Lecturer
            const interfaceConfigLecturer = {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'profile',  'recording',"shortcuts",
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help','info'
                ],
                SETTINGS_SECTIONS: ['devices', 'language', 'moderator'],
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                channelLastN: 1,
                VERTICAL_FILMSTRIP: true,
                SET_FILMSTRIP_ENABLED: false
                
            }
            const options = {
                roomName: streamCode,
                interfaceConfigOverwrite : interfaceConfigLecturer,
                userInfo : {
                email : email
                },
                channelLastN: 1,
            }
            if(theStream.streamFrom !== email) await User.updateOne({email},{isStreaming : true})
            res.json({options : options, domain : domain, role : "Lecturer", name : name, isStreaming : true})
        }else{ // Not-Owner
            // For Stream Participant - *Not Class Owner*
            const interfaceConfigStudent = {
                TOOLBAR_BUTTONS: [
                    'closedcaptions', 'fullscreen',
                     'settings', 'raisehand',
                ],
                SETTINGS_SECTIONS: ['language'],
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                VERTICAL_FILMSTRIP: false,
                SET_FILMSTRIP_ENABLED: false
                
                // filmStripOnly: true
            }
            const optionsStudents = {
                roomName: streamCode,
                interfaceConfigOverwrite : interfaceConfigStudent,
                userInfo : {
                email : email
                },
                channelLastN: 1,
        };
            // Send Back Data Lah
            res.json({options : optionsStudents, domain : domain, role : "Student", name : name})
        }
        
    }catch(err){
        res.json({err})
    }

})

// Stop stream
router.get("/stopStream", verify, async (req, res) => {
    const owner = req.user.email
    const _S = await Streaming.findOne({owner})
    try{
        // Find the stream and set the active state to false
        const result = await Streaming.updateOne({ owner , isActive : true },{ isActive : false })
        if (result.n >= 1){
            // Set isStreaming state of User to false
            const result2 = await User.updateOne({email:owner},{isStreaming : false})
            if (result2.n >= 1){
                res.json({message : "Stop your current stream as successfully!", status : true})
            }else{
                res.json({message : "Problem Occured during stop streaming process", status : false})
            }           
        }else{
            res.json({message : "Problem Occured during stop streaming process", status : false})
        }

    }catch(err){
        res.json(err)
    }
    //await axios.post('http://10.10.15.11:4000/deleteRoom',{roomId:_S.streamCode}).catch(err => console.log(err))
})

// Get currently stream of all class participated
router.post("/getCurrentlyStream", verify , async (req, res) => {
        var limit = req.body.limit == null ? 0 : req.body.limit
        try{
            const currentlyStreamings = await Streaming.find({isActive : true}).limit(limit).sort({date: -1});
            res.json(currentlyStreamings)
        }catch(err){
            res.json(err)
        }

})

// Get Stream Detials
router.post("/getStreamDetail", verify , async (req, res) => {
    const streamCode = req.body.streamCode
    try{
        const theStream = await Streaming.findOne({streamCode})
        res.json({
            streamCode : theStream.streamCode,
            streamTitle : theStream.streamTitle,
            description : theStream.description,
            ownerName : theStream.ownerName
        })
    }catch(err){
        res.json(err)
    }

})

//Get specific user (Obsolete)
router.get("/:postId", verify , async (req , res) => {
    try{
        // console.log(req.params.postId)
        const user = await User.findOne({email:req.params.postId});
        res.json(user)
    }catch(err){
        res.json({
            message : "Error Occured : " + err
        })
    }

})



module.exports = router;