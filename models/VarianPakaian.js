// models/VarianPakaian.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");
const Pakaian = require("./Pakaian");

const VarianPakaian = sequelize.define(
  "VarianPakaian",
  {
    id_varian_pakaian: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pakaian: {
      type: DataTypes.INTEGER,
      references: {
        model: Pakaian,
        key: "id_pakaian",
      },
      allowNull: false,
    },
    ukuran: {
      type: DataTypes.STRING,
    },
    warna: {
      type: DataTypes.STRING,
    },
    stok: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    kode_sku: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    tableName: "varian_pakaian",
    timestamps: false,
  }
);

module.exports = VarianPakaian;
