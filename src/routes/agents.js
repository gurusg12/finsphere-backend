"use strict";
const router = require("express").Router();
const c = require("../controllers/agentsController");
const { requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { agentCreateSchema, agentUpdateSchema, handoverSchema } = require("../validators/schemas");

router.use(requireAdmin);

router.get("/agents", c.listAgents);
router.post("/agents", validate(agentCreateSchema), c.createAgent);
router.put("/agents/:id", validate(agentUpdateSchema), c.updateAgent);
router.delete("/agents/:id", c.deleteAgent);

router.get("/handovers", c.listHandovers);
router.post("/handovers", validate(handoverSchema), c.createHandover);

module.exports = router;
