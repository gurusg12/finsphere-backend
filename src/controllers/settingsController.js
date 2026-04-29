"use strict";
const Settings = require("../models/Settings");

async function getOrCreate() {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
}

exports.get = async (_req, res) => {
  const s = await getOrCreate();
  res.json({ settings: s });
};

exports.update = async (req, res) => {
  const s = await getOrCreate();
  Object.assign(s, req.body);
  await s.save();
  res.json({ settings: s });
};
