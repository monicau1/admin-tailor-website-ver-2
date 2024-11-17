// controllers/kategoriPermakController.js
const { KategoriPermak, JenisPermak } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../utils/db.js");

// Get all kategori permak with pagination and search
exports.getAllKategoriPermak = async (req, res) => {
  try {
    // Mengambil query parameters untuk pagination dan search
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    // Menyiapkan where clause untuk pencarian
    let whereClause = {};
    if (search) {
      whereClause.nama_kategori_permak = {
        [Op.like]: `%${search}%`,
      };
    }

    // Query untuk mendapatkan total data
    const totalCount = await KategoriPermak.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Query untuk mendapatkan data kategori beserta jumlah jenis permak
    const kategori = await KategoriPermak.findAll({
      attributes: [
        "id_kategori_permak",
        "nama_kategori_permak",
        "deskripsi",
        "nama_file_gambar",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM jenis_permak
            WHERE jenis_permak.id_kategori_permak = KategoriPermak.id_kategori_permak
          )`),
          "jumlah_jenis",
        ],
      ],
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["nama_kategori_permak", "ASC"]],
    });

    // Format response
    const formattedKategori = kategori.map((item) => ({
      id_kategori: item.id_kategori_permak,
      nama_kategori: item.nama_kategori_permak,
      deskripsi: item.deskripsi,
      gambar: item.nama_file_gambar,
      jumlah_jenis: parseInt(item.dataValues.jumlah_jenis) || 0,
    }));

    // Handle format response berdasarkan tipe request
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: formattedKategori,
        pagination: {
          total_items: totalCount,
          total_pages: totalPages,
          current_page: page,
          items_per_page: limit,
        },
      });
    }

    // Render view dengan layout.ejs
    res.render("kategori-permak/kategori-permak", {
      layout: "partials/layout",
      kategoriList: formattedKategori,
      title: "Daftar Kategori Permak",
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
    res.redirect(
      "/admin/kategori/permak?error=" + encodeURIComponent(error.message)
    );
  }
};

// Create kategori permak
exports.createKategoriPermak = async (req, res) => {
  try {
    const { nama_kategori_permak, deskripsi } = req.body;

    // Validasi input
    if (!nama_kategori_permak) {
      return res.status(400).json({
        status: "error",
        message: "Nama kategori harus diisi",
      });
    }

    // Cek apakah kategori sudah ada
    const existingKategori = await KategoriPermak.findOne({
      where: {
        nama_kategori_permak: {
          [Op.like]: nama_kategori_permak,
        },
      },
    });

    if (existingKategori) {
      return res.status(400).json({
        status: "error",
        message: "Kategori dengan nama tersebut sudah ada",
      });
    }

    // Simpan file gambar jika ada
    let nama_file_gambar = null;
    if (req.file) {
      nama_file_gambar = req.file.filename;
    }

    // Buat kategori baru
    const newKategori = await KategoriPermak.create({
      nama_kategori_permak,
      deskripsi,
      nama_file_gambar,
    });

    res.status(201).json({
      status: "success",
      message: "Kategori berhasil ditambahkan",
      data: {
        id_kategori: newKategori.id_kategori_permak,
        nama_kategori: newKategori.nama_kategori_permak,
        deskripsi: newKategori.deskripsi,
        gambar: newKategori.nama_file_gambar,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get kategori permak by ID
exports.getKategoriPermakById = async (req, res) => {
  try {
    const { id } = req.params;

    const kategori = await KategoriPermak.findByPk(id, {
      include: [
        {
          model: JenisPermak,
          as: "JenisPermak",
        },
      ],
    });

    if (!kategori) {
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(404).json({
          status: "error",
          message: "Kategori permak tidak ditemukan",
        });
      }
      return res.redirect(
        "/admin/kategori/permak?error=" +
          encodeURIComponent("Kategori permak tidak ditemukan")
      );
    }

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: kategori,
      });
    }

    res.render("kategori-permak/kategori-permak-edit", {
      layout: "partials/layout",
      title: "Edit Kategori Permak",
      path: req.originalUrl,
      kategori: kategori,
    });
  } catch (error) {
    console.error("Error:", error);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
    res.redirect(
      "/admin/kategori/permak?error=" + encodeURIComponent(error.message)
    );
  }
};

// Update kategori permak
exports.updateKategoriPermak = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori_permak, deskripsi } = req.body;

    // Validasi input
    if (!nama_kategori_permak) {
      return res.status(400).json({
        status: "error",
        message: "Nama kategori harus diisi",
      });
    }

    // Cek apakah kategori ada
    const kategori = await KategoriPermak.findByPk(id);
    if (!kategori) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek apakah nama baru sudah digunakan (kecuali oleh kategori ini sendiri)
    const existingKategori = await KategoriPermak.findOne({
      where: {
        nama_kategori_permak: {
          [Op.like]: nama_kategori_permak,
        },
        id_kategori_permak: {
          [Op.ne]: id,
        },
      },
    });

    if (existingKategori) {
      return res.status(400).json({
        status: "error",
        message: "Kategori dengan nama tersebut sudah ada",
      });
    }

    // Update file gambar jika ada
    let updateData = { nama_kategori_permak, deskripsi };
    if (req.file) {
      updateData.nama_file_gambar = req.file.filename;
    }

    // Update kategori
    await kategori.update(updateData);

    res.json({
      status: "success",
      message: "Kategori berhasil diperbarui",
      data: {
        id_kategori: kategori.id_kategori_permak,
        nama_kategori: kategori.nama_kategori_permak,
        deskripsi: kategori.deskripsi,
        gambar: kategori.nama_file_gambar,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete kategori permak
exports.deleteKategoriPermak = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah kategori ada
    const kategori = await KategoriPermak.findByPk(id);
    if (!kategori) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek apakah ada jenis permak yang menggunakan kategori ini
    const jenisPermakCount = await JenisPermak.count({
      where: { id_kategori_permak: id },
    });

    if (jenisPermakCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `Tidak dapat menghapus kategori karena masih digunakan oleh ${jenisPermakCount} jenis permak`,
      });
    }

    // Hapus kategori
    await kategori.destroy();

    res.json({
      status: "success",
      message: "Kategori berhasil dihapus",
      data: {
        id_kategori: parseInt(id),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
