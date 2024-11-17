// models/InstruksiKhusus.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const InstruksiKhusus = sequelize.define(
  "InstruksiKhusus",
  {
    id_instruksi_khusus: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jenis_instruksi: {
      type: DataTypes.ENUM("permak", "jahit"),
      allowNull: false,
      comment:
        "Jenis instruksi: permak untuk perbaikan, jahit untuk jahitan baru",
    },
    catatan: {
      type: DataTypes.TEXT,
      comment: "Catatan umum atau instruksi jahitan",
    },
    lokasi_perbaikan: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Lokasi perbaikan (diisi jika jenis_instruksi = permak)",
    },
    deskripsi_perbaikan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Detail perbaikan (diisi jika jenis_instruksi = permak)",
    },
    deskripsi_item: {
      type: DataTypes.STRING(255),
      comment: "Deskripsi item/pakaian yang dikerjakan",
    },
  },
  {
    tableName: "instruksi_khusus",
    timestamps: false,
  }
);

module.exports = InstruksiKhusus;
