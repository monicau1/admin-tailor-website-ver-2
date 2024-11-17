// controllers/pesananPermakController.js
const {
  Pesanan,
  Pelanggan,
  AlamatPelanggan,
  ItemPesanan,
  JenisPermak,
  KategoriPermak,
  Pembayaran,
  Pengiriman,
  StatusPesanan,
  RiwayatStatusPesanan,
  InstruksiKhusus,
} = require("../models");
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");
const fs = require("fs").promises;
const path = require("path");

exports.showCreateForm = async (req, res) => {
  try {
    // Get data untuk dropdown
    const pelangganList = await Pelanggan.findAll({
      order: [["nama_pelanggan", "ASC"]],
    });

    const kategoriList = await KategoriPermak.findAll({
      order: [["nama_kategori_permak", "ASC"]],
    });

    res.render("pesanan/permak-form", {
      layout: "partials/layout",
      title: "Tambah Pesanan Permak",
      path: req.originalUrl,
      pelangganList,
      kategoriList,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.redirect(
      "/admin/pesanan?error=" +
        encodeURIComponent("Gagal memuat form tambah pesanan")
    );
  }
};

exports.getJenisPermakByKategori = async (req, res) => {
  try {
    const { kategoriId } = req.params;

    // Validasi input
    if (!kategoriId || isNaN(kategoriId)) {
      return res.status(400).json({
        status: "error",
        message: "ID Kategori tidak valid",
      });
    }

    const jenisList = await JenisPermak.findAll({
      where: {
        id_kategori_permak: kategoriId,
        //status_produk: "active", // tidak perlu untuk sekarang
      },
      attributes: ["id_jenis_permak", "nama_permak", "harga"],
      order: [["nama_permak", "ASC"]],
    });

    // Set header content type
    res.setHeader("Content-Type", "application/json");

    return res.json({
      status: "success",
      data: jenisList,
    });
  } catch (error) {
    console.error("Error in getJenisPermakByKategori:", error);

    // Set header content type
    res.setHeader("Content-Type", "application/json");

    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data jenis permak",
    });
  }
};

