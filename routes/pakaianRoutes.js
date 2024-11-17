// routes/pakaianRoutes.js
const express = require("express");
const router = express.Router();
const pakaianController = require("../controllers/pakaianController");
const upload = require("../middleware/uploadMiddleware");

// Route untuk menampilkan daftar pakaian
router.get("/", pakaianController.getAllPakaian);
router.get("/create", pakaianController.showCreateForm);
router.post("/", pakaianController.createPakaian);
router.get("/:id", pakaianController.getPakaianById);
router.put("/:id", pakaianController.updatePakaian);
router.delete("/:id", pakaianController.deletePakaian);

// Route untuk gambar
router.post(
  "/:id/images",
  upload.array("images", 5),
  pakaianController.uploadImages
);
router.delete("/:id/images/:imageId", pakaianController.deleteImage);
router.put("/:id/images/:imageId/primary", pakaianController.setPrimaryImage);

module.exports = router;
