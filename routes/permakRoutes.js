// routes/jenisPermakRoutes.js
const express = require("express");
const router = express.Router();
const jenisPermakController = require("../controllers/jenisPermakController");

router.post("/", jenisPermakController.createJenisPermak);
router.get("/", jenisPermakController.getAllJenisPermak);
router.get("/:id", jenisPermakController.getJenisPermakById);
router.put("/:id", jenisPermakController.updateJenisPermak);
router.delete("/:id", jenisPermakController.deleteJenisPermak);

module.exports = router;
