// public/js/kategori-permak/index.js

document.addEventListener("DOMContentLoaded", function () {
  // Fungsi untuk menampilkan alert
  window.showAlert = function (message, type = "success") {
    const alertContainer = document.getElementById("alertContainer");
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    alertContainer.innerHTML = alertHTML;
  };

  // Preview gambar saat file dipilih
  function previewImage(input, previewElement, containerElement) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewElement.src = e.target.result;
        containerElement.classList.remove("d-none");
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // Event listener untuk preview gambar
  document
    .getElementById("gambarKategori")
    .addEventListener("change", function () {
      previewImage(
        this,
        document.getElementById("imagePreview"),
        document.getElementById("previewContainer")
      );
    });

  document
    .getElementById("editGambarKategori")
    .addEventListener("change", function () {
      previewImage(
        this,
        document.getElementById("editImagePreview"),
        document.getElementById("editPreviewContainer")
      );
    });

  // Fungsi untuk menyimpan kategori baru
  window.saveKategori = async function () {
    const namaKategori = document.getElementById("namaKategori").value.trim();
    const deskripsiKategori = document
      .getElementById("deskripsiKategori")
      .value.trim();
    const gambarFile = document.getElementById("gambarKategori").files[0];

    if (!namaKategori) {
      showAlert("Nama kategori harus diisi!", "danger");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nama_kategori_permak", namaKategori);
      formData.append("deskripsi", deskripsiKategori);
      if (gambarFile) {
        formData.append("gambar", gambarFile);
      }

      const response = await fetch("/admin/kategori/permak", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showAlert("Kategori berhasil ditambahkan!");
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addKategoriModal")
      );
      modal.hide();
      document.getElementById("kategoriForm").reset();

      // Reload halaman untuk memperbarui data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showAlert(error.message, "danger");
    }
  };

  // Fungsi untuk edit kategori
  window.editKategori = function (id, nama, deskripsi) {
    document.getElementById("editKategoriId").value = id;
    document.getElementById("editNamaKategori").value = nama;
    document.getElementById("editDeskripsiKategori").value = deskripsi || "";

    const modal = new bootstrap.Modal(
      document.getElementById("editKategoriModal")
    );
    modal.show();
  };

  // Fungsi untuk update kategori
  window.updateKategori = async function () {
    const id = document.getElementById("editKategoriId").value;
    const namaKategori = document
      .getElementById("editNamaKategori")
      .value.trim();
    const deskripsiKategori = document
      .getElementById("editDeskripsiKategori")
      .value.trim();
    const gambarFile = document.getElementById("editGambarKategori").files[0];

    if (!namaKategori) {
      showAlert("Nama kategori harus diisi!", "danger");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nama_kategori_permak", namaKategori);
      formData.append("deskripsi", deskripsiKategori);
      if (gambarFile) {
        formData.append("gambar", gambarFile);
      }

      const response = await fetch(`/admin/kategori/permak/${id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showAlert("Kategori berhasil diperbarui!");
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editKategoriModal")
      );
      modal.hide();

      // Reload halaman untuk memperbarui data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showAlert(error.message, "danger");
    }
  };

  // Fungsi untuk delete kategori
  window.deleteKategori = async function (id, jumlahJenis) {
    if (parseInt(jumlahJenis) > 0) {
      showAlert(
        `Tidak dapat menghapus kategori karena masih digunakan oleh ${jumlahJenis} jenis permak`,
        "danger"
      );
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      return;
    }

    try {
      const response = await fetch(`/admin/kategori/permak/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showAlert("Kategori berhasil dihapus!");

      // Reload halaman untuk memperbarui data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showAlert(error.message, "danger");
    }
  };

  // Fungsi untuk paginasi
  window.changePage = function (page) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.location.href = url.toString();
  };

  // Event listener untuk pencarian
  const searchInput = document.getElementById("searchInput");
  let searchTimeout;

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("search", this.value);
      url.searchParams.set("page", 1); // Reset ke halaman pertama saat mencari
      window.location.href = url.toString();
    }, 500);
  });
});
