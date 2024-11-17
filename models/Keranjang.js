// models/Keranjang.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Keranjang = sequelize.define(
  "Keranjang",
  {
    id_keranjang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pelanggan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis_layanan: {
      type: DataTypes.ENUM("jahit", "permak"),
      allowNull: false,
    },
  },
  {
    tableName: "keranjang",
    timestamps: false,
  }
);

module.exports = Keranjang;
