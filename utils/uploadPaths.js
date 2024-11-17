// utils/uploadPaths.js
const path = require("path");

// Base path ke folder shared uploads
const SHARED_UPLOADS_PATH = path.join(__dirname, "../../shared/uploads");

// Path untuk setiap jenis upload
const PATHS = {
  KATEGORI_PERMAK: path.join(SHARED_UPLOADS_PATH, "kategori-permak"),
  KATEGORI_PAKAIAN: path.join(SHARED_UPLOADS_PATH, "kategori-pakaian"),
  PAKAIAN: path.join(SHARED_UPLOADS_PATH, "pakaian"),
};

// Fungsi untuk memastikan folder ada
const createUploadDirectories = () => {
  const fs = require("fs");
  Object.values(PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

module.exports = {
  PATHS,
  createUploadDirectories,
};
