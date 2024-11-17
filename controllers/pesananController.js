// controllers/pesananController.js
const {
  Pesanan,
  Pegawai,
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
const { Op } = require("sequelize");
const sequelize = require("../utils/db.js");

// Helper function untuk memformat tanggal
function formatDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// Controller untuk mendapatkan semua pesanan
exports.getAllPesanan = async (req, res) => {
  try {
    // Ambil query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status;
    const penjahit = req.query.penjahit;
    const { start_date, end_date } = req.query;

    // Bangun where clause
    let whereClause = {};

    // Filter berdasarkan pencarian
    if (search) {
      whereClause = {
        [Op.or]: [
          { "$Pelanggan.nama_pelanggan$": { [Op.like]: `%${search}%` } },
          {
            "$Pelanggan.nomor_telepon_pelanggan$": { [Op.like]: `%${search}%` },
          },
          { id_pesanan: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Filter berdasarkan status
    if (status) {
      whereClause.id_status = status;
    }

    // Filter berdasarkan penjahit
    if (penjahit) {
      whereClause.nama_penjahit = penjahit;
    }

    // Filter berdasarkan tanggal
    if (start_date || end_date) {
      const { start, end } = formatDateRange(start_date, end_date);
      whereClause.tanggal_pesanan = {
        [Op.between]: [start, end],
      };
    }

    // Hitung total records untuk pagination
    const totalCount = await Pesanan.count({
      where: whereClause,
      include: [
        {
          model: Pelanggan,
          as: "PelangganPesanan",
          attributes: ["nama_pelanggan", "nomor_telepon_pelanggan"],
        },
      ],
    });

    // Ambil data pesanan
    const pesanan = await Pesanan.findAll({
      where: whereClause,
      include: [
        {
          model: Pelanggan,
          as: "PelangganPesanan",
          attributes: ["nama_pelanggan", "nomor_telepon_pelanggan"],
        },
        {
          model: ItemPesanan,
          as: "ItemPesanan",
          include: [
            {
              model: JenisPermak,
              as: "JenisPermak",
            },
            // {
            //   model: VarianPakaian,
            //   as: "VarianPakaian",
            // },
          ],
        },
        {
          model: StatusPesanan,
          as: "StatusPesanan",
        },
      ],
      order: [["tanggal_pesanan", "DESC"]],
      offset: offset,
      limit: limit,
    });

    // Format data untuk response
    const formattedPesanan = pesanan.map((order) => {
      const items = order.ItemPesanan || [];
      const firstItem = items[0];

      return {
        id_pesanan: order.id_pesanan,
        tanggal_pesanan: order.tanggal_pesanan,
        pelanggan: {
          nama_pelanggan: order.PelangganPesanan.nama_pelanggan,
          nomor_telepon_pelanggan:
            order.PelangganPesanan.nomor_telepon_pelanggan,
        },
        jenis_pesanan: firstItem?.JenisPermak ? "permak" : "jahit",
        item_pertama:
          firstItem?.JenisPermak?.nama_permak ||
          firstItem?.VarianPakaian?.ukuran,
        jumlah_item: items.length,
        status: order.StatusPesanan.nama_status,
        nama_penjahit: order.nama_penjahit,
        jumlah_total: order.jumlah_total,
        estimasi_selesai: order.estimasi_selesai,
      };
    });

    // Hitung total pesanan berdasarkan jenis
    const totalPermak = await Pesanan.count({
      include: [
        {
          model: ItemPesanan,
          as: "ItemPesanan",
          required: true,
          include: [
            {
              model: JenisPermak,
              as: "JenisPermak",
              required: true,
            },
          ],
        },
      ],
    });

    const totalJahit = await Pesanan.count({
      include: [
        {
          model: ItemPesanan,
          as: "ItemPesanan",
          required: true,
          include: [
            // {
            //   model: VarianPakaian,
            //   as: "VarianPakaian",
            //   required: true,
            // },
          ],
        },
      ],
    });

    // Ambil daftar penjahit untuk filter
    const penjahitList = await Pegawai.findAll({
      attributes: ["id_pegawai", "nama_pegawai"],
      order: [["nama_pegawai", "ASC"]],
      where: {
        // Tambahkan kondisi jika ada role/tipe pegawai khusus untuk penjahit
      },
    });

    // Handle response berdasarkan tipe request
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        status: "success",
        data: formattedPesanan,
        pagination: {
          total_items: totalCount,
          total_pages: Math.ceil(totalCount / limit),
          current_page: page,
          items_per_page: limit,
        },
      });
    }

    // Render view dengan data
    res.render("pesanan/pesanan", {
      layout: "partials/layout",
      title: "Daftar Pesanan",
      path: req.originalUrl,
      pesananList: formattedPesanan,
      penjahitList: penjahitList,
      totalPesanan: totalCount,
      totalPermak: totalPermak,
      totalJahit: totalJahit,
      pagination: {
        total_items: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        current_page: page,
        items_per_page: limit,
      },
      query: {
        search: search,
        status: status,
        penjahit: penjahit,
        start_date: start_date,
        end_date: end_date,
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
    res.redirect("/pesanan?error=" + encodeURIComponent(error.message));
  }
};

// Controller untuk update status pesanan
exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    // Validasi input
    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status harus diisi",
      });
    }

    // Cek pesanan exists
    const pesanan = await Pesanan.findByPk(id);
    if (!pesanan) {
      return res.status(404).json({
        status: "error",
        message: "Pesanan tidak ditemukan",
      });
    }

    // Update status pesanan
    await pesanan.update(
      {
        id_status: status,
      },
      { transaction: t }
    );

    // Catat riwayat status
    await RiwayatStatusPesanan.create(
      {
        id_pesanan: id,
        id_status_master: status,
        keterangan: catatan,
        tanggal_status: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      status: "success",
      message: "Status pesanan berhasil diperbarui",
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

// Di pesananController.js
exports.getDetailPesanan = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil detail pesanan dengan semua relasi yang dibutuhkan
    const pesanan = await Pesanan.findOne({
      where: { id_pesanan: id },
      include: [
        {
          model: Pelanggan,
          as: "PelangganPesanan",
          attributes: [
            "nama_pelanggan",
            "email_pelanggan",
            "nomor_telepon_pelanggan",
          ],
        },
        {
          model: ItemPesanan,
          as: "ItemPesanan",
          include: [
            {
              model: JenisPermak,
              as: "JenisPermak",
              include: [
                {
                  model: KategoriPermak,
                  as: "KategoriPermak",
                },
              ],
            },
            {
              model: InstruksiKhusus,
              as: "InstruksiKhusus",
            },
          ],
        },
        {
          model: Pembayaran,
          as: "Pembayaran",
        },
        {
          model: Pengiriman,
          as: "Pengiriman",
          include: [
            {
              model: AlamatPelanggan,
              as: "AlamatPengiriman",
            },
          ],
        },
        {
          model: RiwayatStatusPesanan,
          as: "RiwayatStatusPesanan",
          include: [
            {
              model: StatusPesanan,
              as: "StatusRiwayat",
            },
          ],
        },
      ],
    });

    if (!pesanan) {
      return res.render("error", {
        layout: "partials/layout",
        title: "Error",
        path: req.originalUrl,
        message: "Pesanan tidak ditemukan",
        error: null,
      });
    }

    // Helper function untuk warna status
    const getStatusColor = (status) => {
      const colors = {
        pending: "warning",
        process: "info",
        ready: "primary",
        completed: "success",
        cancelled: "danger",
      };
      return colors[status] || "secondary";
    };

    // Render view berdasarkan jenis pesanan
    res.render("pesanan/detail-permak", {
      layout: "partials/layout",
      title: `Detail Pesanan #${id}`,
      path: req.originalUrl,
      pesanan: pesanan,
      getStatusColor: getStatusColor,
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("error", {
      layout: "partials/layout",
      title: "Error",
      path: req.originalUrl,
      message: "Terjadi kesalahan saat mengambil detail pesanan",
      error: process.env.NODE_ENV === "development" ? error : null,
    });
  }
};

exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, estimasi_selesai, catatan } = req.body;

    // Validasi input
    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status harus diisi",
      });
    }

    // Cek pesanan exists
    const pesanan = await Pesanan.findByPk(id);
    if (!pesanan) {
      return res.status(404).json({
        status: "error",
        message: "Pesanan tidak ditemukan",
      });
    }

    // Update status pesanan
    await pesanan.update(
      {
        id_status: status,
        estimasi_selesai: estimasi_selesai || null,
      },
      { transaction: t }
    );

    // Catat riwayat status
    await RiwayatStatusPesanan.create(
      {
        id_pesanan: id,
        id_status_master: status,
        keterangan: catatan,
        tanggal_status: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      status: "success",
      message: "Status pesanan berhasil diperbarui",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat mengupdate status",
    });
  }
};
