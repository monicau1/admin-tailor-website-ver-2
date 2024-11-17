// Get product ID dari halaman
const PRODUCT_ID = document.querySelector("#productId")?.value;

document.addEventListener("DOMContentLoaded", function () {
  const imageUploadForm = document.getElementById("imageUploadForm");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const uploadProgress = document.getElementById("uploadProgress");
  const progressBar = uploadProgress.querySelector(".progress-bar");

  imageUploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!PRODUCT_ID) {
      alert("ID Produk tidak ditemukan!");
      return;
    }

    const formData = new FormData();
    const fileInput = document.getElementById("productImages");
    const files = fileInput.files;

    if (files.length === 0) {
      alert("Pilih file gambar terlebih dahulu!");
      return;
    }

    // Tambahkan semua file ke FormData
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      uploadProgress.classList.remove("d-none");
      progressBar.style.width = "0%";

      const response = await fetch(`/admin/pakaian/${PRODUCT_ID}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload gagal");
      }

      const result = await response.json();

      // Refresh halaman untuk menampilkan gambar baru
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengupload gambar: " + error.message);
    } finally {
      uploadProgress.classList.add("d-none");
      imageUploadForm.reset();
    }
  });
});

// Fungsi untuk menghapus gambar
async function deleteImage(imageId) {
  if (!PRODUCT_ID) {
    alert("ID Produk tidak ditemukan!");
    return;
  }

  if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) {
    return;
  }

  try {
    const response = await fetch(
      `/admin/pakaian/${PRODUCT_ID}/images/${imageId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Gagal menghapus gambar");
    }

    // Refresh halaman
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal menghapus gambar: " + error.message);
  }
}

// Fungsi untuk set gambar utama
async function setPrimaryImage(imageId) {
  if (!PRODUCT_ID) {
    alert("ID Produk tidak ditemukan!");
    return;
  }

  try {
    const response = await fetch(
      `/admin/pakaian/${PRODUCT_ID}/images/${imageId}/primary`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengatur gambar utama");
    }

    // Refresh halaman
    window.location.reload();
  } catch (error) {
    console.error("Error:", error);
    alert("Gagal mengatur gambar utama: " + error.message);
  }
}
