// public/js/pegawai/index.js
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