// Create new permak order
exports.createPermak = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    console.log("Received body:", req.body);
    console.log("Received files:", req.files);

    // 1. Handle customer data
    let pelanggan;
    if (req.body.id_pelanggan) {
      // Existing customer
      pelanggan = await Pelanggan.findByPk(req.body.id_pelanggan);
      if (!pelanggan) {
        throw new Error("Pelanggan tidak ditemukan");
      }
    } else {
      // New customer
      pelanggan = await Pelanggan.create(
        {
          nama_pelanggan: req.body.nama_pelanggan,
          email_pelanggan: req.body.email_pelanggan,
          nomor_telepon_pelanggan: req.body.nomor_telepon_pelanggan,
          tanggal_registrasi_pelanggan: new Date(),
        },
        { transaction: t }
      );
    }

    // 2. Create shipping address
    const alamat = await AlamatPelanggan.create(
      {
        id_pelanggan: pelanggan.id_pelanggan,
        alamat_jalan: req.body.pengiriman.alamat_jalan,
        kecamatan: req.body.pengiriman.kecamatan,
        provinsi: req.body.pengiriman.provinsi,
        kode_pos: req.body.pengiriman.kode_pos,
        negara: "Indonesia",
      },
      { transaction: t }
    );

    // 3. Create order
    const pesanan = await Pesanan.create(
      {
        id_pelanggan: pelanggan.id_pelanggan,
        id_status: 1, // Pending status
        tanggal_pesanan: new Date(),
        estimasi_selesai: null,
        jenis_pesanan: "permak",
      },
      { transaction: t }
    );

    // 4. Handle payment
    let buktiPembayaranFilename = null;
    if (req.files?.bukti_pembayaran) {
      buktiPembayaranFilename = await handleFileUpload(
        req.files.bukti_pembayaran[0],
        "pembayaran"
      );
    }

    const pembayaranRecord = await Pembayaran.create(
      {
        id_pesanan: pesanan.id_pesanan,
        metode_pembayaran: req.body.pembayaran.metode_pembayaran,
        status_pembayaran: req.body.pembayaran.status_pembayaran,
        tanggal_pembayaran: new Date(),
        jumlah_dibayar: 0, // Will be updated after calculating total
        bukti_pembayaran: buktiPembayaranFilename,
      },
      { transaction: t }
    );

    // 5. buat record pengiriman
    const pengirimanRecord = await Pengiriman.create(
      {
        id_alamat_pelanggan: alamat.id_alamat_pelanggan,
        id_pesanan: pesanan.id_pesanan,
        jasa_pengiriman: req.body.pengiriman.jasa_pengiriman,
        biaya_pengiriman: req.body.pengiriman.biaya_pengiriman,
        status_pengiriman: "pending",
      },
      { transaction: t }
    );

    // 6. Update pesanan dengan id_pengiriman
    await pesanan.update(
      {
        id_pengiriman: pengirimanRecord.id_pengiriman,
        id_pembayaran: pembayaranRecord.id_pembayaran,
      },
      { transaction: t }
    );

    let totalBiaya = 0;
    const items = Array.isArray(req.body.items)
      ? req.body.items
      : [req.body.items];

    const itemPromises = items.map(async (item, index) => {
      let fotoFilename = null;
      if (req.files?.gambar_permak && req.files.gambar_permak[index]) {
        fotoFilename = await handleFileUpload(
          req.files.gambar_permak[index],
          "permak"
        );
      }

      // Create instruction record
      const instruksi = await InstruksiKhusus.create(
        {
          jenis_instruksi: "permak",
          lokasi_perbaikan: item.lokasi_perbaikan,
          deskripsi_perbaikan: item.deskripsi_perbaikan,
          catatan: item.catatan,
        },
        { transaction: t }
      );

      // Get jenis permak to get price
      const jenisPermak = await JenisPermak.findByPk(item.jenis_permak);
      if (!jenisPermak) {
        throw new Error("Jenis permak tidak valid");
      }

      totalBiaya += jenisPermak.harga;

      // Create item record
      return ItemPesanan.create(
        {
          id_pesanan: pesanan.id_pesanan,
          id_jenis_permak: item.jenis_permak,
          id_instruksi_khusus: instruksi.id_instruksi_khusus,
          id_status_master: 1, // Pending status
          kuantitas: 1,
          harga_per_item: jenisPermak.harga,
          gambar_permak: fotoFilename,
        },
        { transaction: t }
      );
    });

    await Promise.all(itemPromises);

    // 7. Update total payment
    const totalPesanan =
      totalBiaya + parseInt(req.body.pengiriman.biaya_pengiriman);
    await pembayaranRecord.update(
      {
        jumlah_dibayar: totalPesanan,
      },
      { transaction: t }
    );

    await pesanan.update(
      {
        jumlah_total: totalPesanan,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      status: "success",
      message: "Pesanan permak berhasil dibuat",
      data: {
        id_pesanan: pesanan.id_pesanan,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);

    // Clean up any uploaded files if error occurs
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach(async (file) => {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat membuat pesanan",
    });
  }
};

// Helper function untuk upload file
async function handleFileUpload(file, type) {
  if (!file) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Format file tidak didukung");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Ukuran file terlalu besar (max 5MB)");
  }

  // Generate unique filename
  const ext = path.extname(file.originalname);
  const filename = `${type}-${Date.now()}${ext}`;

  // Set directory based on type
  const directory = type === "permak" ? "permak" : "payment";
  const uploadPath = path.join(__dirname, `../public/images/pesanan/${type}`);

  // Create directory if not exists
  await fs.mkdir(uploadPath, { recursive: true });

  // Move file
  await fs.rename(file.path, path.join(uploadPath, filename));

  return filename;
}
