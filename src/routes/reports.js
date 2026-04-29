"use strict";
const router = require("express").Router();
const c = require("../controllers/reportsController");
const { requireUser, requireAdmin } = require("../middleware/auth");

router.use(requireUser);
router.get("/daybook", c.daybook);
router.get("/balance-book", c.balanceBook);
router.get("/ledger", c.ledger);
router.get("/loans", c.loans);
router.get("/pl", c.pl);
router.get("/balance-sheet", requireAdmin, c.balanceSheet);

module.exports = router;
