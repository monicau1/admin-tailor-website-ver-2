// models/KategoriPermak.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const KategoriPermak = sequelize.define(
  "KategoriPermak",
  {
    id_kategori_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kategori_permak: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Nama kategori permak tidak boleh kosong",
        },
      },
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nama_file_gambar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "kategori_permak", // Nama tabel di database
    timestamps: false, // Tidak menggunakan created_at dan updated_at
    underscored: true, // Menggunakan underscore untuk penamaan kolom
  }
);

module.exports = KategoriPermak;
