// models/index.js
const KategoriPakaian = require("./KategoriPakaian");
const Pakaian = require("./Pakaian");
const GambarPakaian = require("./GambarPakaian");
const VarianPakaian = require("./VarianPakaian");
const KategoriPermak = require("./KategoriPermak");
const JenisPermak = require("./JenisPermak");
const Pegawai = require("./Pegawai");
const Pelanggan = require("./Pelanggan");
const AlamatPelanggan = require("./AlamatPelanggan");
const StatusPesanan = require("./StatusPesanan");
const Pesanan = require("./Pesanan");
const ItemPesanan = require("./ItemPesanan");
const RiwayatStatusPesanan = require("./RiwayatStatusPesanan");
const Pengiriman = require("./Pengiriman");
const Pembayaran = require("./Pembayaran");
const PermintaanUkuranKhusus = require("./PermintaanUkuranKhusus");
const InstruksiKhusus = require("./InstruksiKhusus");
const Keranjang = require("./Keranjang");
const ItemKeranjang = require("./ItemKeranjang");

// Relasi Pakaian dan VarianPakaian
Pakaian.hasMany(VarianPakaian, {
  foreignKey: "id_pakaian",
  as: "VarianPakaian",
});

VarianPakaian.belongsTo(Pakaian, {
  foreignKey: "id_pakaian",
  as: "Pakaian",
});

// Relasi KategoriPakaian dan Pakaian
KategoriPakaian.hasMany(Pakaian, {
  foreignKey: "id_kategori_pakaian",
});

Pakaian.belongsTo(KategoriPakaian, {
  foreignKey: "id_kategori_pakaian",
});

Pakaian.hasMany(GambarPakaian, {
  foreignKey: "id_pakaian",
  as: "GambarPakaian",
});

GambarPakaian.belongsTo(Pakaian, {
  foreignKey: "id_pakaian",
  as: "Pakaian",
});

// Relasi KategoriPermak dan JenisPermak
KategoriPermak.hasMany(JenisPermak, {
  foreignKey: "id_kategori_permak",
  as: "JenisPermak",
});

JenisPermak.belongsTo(KategoriPermak, {
  foreignKey: "id_kategori_permak",
  as: "KategoriPermak",
});

Pelanggan.hasMany(AlamatPelanggan, {
  foreignKey: "id_pelanggan",
  as: "alamat",
});

AlamatPelanggan.belongsTo(Pelanggan, {
  foreignKey: "id_pelanggan",
  as: "pelanggan",
});

// Relasi Pesanan
Pelanggan.hasMany(Pesanan, {
  foreignKey: "id_pelanggan",
  as: "Pesanan",
});

Pesanan.belongsTo(Pelanggan, {
  foreignKey: "id_pelanggan",
  as: "PelangganPesanan",
});

StatusPesanan.hasMany(Pesanan, {
  foreignKey: "id_status",
  as: "PesananStatus",
});

Pesanan.belongsTo(StatusPesanan, {
  foreignKey: "id_status",
  as: "StatusPesanan",
});

Pesanan.hasOne(Pengiriman, {
  foreignKey: "id_pesanan",
  as: "Pengiriman",
});

Pengiriman.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "PesananPengiriman",
});

Pesanan.hasOne(Pembayaran, {
  foreignKey: "id_pesanan",
  as: "Pembayaran",
});

Pembayaran.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "PesananPembayaran",
});

// Relasi ItemPesanan
Pesanan.hasMany(ItemPesanan, {
  foreignKey: "id_pesanan",
  as: "ItemPesanan",
});

ItemPesanan.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "PesananItem",
});

JenisPermak.hasMany(ItemPesanan, {
  foreignKey: "id_jenis_permak",
  as: "ItemPesananPermak",
});

ItemPesanan.belongsTo(JenisPermak, {
  foreignKey: "id_jenis_permak",
  as: "JenisPermak",
});

VarianPakaian.hasMany(ItemPesanan, {
  foreignKey: "id_varian_pakaian",
  as: "ItemPesananVarian",
});

ItemPesanan.belongsTo(VarianPakaian, {
  foreignKey: "id_varian_pakaian",
  as: "VarianPakaian",
});

InstruksiKhusus.hasMany(ItemPesanan, {
  foreignKey: "id_instruksi_khusus",
  as: "ItemPesananInstruksi",
});

ItemPesanan.belongsTo(InstruksiKhusus, {
  foreignKey: "id_instruksi_khusus",
  as: "InstruksiKhusus",
});

