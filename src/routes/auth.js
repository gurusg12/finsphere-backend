"use strict";
const router = require("express").Router();
const c = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimit");
const { registerSchema, loginSchema } = require("../validators/schemas");

router.post("/register", authLimiter, validate(registerSchema), c.register);
router.post("/login", authLimiter, validate(loginSchema), c.login);
router.post("/logout", c.logout);
router.get("/session", c.session);

module.exports = router;
