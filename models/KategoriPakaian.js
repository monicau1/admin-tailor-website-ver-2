const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const KategoriPakaian = sequelize.define(
  "KategoriPakaian",
  {
    id_kategori_pakaian: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kategori_pakaian: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "kategori_pakaian",
    timestamps: false,
  }
);

module.exports = KategoriPakaian;
