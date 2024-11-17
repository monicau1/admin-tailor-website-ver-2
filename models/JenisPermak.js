// models/JenisPermak.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");
const KategoriPermak = require("./KategoriPermak");

const JenisPermak = sequelize.define(
  "JenisPermak",
  {
    id_jenis_permak: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_kategori_permak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: KategoriPermak,
        key: "id_kategori_permak",
      },
      validate: {
        notNull: {
          msg: "Kategori permak harus dipilih",
        },
      },
    },
    nama_permak: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Nama permak tidak boleh kosong",
        },
      },
    },
    deskripsi_jenis_permak: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status_produk: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "active",
      validate: {
        isIn: {
          args: [["active", "inactive"]],
          msg: "Status produk harus 'active' atau 'inactive'",
        },
      },
    },
    harga: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Harga tidak boleh kurang dari 0",
        },
        notNull: {
          msg: "Harga harus diisi",
        },
      },
    },
  },
  {
    tableName: "jenis_permak",
    timestamps: false, // Jika tidak menggunakan created_at dan updated_at
  }
);

module.exports = JenisPermak;
