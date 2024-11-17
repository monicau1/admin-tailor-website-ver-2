// models/StatusPesanan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db.js");

const StatusPesanan = sequelize.define(
  "StatusPesanan",
  {
    id_status_master: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "status_pesanan",
    timestamps: false,
  }
);

module.exports = StatusPesanan;
