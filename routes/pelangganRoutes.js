// routes/pelangganRoutes.js
const express = require("express");
const router = express.Router();
const pelangganController = require("../controllers/pelangganController");

router.get("/check-email", async (req, res) => {
  try {
    const { email } = req.query;
    const existingPelanggan = await Pelanggan.findOne({
      where: { email_pelanggan: email },
    });

    if (existingPelanggan) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
    }

    res.json({
      status: "success",
      message: "Email tersedia",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memeriksa email",
    });
  }
});

// Route untuk menampilkan daftar pelanggan
router.get("/", pelangganController.getAllPelanggan);

// Route untuk menampilkan form tambah pelanggan
router.get("/create", pelangganController.showCreateForm);

// Route untuk memproses penambahan pelanggan
router.post("/", pelangganController.createPelanggan);

// Route untuk menampilkan detail pelanggan
router.get("/:id", pelangganController.getPelangganById);

// Route untuk memproses update pelanggan
router.put("/:id", pelangganController.updatePelanggan);

// Route untuk menghapus pelanggan
router.delete("/:id", pelangganController.deletePelanggan);

module.exports = router;
