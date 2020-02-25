const User = require("../models/user");
const Credential = require("../models/credential");
const History = require("../models/history");
const Streaming = require("../models/streaming");
const uID = require("../utilities/UniqueCode");
const axios = require("axios");

class StreamService {
  async startStream(
    { owner, ownerName },
    { streamTitle, description, isPrivate, password }
  ) {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ email: owner });
      if (user.isStreaming)
        return resolve({
          message: "Stream is already initialized",
          errCode: "SS-001"
        });
      else await User.updateOne({ email: owner }, { isStreaming: true });
      try {
        var streamCode = null;
        var isNotUnique = null;
        do {
          streamCode = uID(12);
          isNotUnique = await Streaming.findOne({ streamCode });
        } while (isNotUnique);
        const newStream = new Streaming({
          streamCode,
          streamTitle,
          description,
          isPrivate,
          password,
          owner,
          ownerName
        });
        const savedStream = await newStream.save();
        await new History({
          action: "Started a stream",
          streamCode,
          streamTitle,
          email: owner
        }).save();
        await User.updateOne({ email: owner }, { isStreaming: true });
        await axios.post('http://10.10.12.76:4000/createRoom', { roomName: streamTitle, roomOwner: owner, roomId: streamCode }).catch(er => console.log(er))
        console.log("done");
        return resolve({
          streamCode: savedStream.streamCode,
          streamTitle: savedStream.streamTitle,
          Description: savedStream.Description
        });
      } catch (err) {
        console.log(err);
        return resolve(err);
      }
    });
  }
  async deviceStartStream(
    { deviceEmail, deviceName },
    { streamTitle, description, isPrivate, password, streamBy }
  ) {
    return new Promise(async (resolve, reject) => {
      const _U = await User.findOne({ email: streamBy });
      try {
        var streamCode = null;
        var isNotUnique = null;
        do {
          streamCode = uID(12);
          isNotUnique = await Streaming.findOne({ streamCode });
        } while (isNotUnique);
        await new History({
          action: "Started a stream",
          streamCode,
          streamTitle,
          email: streamBy
        }).save();
        const newStream = new Streaming({
          streamCode,
          streamTitle,
          description,
          isPrivate,
          streamFrom: deviceName,
          password,
          owner: streamBy,
          ownerName: _U.name,
          streamFrom: deviceEmail
        });
        const savedStream = await newStream.save();
        await User.updateOne(
          { email: streamBy },
          { currentStream: streamCode, isStreaming: true }
        );
        //await axios.post('http://10.10.15.11:4000/createRoom',{roomName:streamTitle,roomId:streamCode}).catch(er => console.log(er))
        axios
          .post("http://10.10.12.76:3000/redirect", { streamBy, streamCode })
          .catch(er => console.log(er));
        return resolve({
          streamCode: savedStream.streamCode,
          streamTitle: savedStream.streamTitle,
          Description: savedStream.Description
        });
      } catch (err) {
        resolve(err);
      }
    });
  }
  async joinStream({ email, name }, { streamCode, password }) {
    return new Promise(async (resolve, reject) => {
      const domain = "meet.jit.si";
      try {
        //Get stream info
        const theStream = await Streaming.findOne({ streamCode });
        await new History({
          action: "Joined a stream",
          streamCode,
          streamTitle: theStream.streamTitle,
          email
        }).save();
        // Check Stream status
        if (!theStream.isActive)
          return resolve({
            message: "Stream is not currently available",
            errCode: "ST-001"
          });
        // Check Stream privacy
        if (!theStream.isPrivate) {
          if (!password.equals("") && password.equals(null)) {
            if (!theStream.password.equals(password)) {
              return resolve({ message: "Incorrect password", errCode: "ST-002" });
            }
          } else {
            return resolve({
              message: "Password is required",
              errCode: "ST-003"
            });
          }
        }
        // Check ownership
        if (
          (theStream.owner === email &&
            theStream.streamFrom == "Author's cam") ||
          theStream.streamFrom === email
        ) {
          // Owner
          // For Streamer/Lecturer
          const interfaceConfigLecturer = {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "profile",
              "recording",
              "shortcuts",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "info"
            ],
            SETTINGS_SECTIONS: ["devices", "language", "moderator"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            channelLastN: 1,
            VERTICAL_FILMSTRIP: true,
            SET_FILMSTRIP_ENABLED: false
          };
          const options = {
            roomName: streamCode,
            interfaceConfigOverwrite: interfaceConfigLecturer,
            userInfo: {
              email: email
            },
            startVideoMuted : 0,
            startWithVideoMuted : true,
            startWithAudioMuted: true
          };
          if (theStream.streamFrom !== email)
            await User.updateOne({ email }, { isStreaming: true });
          return resolve({
            options: options,
            domain: domain,
            role: "Lecturer",
            name: name,
            isStreaming: true
          });
        } else {
          // Not-Owner
          // For Stream Participant - *Not Class Owner*
          const interfaceConfigStudent = {
            TOOLBAR_BUTTONS: [
              "closedcaptions",
              "fullscreen",
              "settings",
              "raisehand"
            ],
            SETTINGS_SECTIONS: ["language"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            VERTICAL_FILMSTRIP: false,
            SET_FILMSTRIP_ENABLED: false

            // filmStripOnly: true
          };
          const optionsStudents = {
            roomName: streamCode,
            interfaceConfigOverwrite: interfaceConfigStudent,
            userInfo: {
              email: email
            },
            startVideoMuted : 0,
            startWithVideoMuted : true,
            startWithAudioMuted: true
          };
          // Send Back Data Lah
          return resolve({
            options: optionsStudents,
            domain: domain,
            role: "Student",
            name: name
          });
        }
      } catch (err) {
        return resolve({ err });
      }
    });
  }
  async adminStopStream({ role }, { streamCode }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (role != "Admin") {
          return resolve({
            message:
              "You are not authorized to complete the following operation!",
            errCode: "ASS-001"
          });
        }
        // Find the stream
        const theStream = await Streaming.findOne({ streamCode });
        // If the stream is available
        if (theStream) {
          // Update the owner streaming status
          const result = await User.updateOne(
            { email: theStream.owner },
            { isStreaming: false }
          );
          // If update owner streaming status succeed
          if (result.n == 1) {
            // Deactivate the stream
            const result2 = await Streaming.updateOne(
              { streamCode },
              { isActive: false }
            );
            // If deactivation succeed
            if (result2.n == 1) {
              return resolve({ message: "Stop Stream as successfully!" });
            }
          } else {
            return resolve({
              message: "Error occured when trying to change User status!",
              errCode: "ASS-002"
            });
          }
        } else {
          return resolve({
            message: "No stream with " + streamCode + "was found",
            errCode: "ASS-003"
          });
        }
      } catch (error) {
        return resolve({
          message: "Error occured when stopping the stream",
          errCode: "ASS-004"
        });
      }
    });
  }

  async stopStream(owner) {
    return new Promise(async (resolve, reject) => {
      try {
        // Find the stream and set the active state to false
        const result = await Streaming.updateMany(
          { owner, isActive: true },
          { isActive: false }
        );
        if (result.n >= 1) {
          // Set isStreaming state of User to false
          const result2 = await User.updateOne(
            { email: owner },
            { isStreaming: false }
          );
          if (result2.n >= 1) {
            console.log("successful");
            return resolve({
              message: "Stop your current stream as successfully!",
              status: true
            });
          } else {
            console.log("error");
            return resolve({
              message: "Problem Occured during stop streaming process",
              status: false
            });
          }
        } else {
          return resolve({
            message: "Problem Occured during stop streaming process",
            status: false
          });
        }
      } catch (err) {
        return resolve(err);
      }
    });
  }
  async getCurrentStreams(limit, status) {
    return new Promise(async (resolve, reject) => {
      try {
        let currentlyStreamings;
        if (status == null) {
          currentlyStreamings = await Streaming.find()
            .limit(limit)
            .sort({ date: -1 });
        } else {
          currentlyStreamings = await Streaming.find({ isActive: status })
            .limit(limit)
            .sort({ date: -1 });
        }
        return resolve(currentlyStreamings);
      } catch (err) {
        return resolve(err);
      }
    });
  }
  async getStreamDetail({ streamCode }) {
    return new Promise(async (resolve, reject) => {
      try {
        const theStream = await Streaming.findOne({ streamCode });
        return resolve({
          streamCode: theStream.streamCode,
          streamTitle: theStream.streamTitle,
          description: theStream.description,
          ownerName: theStream.ownerName
        });
      } catch (err) {
        return resolve(err);
      }
    });
  }
  async editStream({ streamCode, streamTitle, description }, { role, email }) {
    return new Promise(async (resolve, reject) => {
      if (role != "Admin")
        return resolve({
          message: "You are not authorized for the following operation!",
          errCode: "CS-001"
        });
      {
        const result = await Streaming.updateOne(
          { streamCode },
          { streamTitle, description }
        );
        if (result.n >= 1)
          return resolve({ message: "Successfully update the stream's data!" });
        else
          return resolve({
            message:
              "An error occured during the process! Failed to update the stream's data!",
            errCode: "CS-002"
          });
      }
    });
  }
}
module.exports = StreamService;
