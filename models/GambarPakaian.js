const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");
const Pakaian = require("./Pakaian");

const GambarPakaian = sequelize.define(
  "GambarPakaian",
  {
    id_gambar: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pakaian: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_file: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "gambar_pakaian",
    timestamps: true,
  }
);

module.exports = GambarPakaian;
