const { Builder, By, Key, until } = require("selenium-webdriver");
const { FRONTEND } = require("../utilities/configs");
class Service {
  //handle initialization to send info to the device server
  initSocket = async (usb, Device) => {
    return new Promise((resolve) => {
      try {
        usb.find(async (err, pluggedDevices) => {
          const camera = pluggedDevices.find(
            (pluggedDevice) =>
              pluggedDevice.deviceName == "USB Composite Device"
          );
          const cameraPlugged = camera ? true : false;
          const deviceRegistered = await Device.findOne();
          let device;
          if (deviceRegistered)
            device = await Device.findOneAndUpdate(
              {},
              { streaming: false, cameraPlugged }
            );
          else {
            device = await new Device({ cameraPlugged });
            device.save();
          }

          return resolve(device);
        });
      } catch (error) {}
    });
  };
  //handle information update
  updateInfo = async (Device, device_info) => {
    console.log(device_info);
    const updatedDevice = await Device.findOneAndUpdate({}, { ...device_info });
  };
  //handle start streaming
  startStreaming = async (socket, streamInfo, Device) => {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
      const { deviceId, streamTitle, description, userEmail } = streamInfo;
      await driver.get(FRONTEND);
      await driver
        .findElement(By.id("usernameInput"))
        .sendKeys(`${deviceId}@device.com`);
      await driver.findElement(By.id("passwordInput")).sendKeys("FLIBVC123");
      const loginBtn = await driver.findElement(By.id("loginBtn"));
      loginBtn.click();
      await driver
        .wait(until.elementLocated(By.id("startStreamBtn")))
        .then((el) => el.click());
      await driver
        .wait(until.elementLocated(By.id("title")))
        .then((el) => el.sendKeys(streamTitle));
      await driver
        .wait(until.elementLocated(By.id("owner")))
        .then((el) => el.sendKeys(userEmail));
      await driver
        .wait(until.elementLocated(By.id("descriptionInput")))
        .then((el) => el.sendKeys(description));
      const startBtn = await driver.findElement(By.id("startBtn"));
      startBtn.click();
      socket.on("stop_streaming", () => {
        driver.quit();
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  startCasting = async (socket, streamCode) => {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
      const { deviceId, streamTitle, description, userEmail } = streamInfo;
      await driver.get(FRONTEND);
      await driver
        .findElement(By.id("usernameInput"))
        .sendKeys(`${deviceId}@device.com`);
      await driver.findElement(By.id("passwordInput")).sendKeys("FLIBVC123");
      const loginBtn = await driver.findElement(By.id("loginBtn"));
      loginBtn.click();
      const streamBox = await driver.findElement(By.id(streamCode));
      streamBox.click();
      socket.on("stop_streaming", () => {
        driver.quit();
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}
module.exports = Service;
