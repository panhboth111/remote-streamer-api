const axios = require('axios')
const express = require('express')
const app = express()
const router = express.Router()
const Device = require('../Models/device')
const User = require('../Models/user')
const Credential = require('../Models/credential')
const Stream = require('../Models/streaming')
const uID = require('../JS/UniqueCode')
const deviceManagement = (io) => {
    io.on('connection',async (device)=>{
        console.log(`device ${device.id} connected`)
        device.on('device_info',async (device_info)=>{
           console.log(device_info)
           //check if this is a new device. If it has the following information in the database it is not.
           const {device_name,device_id,device_streaming,camera_plugged} = device_info
           const _Device = await Device.findOne({deviceId:device_id})
           const _Credential = await Credential.findOne({email:`${device_id}@device.com`})
           const _User = await User.findOne({email:`${device_id}@device.com`})
           if(_Device && _Credential && _User){
               console.log("old")
               if(device_streaming !=='none'){
                   const _us = await Stream.findOne({currentStream:device_streaming})
                   if(_us){
                       const _ud = await User.findOne({deviceId:device_id})
                       io.to(device.id).emit('start_casting',{email:_ud.email,password:"123456",device_streaming})
                   }
               }
               await Device.updateOne({deviceId:device_id},{deviceName:device_name,deviceId:device_id,socketId:device.id,streaming:device_streaming,cameraPlugged:camera_plugged,online:true})
           }//later
           else{
               console.log("new")
               try {
                const deviceName = `device-${uID(4)}`
                const deviceId = `${uID(6)}`
                await new Device({deviceName,deviceId,socketId:device.id,streaming:device_streaming,cameraPlugged:camera_plugged,online:true}).save()
                await axios.post('http://localhost:3001/auth/deviceSignUp',{email:`${deviceId}@device.com`,name:deviceName,pwd:"123456"})
                device.emit('update_device_info',{deviceName,deviceId})
               } catch (error) {
                   if(error.code == 11000){
                        const deviceName = `device-${uID(4)}`
                        const deviceId = `${uID(6)}`
                        await new Device({deviceName,deviceId,socketId:device.id,streaming:device_streaming,cameraPlugged:camera_plugged,online:true}).save()
                        await axios.post('http://localhost:3001/auth/deviceSignUp',{email:`${deviceId}@device.com`,name:deviceName,pwd:"123456"})
                        device.emit('update_device_info',{deviceName,deviceId})

                   }
               }
           }
           io.emit('info',await Device.find())
        })

        io.emit('info',await Device.find()) 
        //change the device's online status to false when it disconnects
        device.on('disconnect',async()=>{
            await Device.updateOne({socketId:device.id},{online:false})
            io.emit('info',await Device.find()) 
        })
        //update the following information into the database when changes such as device start/stop stream and camera plug/unplug occur
        device.on('change_in_device',async(device_info)=>{
            const {device_streaming,camera_plugged} = device_info
            await Device.updateOne({socketId:device.id},{streaming:device_streaming,cameraPlugged:camera_plugged})
            io.emit('info',await Device.find())
            console.log("changed") 
        })
   
    })
    


    //get routes
    router.get('/',async(req,res)=> res.send(await Device.find())) //get a list of all devices



    //put routes
    router.put('/changeName',async(req,res)=>{
        try{
            const {deviceId,deviceName} = req.body
            const socket = await Device.findOne({deviceId})
            await Device.updateOne({deviceId},{deviceName})
            io.to(socket.socketId).emit('change_name',deviceName)
            io.emit('info',await Device.find())
            res.send(socket.socketId)
        }catch(err){
            res.send({msg:err})
        }
    })

    //post routes
    router.post('/reboot',async (req,res)=> {
        try{
            const {deviceId} = req.body
            const _D = await Device.findOne({deviceId})
            io.to(_D.socketId).emit('reboot','')
        }catch(err){
            res.send(err)
        }

    })
    router.post('/startStreaming',async (req,res)=>{
        try{
            const {deviceId,deviceIds,userEmail,streamTitle,description} = req.body
            if(deviceId && deviceIds && userEmail && streamTitle && description){
                const _d = await Device.findOne({deviceId})
                const _u = await User.findOne({email:userEmail})
                if(_d && _u) io.to(_d.socketId).emit('start_streaming',{email:`${_d.deviceId}@device.com`,password:"123456",streamTitle,description,streamBy:userEmail,deviceIds})
            }
        }catch(err){
            res.send(err)
        }
    })
    router.post('/redirect', async (req,res)=>{
        const {streamBy,streamCode} = req.body
        setTimeout(()=>{
            io.emit('redirect',{streamBy,streamCode})
        },10000)
        res.send("done")
    })

    router.post('/startCasting',async (req,res)=>{
        try {
            console.log("cast")
            const {deviceIds,streamTitle,streamBy} = req.body
            const _S = await Stream.findOne({owner:streamBy})
            console.log(streamBy)
            console.log("title"+_S.streamTitle)
            //io.emit('redirect',{streamBy,redirect:_S.streamCode})
            console.log("hi")
            deviceIds.map(async id => {
                const _d2 = await Device.findOne({deviceId:id})
                io.to(_d2.socketId).emit('start_casting',{email:`${_d2.deviceId}@device.com`,password:"123456",streamTitle})
           }) 
        } catch (error) {
            
        }
    })


    router.post('/stopStreaming',async (req,res)=>{
        console.log("hellooooooo stoppppppppp")
        try {
            const {ownerName} = req.body
            const _U = await User.findOne({name:ownerName}).catch(err => console.log(err))
            const _S = await Stream.findOne({streamCode:_U.currentStream}).catch(err => console.log(err))
            const Devices = await Device.find({streaming:_S.streamTitle}).catch(err => console.log(err))
            console.log(Devices)
            Devices.map(d => {
                console.log(d.socketId)
                io.to(d.socketId).emit('stop_streaming','')
            })
        } catch (error) {
            
        }
    })
}



module.exports.deviceManagement = deviceManagement
module.exports.deviceRoute = router