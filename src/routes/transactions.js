"use strict";
const router = require("express").Router();
const c = require("../controllers/transactionsController");
const { requireUser, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { transactionSchema } = require("../validators/schemas");

router.use(requireUser);
router.get("/", c.list);
router.post("/", validate(transactionSchema), c.create);
router.delete("/:id", requireAdmin, c.remove);

module.exports = router;
