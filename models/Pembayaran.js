// models/Pembayaran.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Pembayaran = sequelize.define(
  "Pembayaran",
  {
    id_pembayaran: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal_pembayaran: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    metode_pembayaran: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    jumlah_dibayar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status_pembayaran: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
    bukti_pembayaran: {
      type: DataTypes.STRING(255),
    },
    catatan_pembayaran: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "pembayaran",
    timestamps: false,
  }
);

module.exports = Pembayaran;
