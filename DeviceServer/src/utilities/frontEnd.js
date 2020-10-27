module.exports = async (Frontend, socketId) => {
  const newConnection = await new Frontend({ socketId });
  newConnection.save();
};
