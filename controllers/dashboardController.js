// controllers/dashboardController.js
const {
  Pesanan,
  Pelanggan,
  Pembayaran,
  ItemPesanan,
  JenisPermak,
  VarianPakaian,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../utils/db.js");

exports.getDashboard = async (req, res) => {
  try {
    // 1. Mendapatkan total pesanan
    const totalPesanan = await Pesanan.count();

    // 2. Mendapatkan total pelanggan
    const totalPelanggan = await Pelanggan.count();

    // 3. Menghitung total pendapatan
    const totalPendapatan = await Pembayaran.sum("jumlah_dibayar", {
      where: {
        status_pembayaran: "paid",
      },
    });

    // 4. Mendapatkan tren pesanan 6 bulan terakhir
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    // Query untuk pesanan permak - hanya ambil count per bulan
    const trenPermakQuery = `
      SELECT 
        DATE_FORMAT(p.tanggal_pesanan, '%Y-%m') as bulan,
        COUNT(DISTINCT p.id_pesanan) as jumlah_pesanan
      FROM pesanan p
      INNER JOIN item_pesanan ip ON p.id_pesanan = ip.id_pesanan
      WHERE p.tanggal_pesanan >= :startDate
      AND ip.id_jenis_permak IS NOT NULL
      GROUP BY DATE_FORMAT(p.tanggal_pesanan, '%Y-%m')
    `;

    // Query untuk pesanan jahit - hanya ambil count per bulan
    const trenJahitQuery = `
      SELECT 
        DATE_FORMAT(p.tanggal_pesanan, '%Y-%m') as bulan,
        COUNT(DISTINCT p.id_pesanan) as jumlah_pesanan
      FROM pesanan p
      INNER JOIN item_pesanan ip ON p.id_pesanan = ip.id_pesanan
      WHERE p.tanggal_pesanan >= :startDate
      AND ip.id_varian_pakaian IS NOT NULL
      GROUP BY DATE_FORMAT(p.tanggal_pesanan, '%Y-%m')
    `;

    const [trenPermak, trenJahit] = await Promise.all([
      sequelize.query(trenPermakQuery, {
        replacements: { startDate: sixMonthsAgo },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(trenJahitQuery, {
        replacements: { startDate: sixMonthsAgo },
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    // Gabungkan data tren
    const monthsMap = new Map();
    const allMonths = [...trenPermak, ...trenJahit].map((item) => item.bulan);
    const uniqueMonths = [...new Set(allMonths)].sort();

    uniqueMonths.forEach((month) => {
      const permakData = trenPermak.find((item) => item.bulan === month);
      const jahitData = trenJahit.find((item) => item.bulan === month);

      monthsMap.set(month, {
        bulan: month,
        pesanan_permak: permakData ? parseInt(permakData.jumlah_pesanan) : 0,
        pesanan_jahit: jahitData ? parseInt(jahitData.jumlah_pesanan) : 0,
      });
    });

    const trenPesanan = Array.from(monthsMap.values());

    // 5. Mendapatkan 5 pesanan terbaru
    const pesananTerbaru = await Pesanan.findAll({
      include: [
        {
          model: Pelanggan,
          as: "PelangganPesanan",
          attributes: ["nama_pelanggan"],
        },
        {
          model: ItemPesanan,
          as: "ItemPesanan",
          include: [
            {
              model: JenisPermak,
              as: "JenisPermak",
              required: false,
            },
            {
              model: VarianPakaian,
              as: "VarianPakaian",
              required: false,
            },
          ],
        },
      ],
      order: [["tanggal_pesanan", "DESC"]],
      limit: 5,
    });

    res.render("dashboard", {
      layout: "partials/layout",
      title: "Dashboard",
      path: req.originalUrl,
      totalPesanan,
      totalPelanggan,
      totalPendapatan: totalPendapatan || 0,
      trenPesanan,
      pesananTerbaru,
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("error", {
      layout: "partials/layout",
      title: "Error",
      path: req.originalUrl,
      message: "Terjadi kesalahan saat memuat dashboard",
      error: process.env.NODE_ENV === "development" ? error : {},
    });
  }
};
