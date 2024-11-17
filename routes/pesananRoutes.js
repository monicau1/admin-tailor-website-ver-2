// routes/pesananRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base path ke folder shared uploads
const SHARED_UPLOADS_PATH = path.join(__dirname, "../../shared/uploads");

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (file.fieldname === "bukti_pembayaran") {
      uploadPath = path.join(SHARED_UPLOADS_PATH, "pembayaran");
    } else if (file.fieldname === "gambar_permak") {
      uploadPath = path.join(SHARED_UPLOADS_PATH, "permak");
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    let prefix;
    if (file.fieldname === "bukti_pembayaran") {
      prefix = "payment-";
    } else if (file.fieldname === "gambar_permak") {
      prefix = "permak-";
    }
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

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

// Setup multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Import controllers
const pesananController = require("../controllers/pesananController");
const pesananPermakController = require("../controllers/pesananPermakController");
const pesananPakaianController = require("../controllers/pesananPakaianController");

// Buat folder upload jika belum ada
const createUploadFolders = () => {
  const folders = [
    path.join(SHARED_UPLOADS_PATH, "pembayaran"),
    path.join(SHARED_UPLOADS_PATH, "permak"),
  ];

  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
};

// Panggil fungsi create folders
createUploadFolders();

// Routes untuk daftar pesanan
router.get("/", pesananController.getAllPesanan);

// Routes untuk pesanan pakaian
const pakaianRoutes = express.Router();

// View routes untuk pakaian
pakaianRoutes.get("/create", pesananPakaianController.showCreateForm);
pakaianRoutes.get("/:id", pesananController.getDetailPesanan);

// API routes untuk pakaian
pakaianRoutes.get("/varian/:id", pesananPakaianController.getVarianPakaian);
pakaianRoutes.post(
  "/",
  upload.fields([{ name: "bukti_pembayaran", maxCount: 1 }]),
  pesananPakaianController.createPesananPakaian
);

// Routes untuk pesanan permak
const permakRoutes = express.Router();

// View routes untuk permak
permakRoutes.get("/create", pesananPermakController.showCreateForm);
permakRoutes.get("/:id", pesananController.getDetailPesanan);

// API routes untuk permak
permakRoutes.get(
  "/kategori/:kategoriId/jenis",
  pesananPermakController.getJenisPermakByKategori
);
permakRoutes.post(
  "/",
  upload.fields([
    { name: "bukti_pembayaran", maxCount: 1 },
    { name: "gambar_permak", maxCount: 10 },
  ]),
  pesananPermakController.createPermak
);

// Gunakan routes
router.use("/pakaian", pakaianRoutes);
router.use("/permak", permakRoutes);

// Route umum
router.get("/:id", pesananController.getDetailPesanan);
router.put("/:id/status", pesananController.updateStatus);

module.exports = router;
