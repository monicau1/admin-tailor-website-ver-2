// routes/pegawaiRoutes.js
const express = require("express");
const router = express.Router();
const pegawaiController = require("../controllers/pegawaiController");

// Route untuk menampilkan daftar pegawai
router.get("/", pegawaiController.getAllPegawai);

// Route untuk menampilkan form tambah pegawai
router.get("/create", pegawaiController.showCreateForm);

// Route untuk memproses penambahan pegawai
router.post("/", pegawaiController.createPegawai);

// Route untuk menampilkan form edit pegawai
router.get("/:id", pegawaiController.getPegawaiById);

// Route untuk memproses update pegawai
router.put("/:id", pegawaiController.updatePegawai);

// Route untuk menghapus pegawai
router.delete("/:id", pegawaiController.deletePegawai);

module.exports = router;
