// controllers/pegawaiController.js
const { Pegawai } = require("../models");
const { Op } = require("sequelize");

// Controller untuk menampilkan form tambah pegawai (GET)
exports.showCreateForm = async (req, res) => {
  try {
    // Render form dengan layout.ejs dan include data
    res.render("pegawai/pegawai-tambah", {
      layout: "partials/layout",
      title: "Tambah Pegawai",
      path: req.originalUrl,
      error: req.query.error || null,
    });
  } catch (error) {
    console.error("Error:", error);
    res.redirect(
      "/admin/pegawai?error=" +
        encodeURIComponent("Gagal memuat form tambah pegawai")
    );
  }
};

// Controller untuk memproses penambahan pegawai (POST)
exports.createPegawai = async (req, res) => {
  try {
    console.log("Received data:", req.body); // Untuk debugging

    const {
      nama_pegawai,
      email_pegawai,
      password_pegawai,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai,
    } = req.body;

    // Validasi input
    if (
      !nama_pegawai ||
      !email_pegawai ||
      !password_pegawai ||
      !nomor_telepon_pegawai ||
      !tanggal_masuk_pegawai
    ) {
      return res.status(400).json({
        status: "error",
        message: "Semua field harus diisi",
      });
    }

    // Validasi panjang password
    if (password_pegawai.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter",
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pegawai)) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingPegawai = await Pegawai.findOne({
      where: { email_pegawai },
    });

    if (existingPegawai) {
      return res.status(400).json({
        status: "error",
        message: "Email pegawai sudah terdaftar",
      });
    }

    // Simpan data pegawai baru
    const pegawai = await Pegawai.create({
      nama_pegawai,
      email_pegawai,
      password_pegawai,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai: new Date(tanggal_masuk_pegawai),
    });

    // Kirim response berhasil
    res.status(201).json({
      status: "success",
      message: "Data pegawai berhasil ditambahkan",
      data: pegawai,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat menambah pegawai",
    });
  }
};

// Mendapatkan semua data pegawai dengan paginasi dan pencarian
exports.getAllPegawai = async (req, res) => {
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
          { nama_pegawai: { [Op.like]: `%${search}%` } },
          { email_pegawai: { [Op.like]: `%${search}%` } },
          { nomor_telepon_pegawai: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Query untuk mendapatkan total data
    const totalCount = await Pegawai.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Query untuk mendapatkan data pegawai
    const pegawai = await Pegawai.findAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["id_pegawai", "DESC"]],
    });

    // Format response
    const formattedPegawai = pegawai.map((item) => ({
      id_pegawai: item.id_pegawai,
      nama_pegawai: item.nama_pegawai,
      email_pegawai: item.email_pegawai,
      nomor_telepon_pegawai: item.nomor_telepon_pegawai,
      tanggal_masuk_pegawai: item.tanggal_masuk_pegawai,
    }));

    // Handle format response berdasarkan tipe request
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: formattedPegawai,
        pagination: {
          total_items: totalCount,
          total_pages: totalPages,
          current_page: page,
          items_per_page: limit,
        },
      });
    }

    // Render view dengan layout.ejs dan include data
    res.render("pegawai/pegawai", {
      layout: "partials/layout",
      pegawaiList: formattedPegawai,
      title: "Daftar Pegawai",
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
    res.redirect("/admin/pegawai?error=" + encodeURIComponent(error.message));
  }
};

// Get pegawai by ID
exports.getPegawaiById = async (req, res) => {
  try {
    const { id } = req.params;

    const pegawai = await Pegawai.findByPk(id);

    if (!pegawai) {
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(404).json({
          status: "error",
          message: "Pegawai tidak ditemukan",
        });
      }
      return res.redirect(
        "/admin/pegawai?error=" + encodeURIComponent("Pegawai tidak ditemukan")
      );
    }

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: pegawai,
      });
    }

    res.render("pegawai/pegawai-edit", {
      layout: "partials/layout",
      title: "Edit Pegawai",
      path: req.originalUrl,
      pegawai: pegawai,
    });
  } catch (error) {
    console.error("Error:", error);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
    res.redirect("/admin/pegawai?error=" + encodeURIComponent(error.message));
  }
};

// Update pegawai
exports.updatePegawai = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_pegawai,
      email_pegawai,
      password_pegawai,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai,
    } = req.body;

    // Validasi input
    if (
      !nama_pegawai ||
      !email_pegawai ||
      !nomor_telepon_pegawai ||
      !tanggal_masuk_pegawai
    ) {
      return res.status(400).json({
        status: "error",
        message: "Semua field harus diisi",
      });
    }

    // Validasi panjang password jika ada
    if (password_pegawai && password_pegawai.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password minimal 6 karakter",
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pegawai)) {
      return res.status(400).json({
        status: "error",
        message: "Format email tidak valid",
      });
    }

    // Cek apakah pegawai ada
    const pegawai = await Pegawai.findByPk(id);
    if (!pegawai) {
      return res.status(404).json({
        status: "error",
        message: "Pegawai tidak ditemukan",
      });
    }

    // Cek apakah email sudah digunakan oleh pegawai lain
    const existingPegawai = await Pegawai.findOne({
      where: {
        email_pegawai,
        id_pegawai: { [Op.ne]: id },
      },
    });

    if (existingPegawai) {
      return res.status(400).json({
        status: "error",
        message: "Email pegawai sudah digunakan",
      });
    }

    // Siapkan data update
    const updateData = {
      nama_pegawai,
      email_pegawai,
      nomor_telepon_pegawai,
      tanggal_masuk_pegawai: new Date(tanggal_masuk_pegawai),
    };

    // Tambahkan password ke data update jika ada
    if (password_pegawai) {
      updateData.password_pegawai = password_pegawai;
    }

    // Update data pegawai
    await pegawai.update(updateData);

    res.json({
      status: "success",
      message: "Data pegawai berhasil diperbarui",
      data: pegawai,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete pegawai
exports.deletePegawai = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah pegawai ada
    const pegawai = await Pegawai.findByPk(id);
    if (!pegawai) {
      return res.status(404).json({
        status: "error",
        message: "Pegawai tidak ditemukan",
      });
    }

    // Hapus pegawai
    await pegawai.destroy();

    res.json({
      status: "success",
      message: "Pegawai berhasil dihapus",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
