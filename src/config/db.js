"use strict";
const mongoose = require("mongoose");
const env = require("./env");

mongoose.set("strictQuery", true);

let connecting = null;
async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;
  connecting = mongoose
    .connect(env.MONGODB_URI, {
      autoIndex: !env.isProd,
      serverSelectionTimeoutMS: 15000,
    })
    .then((m) => {
      // eslint-disable-next-line no-console
      console.log(`[db] Connected to ${m.connection.host}/${m.connection.name}`);
      return m.connection;
    })
    .catch((err) => {
      connecting = null;
      throw err;
    });
  return connecting;
}

async function disconnect() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

module.exports = { connect, disconnect };
