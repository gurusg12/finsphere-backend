"use strict";
const router = require("express").Router();
const c = require("../controllers/customersController");
const { requireUser, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { customerSchema } = require("../validators/schemas");

router.use(requireUser);
router.get("/", c.list);
router.post("/", validate(customerSchema), c.create);
router.get("/:id", c.get);
router.put("/:id", validate(customerSchema.partial()), c.update);
router.delete("/:id", requireAdmin, c.remove);

module.exports = router;
