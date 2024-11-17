// public/js/pesanan/detail-permak.js

document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi alert container
  if (!document.getElementById("alertContainer")) {
    const container = document.createElement("div");
    container.id = "alertContainer";
    container.className = "position-fixed top-0 end-0 p-3";
    container.style.zIndex = "1050";
    document.body.appendChild(container);
  }
});

// Fungsi untuk update status
function updateStatus() {
  const modal = new bootstrap.Modal(
    document.getElementById("updateStatusModal")
  );
  modal.show();
}

// Fungsi untuk menyimpan status
async function saveStatus() {
  try {
    const form = document.getElementById("updateStatusForm");
    const pesananId = form.querySelector('[name="pesananId"]').value;
    const status = form.querySelector('[name="status"]').value;
    const estimasiSelesai = form.querySelector(
      '[name="estimasi_selesai"]'
    ).value;
    const catatan = form.querySelector('[name="catatan"]').value;

    const response = await fetch(`/admin/pesanan/${pesananId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        estimasi_selesai: estimasiSelesai,
        catatan,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengupdate status");
    }

    showAlert("Status pesanan berhasil diperbarui", "success");
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    console.error("Error:", error);
    showAlert(error.message, "danger");
  }
}

// Fungsi untuk preview gambar
function viewImage(src) {
  const modal = new bootstrap.Modal(document.getElementById("imageModal"));
  const previewImage = document.getElementById("previewImage");
  previewImage.src = src;
  modal.show();
}

// Fungsi untuk cetak invoice
function printOrder() {
  // Setup halaman cetak
  let printContents = document.querySelector(".container-fluid").innerHTML;
  let originalContents = document.body.innerHTML;

  // Hapus tombol-tombol dan elemen yang tidak perlu dicetak
  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = printContents;

  // Hapus tombol-tombol
  tempDiv.querySelectorAll("button").forEach((button) => button.remove());
  // Hapus modal-modal
  tempDiv.querySelectorAll(".modal").forEach((modal) => modal.remove());

  // Style khusus untuk cetakan
  let printStyles = `
    <style>
      @media print {
        body { padding: 20px; }
        .btn, .modal { display: none !important; }
        .card { border: 1px solid #ddd; margin-bottom: 20px; }
        .badge { border: 1px solid #000; }
        img { max-width: 300px; }
      }
    </style>
  `;

  // Terapkan konten untuk dicetak
  document.body.innerHTML = printStyles + tempDiv.innerHTML;
  window.print();

  // Kembalikan konten asli
  document.body.innerHTML = originalContents;

  // Reinisialisasi event listeners
  location.reload();
}

// Fungsi untuk menampilkan alert
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alertHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertContainer.innerHTML = alertHTML;

  // Auto hide after 5 seconds
  setTimeout(() => {
    const alert = alertContainer.querySelector(".alert");
    if (alert) {
      alert.classList.remove("show");
      setTimeout(() => alert.remove(), 150);
    }
  }, 5000);
}

// Fungsi untuk format angka ke format rupiah
function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}
