// middleware/uploadKategoriMiddleware.js
const multer = require("multer");
const path = require("path");
const { PATHS } = require("../utils/uploadPaths");

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PATHS.KATEGORI_PERMAK);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "kategori-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Konfigurasi filter file
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP"),
      false
    );
  }
};

// Buat instance multer dengan konfigurasi
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

module.exports = upload;
