"use strict";
const router = require("express").Router();
const c = require("../controllers/accountsController");
const { requireUser, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { accountSchema } = require("../validators/schemas");

router.use(requireUser);
router.get("/", c.list);
router.post("/", validate(accountSchema), c.create);
router.get("/:id", c.get);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);

module.exports = router;
