const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

// models/Pelanggan.js
const Pelanggan = sequelize.define(
  "Pelanggan",
  {
    id_pelanggan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_alamat_pelanggan: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nama_pelanggan: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email_pelanggan: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_pelanggan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nomor_telepon_pelanggan: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    tanggal_registrasi_pelanggan: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "pelanggan",
    timestamps: false,
  }
);

module.exports = Pelanggan;
