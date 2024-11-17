const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");
const Pelanggan = require("./Pelanggan");

// models/AlamatPelanggan.js
const AlamatPelanggan = sequelize.define(
  "AlamatPelanggan",
  {
    id_alamat_pelanggan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pelanggan: {
      type: DataTypes.INTEGER,
      allowNull: false, // tetap false karena ini foreign key
      references: {
        model: Pelanggan,
        key: "id_pelanggan",
      },
    },
    alamat_jalan: {
      type: DataTypes.STRING(255),
      allowNull: false, // tetap false karena required
    },
    kecamatan: {
      type: DataTypes.STRING(100),
      allowNull: false, // ubah ke false karena required di form
    },
    provinsi: {
      type: DataTypes.STRING(100),
      allowNull: false, // ubah ke false karena required di form
    },
    kode_pos: {
      type: DataTypes.STRING(10),
      allowNull: false, // ubah ke false karena required di form
    },
    negara: {
      type: DataTypes.STRING(50),
      allowNull: false, // ubah ke false dan tetap ada default value
      defaultValue: "Indonesia",
    },
  },
  {
    tableName: "alamat_pelanggan",
    timestamps: false,
  }
);

module.exports = AlamatPelanggan;
