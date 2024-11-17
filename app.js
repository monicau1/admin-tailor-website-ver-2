// app.js
const express = require("express");
const path = require("path");
const sequelize = require("./utils/db.js");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const helpers = require("./utils/helpers");
const { createUploadDirectories, PATHS } = require("./utils/uploadPaths");

require("dotenv").config();

// Import routes
const dashboardRoutes = require("./routes/dashboardRoutes");
const pakaianRoutes = require("./routes/pakaianRoutes");
const kategoriPakaianRoutes = require("./routes/kategoriPakaianRoutes");
const kategoriPermakRoutes = require("./routes/kategoriPermakRoutes");
const jenisPermakRoutes = require("./routes/jenisPermakRoutes");
const pegawaiRoutes = require("./routes/pegawaiRoutes");
const pelangganRoutes = require("./routes/pelangganRoutes");
const pesananRoutes = require("./routes/pesananRoutes");

const app = express();

// Buat direktori untuk upload
createUploadDirectories();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method")); // Untuk mendukung PUT/DELETE di form

// View engine setup
app.use(expressLayouts);
app.locals = {
  ...app.locals,
  ...helpers,
};
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "partials/layout");

// EJS configuration
app.locals.extractScripts = true;
app.locals.extractStyles = true;

// Static files setup
app.use(express.static(path.join(__dirname, "public")));

// Setup static routes untuk gambar
app.use("/images/kategori-permak", express.static(PATHS.KATEGORI_PERMAK));
app.use("/images/kategori-pakaian", express.static(PATHS.KATEGORI_PAKAIAN));
app.use("/images/pakaian", express.static(PATHS.PAKAIAN));

// Setup untuk gambar pesanan
const pesananDirectories = {
  "/images/pesanan/permak": path.join(
    __dirname,
    "public/images/pesanan/permak"
  ),
  "/images/pesanan/pembayaran": path.join(
    __dirname,
    "public/images/pesanan/pembayaran"
  ),
};

Object.entries(pesananDirectories).forEach(([route, dir]) => {
  app.use(route, express.static(dir));
});

app.use((req, res, next) => {
  res.locals.path = req.originalUrl;
  next();
});

// API Routes
app.use("/admin/dashboard", dashboardRoutes);
app.use("/admin/pakaian", pakaianRoutes);
app.use("/admin/kategori/pakaian", kategoriPakaianRoutes);
app.use("/admin/kategori/permak", kategoriPermakRoutes);
app.use("/admin/permak", jenisPermakRoutes);
app.use("/admin/pegawai", pegawaiRoutes);
app.use("/admin/pelanggan", pelangganRoutes);
app.use("/admin/pesanan", pesananRoutes);

// Update default route
app.get("/admin/", (req, res) => {
  res.redirect("/admin/dashboard");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (req.xhr || req.headers.accept.includes("application/json")) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }

  res.status(500).render("error", {
    layout: "partials/layout",
    title: "Error",
    path: req.originalUrl,
    message: "Terjadi kesalahan pada server!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Database synchronization
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Error synchronizing database:", err);
  });

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    sequelize.close();
  });
});

module.exports = app;
