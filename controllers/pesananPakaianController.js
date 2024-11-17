// controllers/pesananPakaianController.js
const {
  Pesanan,
  Pelanggan,
  AlamatPelanggan,
  ItemPesanan,
  Pakaian,
  VarianPakaian,
  Pembayaran,
  Pengiriman,
  StatusPesanan,
  InstruksiKhusus,
} = require("../models");
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");
const fs = require("fs").promises;
const path = require("path");

// Helper function untuk handle file upload
async function handleFileUpload(file) {
  if (!file) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Format file tidak didukung");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Ukuran file terlalu besar (max 5MB)");
  }

  const uploadDir = path.join(__dirname, "../../shared/uploads/pembayaran");
  const filename = `payment-${Date.now()}${path.extname(file.originalname)}`;
  const filepath = path.join(uploadDir, filename);

  // Pastikan direktori ada
  await fs.mkdir(uploadDir, { recursive: true });

  // Pindahkan file
  await fs.rename(file.path, filepath);

  return filename;
}

exports.showCreateForm = async (req, res) => {
  try {
    const pelangganList = await Pelanggan.findAll({
      order: [["nama_pelanggan", "ASC"]],
    });

    const pakaianList = await Pakaian.findAll({
      where: { status_produk: "active" },
      order: [["nama_pakaian", "ASC"]],
    });

    res.render("pesanan/pakaian-form", {
      layout: "partials/layout",
      title: "Tambah Pesanan Pakaian",
      path: req.originalUrl,
      pelangganList,
      pakaianList,
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

exports.getVarianPakaian = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: "error",
        message: "ID pakaian tidak valid",
      });
    }

    const varian = await VarianPakaian.findAll({
      where: {
        id_pakaian: id,
        stok: {
          [Op.gt]: 0,
        },
      },
      attributes: ["id_varian_pakaian", "ukuran", "warna", "stok"],
      order: [
        ["ukuran", "ASC"],
        ["warna", "ASC"],
      ],
    });

    res.json({
      status: "success",
      data: varian,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil data varian",
    });
  }
};

exports.createPesananPakaian = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    let pelanggan;
    // Handle customer data
    if (req.body.id_pelanggan) {
      pelanggan = await Pelanggan.findByPk(req.body.id_pelanggan);
      if (!pelanggan) {
        throw new Error("Pelanggan tidak ditemukan");
      }
    } else {
      pelanggan = await Pelanggan.create(
        {
          nama_pelanggan: req.body.nama_pelanggan,
          email_pelanggan: req.body.email_pelanggan,
          password_pelanggan: req.body.password_pelanggan,
          nomor_telepon_pelanggan: req.body.nomor_telepon_pelanggan,
          tanggal_registrasi_pelanggan: new Date(),
        },
        { transaction: t }
      );
    }

    // Create alamat
    const alamat = await AlamatPelanggan.create(
      {
        id_pelanggan: pelanggan.id_pelanggan,
        alamat_jalan: req.body.alamat_jalan,
        kecamatan: req.body.kecamatan,
        provinsi: req.body.provinsi,
        kode_pos: req.body.kode_pos,
        negara: "Indonesia",
      },
      { transaction: t }
    );

    // Create pesanan
    const pesanan = await Pesanan.create(
      {
        id_pelanggan: pelanggan.id_pelanggan,
        id_status: 1, // Status pending
        tanggal_pesanan: new Date(),
      },
      { transaction: t }
    );

    // Handle bukti pembayaran
    let buktiPembayaranFilename = null;
    if (req.files && req.files.bukti_pembayaran) {
      buktiPembayaranFilename = await handleFileUpload(
        req.files.bukti_pembayaran[0]
      );
    }

    // Create pembayaran
    const pembayaran = await Pembayaran.create(
      {
        id_pesanan: pesanan.id_pesanan,
        metode_pembayaran: req.body.metode_pembayaran,
        status_pembayaran: req.body.status_pembayaran,
        tanggal_pembayaran: new Date(),
        jumlah_dibayar: 0, // Will be updated later
        bukti_pembayaran: buktiPembayaranFilename,
      },
      { transaction: t }
    );

    // Create pengiriman
    const pengiriman = await Pengiriman.create(
      {
        id_alamat_pelanggan: alamat.id_alamat_pelanggan,
        id_pesanan: pesanan.id_pesanan,
        jasa_pengiriman: req.body.jasa_pengiriman,
        biaya_pengiriman: req.body.biaya_pengiriman,
        status_pengiriman: "pending",
      },
      { transaction: t }
    );

    // Update pesanan dengan id pengiriman dan pembayaran
    await pesanan.update(
      {
        id_pengiriman: pengiriman.id_pengiriman,
        id_pembayaran: pembayaran.id_pembayaran,
      },
      { transaction: t }
    );

    // Process items
    let totalBiaya = 0;
    const items = Array.isArray(req.body.items)
      ? req.body.items
      : [req.body.items];

    for (const item of items) {
      const varian = await VarianPakaian.findByPk(item.id_varian_pakaian);
      if (!varian || varian.stok < item.kuantitas) {
        throw new Error("Stok tidak mencukupi");
      }

      const pakaian = await Pakaian.findByPk(varian.id_pakaian);
      if (!pakaian) {
        throw new Error("Pakaian tidak ditemukan");
      }

      // Create instruction if needed
      let instruksiId = null;
      if (item.catatan) {
        const instruksi = await InstruksiKhusus.create(
          {
            jenis_instruksi: "pakaian",
            catatan: item.catatan,
          },
          { transaction: t }
        );
        instruksiId = instruksi.id_instruksi_khusus;
      }

      const itemTotal = pakaian.harga * item.kuantitas;
      totalBiaya += itemTotal;

      // Create item pesanan
      await ItemPesanan.create(
        {
          id_pesanan: pesanan.id_pesanan,
          id_varian_pakaian: varian.id_varian_pakaian,
          id_instruksi_khusus: instruksiId,
          kuantitas: item.kuantitas,
          harga_per_item: pakaian.harga,
        },
        { transaction: t }
      );

      // Update stock
      await varian.update(
        {
          stok: varian.stok - item.kuantitas,
        },
        { transaction: t }
      );
    }

    // Update total payments
    const totalPesanan = totalBiaya + parseInt(req.body.biaya_pengiriman);
    await pembayaran.update(
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
      message: "Pesanan berhasil dibuat",
      data: {
        id_pesanan: pesanan.id_pesanan,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);

    // Clean up uploaded files if error occurs
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach(async (file) => {
          try {
            if (file.path && fs.existsSync(file.path)) {
              await fs.unlink(file.path);
            }
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
