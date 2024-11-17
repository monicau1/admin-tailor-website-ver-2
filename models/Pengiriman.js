// models/Pengiriman.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Pengiriman = sequelize.define(
  "Pengiriman",
  {
    id_pengiriman: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_alamat_pelanggan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nomor_resi: {
      type: DataTypes.STRING(50),
    },
    jasa_pengiriman: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    perkiraan_tanggal_pengiriman: {
      type: DataTypes.DATE,
    },
    status_pengiriman: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    biaya_pengiriman: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "pengiriman",
    timestamps: false,
  }
);

module.exports = Pengiriman;
