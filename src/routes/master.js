"use strict";
const router = require("express").Router();
const c = require("../controllers/masterController");
const { requireUser, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { groupSchema, accountTypeSchema, ledgerSchema, idDeleteSchema } = require("../validators/schemas");

router.use(requireUser);

// Groups
router.get("/groups", c.listGroups);
router.post("/groups", requireAdmin, validate(groupSchema), c.createGroup);
router.delete("/groups", requireAdmin, validate(idDeleteSchema), c.deleteGroup);

// Account types
router.get("/account-types", c.listTypes);
router.post("/account-types", requireAdmin, validate(accountTypeSchema), c.createType);
router.delete("/account-types", requireAdmin, validate(idDeleteSchema), c.deleteType);

// Ledgers
router.get("/ledgers", c.listLedgers);
router.post("/ledgers", requireAdmin, validate(ledgerSchema), c.createLedger);
router.delete("/ledgers", requireAdmin, validate(idDeleteSchema), c.deleteLedger);

module.exports = router;
