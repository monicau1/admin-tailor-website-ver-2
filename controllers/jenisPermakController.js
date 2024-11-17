// controllers/jenisPermakController.js
const { KategoriPermak, JenisPermak } = require("../models");
const sequelize = require("../utils/db.js");
const { Op } = require("sequelize");

exports.getAllJenisPermak = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const kategori = req.query.kategori;
    const search = req.query.search || "";

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (kategori) {
      whereClause.id_kategori_permak = kategori;
    }
    if (search) {
      whereClause.nama_permak = {
        [Op.like]: `%${search}%`,
      };
    }

    const { count, rows: jenisPermakList } = await JenisPermak.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: KategoriPermak,
          as: "KategoriPermak",
          attributes: ["nama_kategori_permak"],
        },
      ],
      offset: offset,
      limit: limit,
      order: [["id_jenis_permak", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    const kategoriList = await KategoriPermak.findAll({
      attributes: ["id_kategori_permak", "nama_kategori_permak"],
      order: [["nama_kategori_permak", "ASC"]],
    });

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: {
          jenis_permak: jenisPermakList,
          pagination: {
            total_item: count,
            total_page: totalPages,
            current_page: page,
            item_per_page: limit,
          },
        },
      });
    }

    res.render("jenis-permak/jenis-permak", {
      layout: "partials/layout",
      title: "Layanan Permak",
      path: req.originalUrl,
      layananList: jenisPermakList,
      kategoriList: kategoriList,
      pagination: {
        total_item: count,
        total_page: totalPages,
        current_page: page,
        item_per_page: limit,
      },
      query: {
        search: search,
        status: status,
        kategori: kategori,
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
    res.redirect("/admin/permak?error=" + encodeURIComponent(error.message));
  }
};

exports.getJenisPermakById = async (req, res) => {
  try {
    const { id } = req.params;

    const jenisPermak = await JenisPermak.findOne({
      where: { id_jenis_permak: id },
      include: [
        {
          model: KategoriPermak,
          as: "KategoriPermak",
          attributes: ["nama_kategori_permak"],
        },
      ],
    });

    if (!jenisPermak) {
      return res.status(404).json({
        status: "error",
        message: "Jenis permak tidak ditemukan",
      });
    }

    // Selalu kirim response JSON untuk API endpoint
    return res.json({
      status: "success",
      data: jenisPermak,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.createJenisPermak = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      id_kategori_permak,
      nama_permak,
      deskripsi_jenis_permak,
      status,
      harga,
    } = req.body;

    if (!id_kategori_permak || !nama_permak || !harga) {
      return res.status(400).json({
        status: "error",
        message: "Kategori permak, nama permak, dan harga harus diisi",
      });
    }

    const kategoriPermak = await KategoriPermak.findByPk(id_kategori_permak);
    if (!kategoriPermak) {
      return res.status(404).json({
        status: "error",
        message: "Kategori permak tidak ditemukan",
      });
    }

    const jenisPermak = await JenisPermak.create(
      {
        id_kategori_permak,
        nama_permak,
        deskripsi_jenis_permak,
        status: status || "active",
        harga,
      },
      { transaction: t }
    );

    await t.commit();

    const jenisPermakBaru = await JenisPermak.findOne({
      where: { id_jenis_permak: jenisPermak.id_jenis_permak },
      include: [
        {
          model: KategoriPermak,
          as: "KategoriPermak",
          attributes: ["nama_kategori_permak"],
        },
      ],
    });

    res.status(201).json({
      status: "success",
      message: "Jenis permak berhasil ditambahkan",
      data: jenisPermakBaru,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateJenisPermak = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      id_kategori_permak,
      nama_permak,
      deskripsi_jenis_permak,
      status_produk,
      harga,
    } = req.body;

    console.log("Request body:", req.body); // Debugging

    if (!id_kategori_permak || !nama_permak || !harga) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "Kategori permak, nama permak, dan harga harus diisi",
      });
    }

    const jenisPermak = await JenisPermak.findByPk(id);
    if (!jenisPermak) {
      await t.rollback();
      return res.status(404).json({
        status: "error",
        message: "Jenis permak tidak ditemukan",
      });
    }

    await jenisPermak.update(
      {
        id_kategori_permak,
        nama_permak,
        deskripsi_jenis_permak,
        status_produk: status_produk || "active",
        harga: parseFloat(harga),
      },
      {
        transaction: t,
      }
    );

    await t.commit();

    const updatedJenisPermak = await JenisPermak.findOne({
      where: { id_jenis_permak: id },
      include: [
        {
          model: KategoriPermak,
          as: "KategoriPermak",
          attributes: ["nama_kategori_permak"],
        },
      ],
    });

    return res.json({
      status: "success",
      message: "Jenis permak berhasil diperbarui",
      data: updatedJenisPermak,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating jenis permak:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteJenisPermak = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const jenisPermak = await JenisPermak.findByPk(id);
    if (!jenisPermak) {
      return res.status(404).json({
        status: "error",
        message: "Jenis permak tidak ditemukan",
      });
    }

    await jenisPermak.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({
      status: "success",
      message: "Jenis permak berhasil dihapus",
      data: {
        id_jenis_permak: parseInt(id),
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
