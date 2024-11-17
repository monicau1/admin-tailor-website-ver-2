// models/RiwayatStatusPesanan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const RiwayatStatusPesanan = sequelize.define(
  "RiwayatStatusPesanan",
  {
    id_status_pesanan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_status_master: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal_status: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "riwayat_status_pesanan",
    timestamps: false,
  }
);

module.exports = RiwayatStatusPesanan;
