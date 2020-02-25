const User = require("../models/user");
const Credential = require("../models/credential");
const History = require("../models/history");
const bcrypt = require("bcrypt");
const validate = require("validate.js");
const jwt = require("jsonwebtoken");
const axios = require("axios");
class UserService {
  async allUsers(role, owner) {
    return new Promise((resolve, reject) => {
      const adminReg = /admin/i;
      if (!adminReg.test(role))
        reject({ message: "You are not authorized!", errCode: "AU-001" });
      User.find(
        { email: { $ne: owner }, role: { $ne: "Admin" } },
        { email: 1, name: 1, role: 1 }
      ).then(users => resolve(users));
    });
  }
  async user({ email }) {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ email });
      return resolve(user);
    });
  }
  async signUp({ email, name, pwd }) {
    return new Promise(async (resolve, reject) => {
      let reg = /[a-z,.]{4,}\d{0,4}@kit.edu.kh/gi;
      let Devreg = /device-[A-Z,a-z,0-9]{4}@device.com/gi;
      let role = "";
      if (reg.test(email)) role = "Student";
      else if (Devreg.test(email)) role = "Device";
      else return resolve({ message: "Only KIT email is allowed", errCode: "SU-001" });
      bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(pwd, salt, async (err, hash) => {
          if (err) reject(err);
          try {
            const credential = new Credential({
              email: email,
              pwd: hash
            });
            const user = new User({
              email: email,
              name: name,
              role: role
            });
            await user.save();
            await credential.save();
            return resolve({ message: "Account registered as successfully!" });
          } catch (err) {
            if (err.code == 11000)
              resolve({
                message: "Email is already registered!",
                errCode: "SU-002"
              });
            return resolve({ err: err.message, errCode: "SU-003" });
          }
        });
      });
    });
  }
  async signIn({ email, pwd }) {
    return new Promise(async (resolve, reject) => {
      const constraint = {
        email: {
          presence: true,
          email: true
        },
        password: {
          presence: true,
          length: {
            minimum: 4,
            maximum: 16,
            tooShort: "is too short",
            tooLong: "is too long"
          }
        }
      };
      const validateRes = validate({ email, pwd }, constraint);
      if (validateRes == undefined)
        return resolve({ message: "Invalid", success: false });
      const existUser = await Credential.findOne({ email: email });
      if (!existUser)
        return resolve({
          message: "Email does not match with any user",
          success: false,
          token: null
        });
      const user = await User.findOne({ email });
      bcrypt.compare(pwd, existUser.pwd, (err, isMatch) => {
        if (err) return resolve({ err });
        if (isMatch) {
          // if the pwd matches
          // Sign the token
          const token = jwt.sign(
            { email: email, name: user.name, role: user.role },
            process.env.TOKEN_SECRET
          );
          console.log("New Login from : " + email);
          //Put token in the header
          return resolve({ message: "Logged in successfully", success: true, token });
        } else {
          // if the pwd is not match
          //resolve({"message" : "Password entered is incorrect"})
          return resolve(
            resolve({
              message: "Incorrect password",
              success: false,
              token: null
            })
          );
        }
      });
    });
  }
  async changePassword(email, password, newPassword) {
    return new Promise(async (resolve, reject) => {
      if (password == newPassword)
        return resolve({
          message: "New password can't be the same to the previous password!",
          errCode: "CP-001"
        });
      const constraint = {
        password: {
          presence: true,
          length: {
            minimum: 4,
            maximum: 16,
            tooShort: "is too short",
            tooLong: "is too long"
          }
        }
      };
      const validateRes = validate(
        { password: password, password: newPassword },
        constraint
      );
      if (validateRes != undefined) return resolve(validateRes);
      const existUser = await Credential.findOne({ email: email });
      bcrypt.compare(password, existUser.pwd, async (err, isMatch) => {
        if (err) return resolve(err);
        if (isMatch) {
          // if the pwd matches
          // Generate new hash and pass it into database
          await bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, async (err, hash) => {
              if (err) return resolve({ err });
              try {
                const result = await Credential.updateOne(
                  { email: email },
                  { pwd: hash }
                );
                if (result.n >= 1) {
                  return resolve({ message: "Password changed as successfully!" });
                } else {
                  return resolve({
                    message:
                      "Problem Occured during the process of changing password!",
                    errCode: "CP-003"
                  });
                }
              } catch (err) {
                return resolve({ err: err.message, errCode: "CP-004" });
              }
            });
          });
        } else {
          // if the pwd is not match
          return resolve({ message: "Incorrect Password!", errCode: "CP-002" });
        }
      });
    });
  }
  async changeRole({ email, role }, { targetUser, targetRole }) {
    return new Promise(async (resolve, reject) => {
      console.log(`${email} ${role} ${targetRole} ${targetUser}`);
      const roleReg = /admin/i;
      if (roleReg.test(role)) {
        const update = await User.updateOne(
          { email: targetUser },
          { role: targetRole }
        );
        if (update.n > 0)
          return resolve({
            message:
              "Success fully update user '" +
              targetUser +
              "' to '" +
              targetRole +
              "'"
          });
        else
          return resolve({
            messgage: "An error occurred during role changing process",
            errCode: "CR-002"
          });
      } else
        return resolve({
          message: "You are not authorized to performed the following task",
          errCode: "CR-001"
        });
    });
  }
  async changeProfilePic({ newProfile }, { email }) {
    return new Promise(async (resolve, reject) => {
      await User.updateOne({ email }, { profilePic: newProfile })
        .then(() =>
          resolve({
            message: "Profile picture changed successfully",
            success: true
          })
        )
        .catch(err => resolve({ message: err.message, success: false }));
    });
  }
  async changeCoverPic({ newCover }, { email }) {
    return new Promise(async (resolve, reject) => {
      await User.updateOne({ email }, { coverPic: newCover })
        .then(() =>
          resolve({
            message: "Cover picture changed successfully",
            success: true
          })
        )
        .catch(err => resolve({ message: err.message, success: false }));
    });
  }
  async getUserHistory({ email }) {
    return new Promise(async (resolve, reject) => {
      await History.find({ email })
        .then(history => resolve({ message: history, success: true }))
        .catch(err => resolve({ message: err, success: false }));
    });
  }
}
module.exports = UserService;
