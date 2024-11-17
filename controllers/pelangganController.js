// controllers/pelangganController.js
const { Pelanggan, AlamatPelanggan } = require("../models");
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");

// Mendapatkan semua data pelanggan dengan paginasi dan pencarian
exports.getAllPelanggan = async (req, res) => {
  try {
    // Mengambil query parameters untuk paginasi dan pencarian
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    // Menyiapkan where clause untuk pencarian
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { nama_pelanggan: { [Op.like]: `%${search}%` } },
          { email_pelanggan: { [Op.like]: `%${search}%` } },
          { nomor_telepon_pelanggan: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Query untuk mendapatkan total data
    const totalCount = await Pelanggan.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Query untuk mendapatkan data pelanggan
    const pelanggan = await Pelanggan.findAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["id_pelanggan", "DESC"]],
    });

    // Format response
    const formattedPelanggan = pelanggan.map((item) => ({
      id_pelanggan: item.id_pelanggan,
      nama_pelanggan: item.nama_pelanggan,
      email_pelanggan: item.email_pelanggan,
      nomor_telepon_pelanggan: item.nomor_telepon_pelanggan,
      tanggal_registrasi_pelanggan: item.tanggal_registrasi_pelanggan,
    }));

    // Handle format response berdasarkan tipe request
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: formattedPelanggan,
        pagination: {
          total_items: totalCount,
          total_pages: totalPages,
          current_page: page,
          items_per_page: limit,
        },
      });
    }

    // Render view dengan layout.ejs dan include data
    res.render("pelanggan/pelanggan", {
      layout: "partials/layout",
      pelangganList: formattedPelanggan,
      title: "Daftar Pelanggan",
      path: req.originalUrl,
      pagination: {
        total_items: totalCount,
        total_pages: totalPages,
        current_page: page,
        items_per_page: limit,
      },
      query: {
        search: search,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
    res.redirect("/admin/pelanggan?error=" + encodeURIComponent(error.message));
  }
};

// Controller untuk menampilkan form tambah pelanggan
exports.showCreateForm = async (req, res) => {
  try {
    res.render("pelanggan/pelanggan-tambah", {
      layout: "partials/layout",
      title: "Tambah Pelanggan",
      path: req.originalUrl,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.redirect(
      "/admin/pelanggan?error=" +
        encodeURIComponent("Gagal memuat form tambah pelanggan")
    );
  }
};

exports.createPelanggan = async (req, res) => {
  try {
    const {
      nama_pelanggan,
      email_pelanggan,
      password_pelanggan,
      nomor_telepon_pelanggan,
      alamat_jalan,
      kecamatan,
      provinsi,
      kode_pos,
    } = req.body;

    // Tambahkan pengecekan email duplikat
    const existingPelanggan = await Pelanggan.findOne({
      where: { email_pelanggan },
    });

    if (existingPelanggan) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar. Silakan gunakan email lain.",
      });
    }

    // Debug
    console.log("Received data:", req.body);

    // Buat pelanggan
    const pelanggan = await Pelanggan.create({
      nama_pelanggan,
      email_pelanggan,
      password_pelanggan,
      nomor_telepon_pelanggan,
      tanggal_registrasi_pelanggan: new Date(),
    });

    // Debug
    console.log("Pelanggan created:", pelanggan.toJSON());

    // Buat alamat
    const alamat = await AlamatPelanggan.create({
      id_pelanggan: pelanggan.id_pelanggan,
      alamat_jalan,
      kecamatan,
      provinsi,
      kode_pos,
      negara: "Indonesia",
    });

    // Debug
    console.log("Alamat created:", alamat.toJSON());

    res.status(201).json({
      status: "success",
      message: "Pelanggan berhasil ditambahkan",
      data: { pelanggan, alamat },
    });
  } catch (error) {
    console.error("Error full detail:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get pelanggan by ID
exports.getPelangganById = async (req, res) => {
  try {
    const { id } = req.params;

    const pelanggan = await Pelanggan.findOne({
      where: { id_pelanggan: id },
      include: [
        {
          model: AlamatPelanggan,
          as: "alamat",
          attributes: [
            "id_alamat_pelanggan",
            "alamat_jalan",
            "kecamatan",
            "provinsi",
            "kode_pos",
            "negara",
          ],
        },
      ],
    });

    if (!pelanggan) {
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(404).json({
          status: "error",
          message: "Data pelanggan tidak ditemukan",
        });
      }
      return res.redirect(
        "/admin/pelanggan?error=" +
          encodeURIComponent("Data pelanggan tidak ditemukan")
      );
    }

    // Format data untuk view
    const formattedPelanggan = {
      id_pelanggan: pelanggan.id_pelanggan,
      nama_pelanggan: pelanggan.nama_pelanggan,
      email_pelanggan: pelanggan.email_pelanggan,
      nomor_telepon_pelanggan: pelanggan.nomor_telepon_pelanggan,
      tanggal_registrasi_pelanggan: pelanggan.tanggal_registrasi_pelanggan,
      alamat: pelanggan.alamat,
    };

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: formattedPelanggan,
      });
    }

    res.render("pelanggan/pelanggan-edit", {
      layout: "partials/layout",
      title: "Detail Pelanggan",
      path: req.originalUrl,
      pelanggan: formattedPelanggan,
      alamat: formattedPelanggan.alamat,
      isEditing: req.query.edit === "true", // Tambahkan ini
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error:", error);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
    res.redirect("/admin/pelanggan?error=" + encodeURIComponent(error.message));
  }
};

// Update pelanggan
exports.updatePelanggan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      nama_pelanggan,
      email_pelanggan,
      nomor_telepon_pelanggan,
      alamat_pelanggan, // array of alamat
    } = req.body;

    // Validasi input dasar
    if (!nama_pelanggan || !email_pelanggan || !nomor_telepon_pelanggan) {
      return res.status(400).json({
        status: "error",
        message: "Nama, email, dan nomor telepon harus diisi",
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pelanggan)) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid",
      });
    }

    // Cek apakah pelanggan ada
    const pelanggan = await Pelanggan.findByPk(id);
    if (!pelanggan) {
      return res.status(404).json({
        status: "error",
        message: "Pelanggan tidak ditemukan",
      });
    }

    // Cek email unik (kecuali email yang sama dengan pelanggan saat ini)
    const existingPelanggan = await Pelanggan.findOne({
      where: {
        email_pelanggan,
        id_pelanggan: { [Op.ne]: id },
      },
    });

    if (existingPelanggan) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah digunakan oleh pelanggan lain",
      });
    }

    // Update data pelanggan
    await pelanggan.update(
      {
        nama_pelanggan,
        email_pelanggan,
        nomor_telepon_pelanggan,
      },
      { transaction: t }
    );

    // Update alamat jika ada perubahan
    if (alamat_pelanggan && Array.isArray(alamat_pelanggan)) {
      // Hapus semua alamat lama
      await AlamatPelanggan.destroy({
        where: { id_pelanggan: id },
        transaction: t,
      });

      // Buat alamat baru
      const alamatPromises = alamat_pelanggan.map((alamat) =>
        AlamatPelanggan.create(
          {
            id_pelanggan: id,
            alamat_jalan: alamat.alamat_jalan,
            kecamatan: alamat.kecamatan,
            provinsi: alamat.provinsi,
            kode_pos: alamat.kode_pos,
            negara: alamat.negara || "Indonesia",
          },
          { transaction: t }
        )
      );

      await Promise.all(alamatPromises);
    }

    await t.commit();

    // Ambil data terbaru dengan alamat
    const updatedPelanggan = await Pelanggan.findOne({
      where: { id_pelanggan: id },
      include: [
        {
          model: AlamatPelanggan,
          as: "alamat",
          attributes: [
            "id_alamat_pelanggan",
            "alamat_jalan",
            "kecamatan",
            "provinsi",
            "kode_pos",
            "negara",
          ],
        },
      ],
    });

    res.json({
      status: "success",
      message: "Data pelanggan berhasil diperbarui",
      data: updatedPelanggan,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message:
        error.message || "Terjadi kesalahan saat memperbarui data pelanggan",
    });
  }
};

exports.deletePelanggan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Cek apakah pelanggan ada
    const pelanggan = await Pelanggan.findOne({
      where: { id_pelanggan: id },
      include: [
        {
          model: AlamatPelanggan,
          as: "alamat",
        },
      ],
    });

    if (!pelanggan) {
      return res.status(404).json({
        status: "error",
        message: "Pelanggan tidak ditemukan",
      });
    }

    // Hapus semua alamat pelanggan terlebih dahulu
    await AlamatPelanggan.destroy({
      where: { id_pelanggan: id },
      transaction: t,
    });

    // Hapus data pelanggan
    await pelanggan.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({
      status: "success",
      message: "Data pelanggan dan alamat berhasil dihapus",
      data: {
        id_pelanggan: parseInt(id),
        jumlah_alamat_terhapus: pelanggan.alamat ? pelanggan.alamat.length : 0,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message:
        error.message || "Terjadi kesalahan saat menghapus data pelanggan",
    });
  }
};
