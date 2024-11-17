// routes/kategoriPermakRoutes.js
const express = require("express");
const router = express.Router();
const kategoriPermakController = require("../controllers/kategoriPermakController");
const uploadKategori = require("../middleware/uploadKategoriMiddleware");

router.get("/", kategoriPermakController.getAllKategoriPermak);
router.post(
  "/",
  uploadKategori.single("gambar"),
  kategoriPermakController.createKategoriPermak
);
router.get("/:id", kategoriPermakController.getKategoriPermakById);
router.put(
  "/:id",
  uploadKategori.single("gambar"),
  kategoriPermakController.updateKategoriPermak
);
router.delete("/:id", kategoriPermakController.deleteKategoriPermak);

module.exports = router;