StatusPesanan.hasMany(ItemPesanan, {
  foreignKey: "id_status_master",
  as: "ItemPesananStatus",
});

ItemPesanan.belongsTo(StatusPesanan, {
  foreignKey: "id_status_master",
  as: "StatusItemPesanan",
});

// Relasi RiwayatStatusPesanan
Pesanan.hasMany(RiwayatStatusPesanan, {
  foreignKey: "id_pesanan",
  as: "RiwayatStatusPesanan",
});

RiwayatStatusPesanan.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "PesananRiwayat",
});

StatusPesanan.hasMany(RiwayatStatusPesanan, {
  foreignKey: "id_status_master",
  as: "RiwayatStatus",
});

RiwayatStatusPesanan.belongsTo(StatusPesanan, {
  foreignKey: "id_status_master",
  as: "StatusRiwayat",
});

// Relasi Pengiriman
AlamatPelanggan.hasMany(Pengiriman, {
  foreignKey: "id_alamat_pelanggan",
  as: "PengirimanAlamat",
});

Pengiriman.belongsTo(AlamatPelanggan, {
  foreignKey: "id_alamat_pelanggan",
  as: "AlamatPengiriman",
});

// Relasi PermintaanUkuranKhusus
Pesanan.hasOne(PermintaanUkuranKhusus, {
  foreignKey: "id_pesanan",
  as: "UkuranKhusus",
});

PermintaanUkuranKhusus.belongsTo(Pesanan, {
  foreignKey: "id_pesanan",
  as: "PesananUkuran",
});

// Relasi Keranjang
Pelanggan.hasOne(Keranjang, {
  foreignKey: "id_pelanggan",
  as: "Keranjang",
});

Keranjang.belongsTo(Pelanggan, {
  foreignKey: "id_pelanggan",
  as: "Pelanggan",
});

// Relasi ItemKeranjang
Keranjang.hasMany(ItemKeranjang, {
  foreignKey: "id_keranjang",
  as: "ItemKeranjang",
});

ItemKeranjang.belongsTo(Keranjang, {
  foreignKey: "id_keranjang",
  as: "Keranjang",
});

// Relasi dengan VarianPakaian
VarianPakaian.hasMany(ItemKeranjang, {
  foreignKey: "id_varian_pakaian",
  as: "ItemKeranjangVarian",
});

ItemKeranjang.belongsTo(VarianPakaian, {
  foreignKey: "id_varian_pakaian",
  as: "VarianPakaian",
});

// Relasi dengan JenisPermak
JenisPermak.hasMany(ItemKeranjang, {
  foreignKey: "id_jenis_permak",
  as: "ItemKeranjangPermak",
});

ItemKeranjang.belongsTo(JenisPermak, {
  foreignKey: "id_jenis_permak",
  as: "JenisPermak",
});

// Relasi dengan PermintaanUkuranKhusus
PermintaanUkuranKhusus.hasMany(ItemKeranjang, {
  foreignKey: "id_ukuran_khusus",
  as: "ItemKeranjangUkuran",
});

ItemKeranjang.belongsTo(PermintaanUkuranKhusus, {
  foreignKey: "id_ukuran_khusus",
  as: "UkuranKhusus",
});

// Relasi dengan InstruksiKhusus
InstruksiKhusus.hasMany(ItemKeranjang, {
  foreignKey: "id_instruksi_khusus",
  as: "ItemKeranjangInstruksi",
});

ItemKeranjang.belongsTo(InstruksiKhusus, {
  foreignKey: "id_instruksi_khusus",
  as: "InstruksiKhusus",
});

// Relasi dengan PermintaanUkuranKhusus
PermintaanUkuranKhusus.hasMany(ItemPesanan, {
  foreignKey: "id_ukuran_khusus",
  as: "ItemPesananUkuran",
});

ItemPesanan.belongsTo(PermintaanUkuranKhusus, {
  foreignKey: "id_ukuran_khusus",
  as: "UkuranKhusus",
});

module.exports = {
  KategoriPakaian,
  Pakaian,
  GambarPakaian,
  VarianPakaian,
  KategoriPermak,
  JenisPermak,
  Pelanggan,
  AlamatPelanggan,
  Pegawai,
  StatusPesanan,
  Pesanan,
  ItemPesanan,
  RiwayatStatusPesanan,
  Pengiriman,
  Pembayaran,
  PermintaanUkuranKhusus,
  InstruksiKhusus,
  Keranjang,
  ItemKeranjang,
};
