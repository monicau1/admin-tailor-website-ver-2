// models/Pesanan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Pesanan = sequelize.define(
  "Pesanan",
  {
    id_pesanan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pelanggan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_pengiriman: {
      type: DataTypes.INTEGER,
    },
    id_pembayaran: {
      type: DataTypes.INTEGER,
    },
    id_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_penjahit: {
      type: DataTypes.STRING(100),
    },
    tanggal_pesanan: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    jumlah_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    catatan_pesanan: {
      type: DataTypes.TEXT,
    },
    estimasi_selesai: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "pesanan",
    timestamps: false,
  }
);

module.exports = Pesanan;
