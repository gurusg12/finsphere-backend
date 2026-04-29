"use strict";
const router = require("express").Router();
const c = require("../controllers/settingsController");
const { requireUser, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { settingsSchema } = require("../validators/schemas");

router.get("/", requireUser, c.get);
router.put("/", requireAdmin, validate(settingsSchema), c.update);

module.exports = router;
