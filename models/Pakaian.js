// models/Pakaian.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Pakaian = sequelize.define(
  "Pakaian",
  {
    id_pakaian: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_kategori_pakaian: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_pakaian: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi_pakaian: {
      type: DataTypes.STRING,
    },
    harga: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    berat: {
      type: DataTypes.DECIMAL(10, 2),
    },
    status_produk: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "pakaian",
    timestamps: false,
  }
);

module.exports = Pakaian;
