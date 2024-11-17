// controllers/kategoriPakaianController.js
const { KategoriPakaian, Pakaian } = require("../models");
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");

exports.getAllKategoriPakaian = async (req, res) => {
  try {
    // Mengambil query parameters untuk pagination dan search
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    // Menyiapkan where clause untuk pencarian
    let whereClause = {};
    if (search) {
      whereClause.nama_kategori_pakaian = {
        [Op.like]: `%${search}%`,
      };
    }

    // Query untuk mendapatkan total data
    const totalCount = await KategoriPakaian.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Query untuk mendapatkan data kategori beserta jumlah produk
    const kategori = await KategoriPakaian.findAll({
      attributes: [
        "id_kategori_pakaian",
        "nama_kategori_pakaian",
        "deskripsi",
        [
          sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM pakaian
                        WHERE pakaian.id_kategori_pakaian = KategoriPakaian.id_kategori_pakaian
                    )`),
          "jumlah_produk",
        ],
      ],
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["nama_kategori_pakaian", "ASC"]],
    });

    // Format response
    const formattedKategori = kategori.map((item) => ({
      id_kategori: item.id_kategori_pakaian,
      nama_kategori: item.nama_kategori_pakaian,
      deskripsi: item.deskripsi,
      jumlah_produk: parseInt(item.dataValues.jumlah_produk) || 0,
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

    // Render view dengan layout.ejs dan include data
    res.render("kategori-pakaian/kategori-pakaian", {
      layout: "partials/layout",
      kategoriList: formattedKategori,
      title: "Daftar Kategori Pakaian",
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
    res.redirect("/admin/kategori?error=" + encodeURIComponent(error.message));
  }
};

// Create Kategori Pakaian
exports.createKategoriPakaian = async (req, res) => {
  try {
    const { nama_kategori_pakaian, deskripsi } = req.body;

    // Validasi input
    if (!nama_kategori_pakaian) {
      return res.status(400).json({
        status: "error",
        message: "Nama kategori harus diisi",
      });
    }

    // Cek apakah kategori sudah ada
    const existingKategori = await KategoriPakaian.findOne({
      where: {
        nama_kategori_pakaian: {
          [Op.like]: nama_kategori_pakaian,
        },
      },
    });

    if (existingKategori) {
      return res.status(400).json({
        status: "error",
        message: "Kategori dengan nama tersebut sudah ada",
      });
    }

    // Buat kategori baru
    const newKategori = await KategoriPakaian.create({
      nama_kategori_pakaian,
      deskripsi,
    });

    res.status(201).json({
      status: "success",
      message: "Kategori berhasil ditambahkan",
      data: {
        id_kategori: newKategori.id_kategori_pakaian,
        nama_kategori: newKategori.nama_kategori_pakaian,
        deskripsi: newKategori.deskripsi,
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

// Update Kategori Pakaian
exports.updateKategoriPakaian = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kategori_pakaian, deskripsi } = req.body;

    // Validasi input
    if (!nama_kategori_pakaian) {
      return res.status(400).json({
        status: "error",
        message: "Nama kategori harus diisi",
      });
    }

    // Cek apakah kategori ada
    const kategori = await KategoriPakaian.findByPk(id);
    if (!kategori) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek apakah nama baru sudah digunakan (kecuali oleh kategori ini sendiri)
    const existingKategori = await KategoriPakaian.findOne({
      where: {
        nama_kategori_pakaian: {
          [Op.like]: nama_kategori_pakaian,
        },
        id_kategori_pakaian: {
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

    // Update kategori
    await kategori.update({
      nama_kategori_pakaian,
      deskripsi,
    });

    res.json({
      status: "success",
      message: "Kategori berhasil diperbarui",
      data: {
        id_kategori: kategori.id_kategori_pakaian,
        nama_kategori: kategori.nama_kategori_pakaian,
        deskripsi: kategori.deskripsi,
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

// Delete Kategori Pakaian
exports.deleteKategoriPakaian = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah kategori ada
    const kategori = await KategoriPakaian.findByPk(id);
    if (!kategori) {
      return res.status(404).json({
        status: "error",
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek apakah ada produk yang menggunakan kategori ini
    const productCount = await Pakaian.count({
      where: { id_kategori_pakaian: id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `Tidak dapat menghapus kategori karena masih digunakan oleh ${productCount} produk`,
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

// // Get All Kategori Permak
// exports.getAllKategoriPermak = async (req, res) => {
//   try {
//     const kategoriPermak = await KategoriPermak.findAll();

//     res.status(200).json({
//       status: "success",
//       data: kategoriPermak,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// // Create Kategori Permak
// exports.createKategoriPermak = async (req, res) => {
//   try {
//     const { nama_kategori_permak, deskripsi } = req.body;

//     const newKategoriPermak = await KategoriPermak.create({
//       nama_kategori_permak,
//       deskripsi,
//     });

//     res.status(201).json({
//       status: "success",
//       data: newKategoriPermak,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// // Get Kategori Permak by ID
// exports.getKategoriPermakById = async (req, res) => {
//   try {
//     const kategoriPermak = await KategoriPermak.findByPk(req.params.id);

//     if (!kategoriPermak) {
//       return res.status(404).json({
//         status: "error",
//         message: "Kategori permak tidak ditemukan",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: kategoriPermak,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// // Update Kategori Permak
// exports.updateKategoriPermak = async (req, res) => {
//   try {
//     const { nama_kategori_permak, deskripsi } = req.body;
//     const kategoriPermak = await KategoriPermak.findByPk(req.params.id);

//     if (!kategoriPermak) {
//       return res.status(404).json({
//         status: "error",
//         message: "Kategori permak tidak ditemukan",
//       });
//     }

//     await kategoriPermak.update({
//       nama_kategori_permak,
//       deskripsi,
//     });

//     res.status(200).json({
//       status: "success",
//       data: kategoriPermak,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

// // Delete Kategori Permak
// exports.deleteKategoriPermak = async (req, res) => {
//   try {
//     const kategoriPermak = await KategoriPermak.findByPk(req.params.id);

//     if (!kategoriPermak) {
//       return res.status(404).json({
//         status: "error",
//         message: "Kategori permak tidak ditemukan",
//       });
//     }

//     await kategoriPermak.destroy();

//     res.status(200).json({
//       status: "success",
//       message: "Kategori permak berhasil dihapus",
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };
