// routes/permakRoutes.js
const express = require("express");
const router = express.Router();
const jenisPermakController = require("../controllers/jenisPermakController");

// Permak routes
router.get("/", jenisPermakController.getAllJenisPermak);
router.post("/", jenisPermakController.createJenisPermak);
router.get("/:id", jenisPermakController.getJenisPermakById); // Uncomment jika ingin mendapatkan jenis permak berdasarkan ID
router.put("/:id", jenisPermakController.updateJenisPermak);
router.delete("/:id", jenisPermakController.deleteJenisPermak);

module.exports = router;
