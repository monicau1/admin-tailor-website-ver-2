// models/ItemPesanan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const ItemPesanan = sequelize.define(
  "ItemPesanan",
  {
    id_item_pesanan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pesanan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_jenis_permak: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_varian_pakaian: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_instruksi_khusus: {
      type: DataTypes.INTEGER,
    },
    id_ukuran_khusus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_status_master: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kuantitas: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    harga_per_item: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gambar_permak: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "item_pesanan",
    timestamps: false,
  }
);

module.exports = ItemPesanan;
