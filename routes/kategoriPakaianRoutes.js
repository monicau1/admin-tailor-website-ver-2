// routes/kategoriPakaianRoutes.js
const express = require("express");
const router = express.Router();
const kategoriPakaianController = require("../controllers/kategoriPakaianController");

// Kategori Pakaian routes
router.get("/", kategoriPakaianController.getAllKategoriPakaian);
router.post("/", kategoriPakaianController.createKategoriPakaian);
//router.get("/:id", kategoriPakaianController.getKategoriPakaianById);
router.put("/:id", kategoriPakaianController.updateKategoriPakaian);
router.delete("/:id", kategoriPakaianController.deleteKategoriPakaian);

module.exports = router;
