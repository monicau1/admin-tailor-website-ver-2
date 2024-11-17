// models/PermintaanUkuranKhusus.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const PermintaanUkuranKhusus = sequelize.define(
  "PermintaanUkuranKhusus",
  {
    id_ukuran_khusus: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ukuran_dada: {
      type: DataTypes.DECIMAL(5, 2),
    },
    ukuran_pinggang: {
      type: DataTypes.DECIMAL(5, 2),
    },
    panjang_tubuh: {
      type: DataTypes.DECIMAL(5, 2),
    },
    panjang_kaki: {
      type: DataTypes.DECIMAL(5, 2),
    },
    lebar_paha: {
      type: DataTypes.DECIMAL(5, 2),
    },
  },
  {
    tableName: "permintaan_ukuran_khusus",
    timestamps: false,
  }
);

module.exports = PermintaanUkuranKhusus;
