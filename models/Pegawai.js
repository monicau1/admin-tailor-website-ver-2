// models/Pegawai.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const Pegawai = sequelize.define(
  "Pegawai",
  {
    id_pegawai: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_pegawai: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email_pegawai: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_pegawai: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nomor_telepon_pegawai: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    tanggal_masuk_pegawai: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "pegawai",
    timestamps: false,
  }
);

module.exports = Pegawai;
