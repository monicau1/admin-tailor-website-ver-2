// models/ItemKeranjang.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const ItemKeranjang = sequelize.define(
  "ItemKeranjang",
  {
    id_item_keranjang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_keranjang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis_layanan: {
      type: DataTypes.ENUM("jahit", "permak"),
      allowNull: false,
    },
    id_varian_pakaian: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_jenis_permak: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_ukuran_khusus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_instruksi_khusus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kuantitas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    harga_per_item: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gambar_permak: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "item_keranjang",
    timestamps: false, // tidak pakai timestamp
  }
);

module.exports = ItemKeranjang;
