// public/js/pesanan/detail.js
document.addEventListener("DOMContentLoaded", function () {
  // Format semua currency di halaman
  formatCurrencies();

  // Set min date untuk estimasi
  const estimasiInput = document.getElementById("estimasiSelesai");
  if (estimasiInput) {
    const today = new Date().toISOString().split("T")[0];
    estimasiInput.setAttribute("min", today);
  }
});

// Handler untuk membuka modal update status
window.openUpdateStatusModal = function () {
  const modal = new bootstrap.Modal(
    document.getElementById("updateStatusModal")
  );
  modal.show();
};

// Handler untuk menyimpan status
window.saveStatus = async function () {
  const pesananId = document.getElementById("pesananId").value;
  const status = document.getElementById("statusPesanan").value;
  const estimasiSelesai = document.getElementById("estimasiSelesai").value;
  const catatan = document.getElementById("catatanStatus").value;

  try {
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
      throw new Error(result.message || "Terjadi kesalahan saat update status");
    }

    // Tampilkan alert success
    showAlert("success", "Status pesanan berhasil diperbarui");

    // Reload halaman setelah 1 detik
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    showAlert("danger", error.message);
    console.error("Error:", error);
  }
};

// Handler untuk update status item
window.updateItemStatus = async function (itemId, status) {
  try {
    const response = await fetch(`/admin/pesanan/item/${itemId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Terjadi kesalahan saat update status item"
      );
    }

    showAlert("success", "Status item berhasil diperbarui");

    // Reload halaman setelah 1 detik
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    showAlert("danger", error.message);
    console.error("Error:", error);
  }
};

// Handler untuk preview gambar
window.viewImage = function (imagePath) {
  const modal = new bootstrap.Modal(document.getElementById("imageModal"));
  const modalImage = document.getElementById("modalImage");
  modalImage.src = imagePath.startsWith("/") ? imagePath : "/" + imagePath;
  modal.show();
};

// Handler untuk print invoice
window.printInvoice = function () {
  const pesananId = document.getElementById("pesananId").value;
  window.open(`/pesanan/${pesananId}/invoice`, "_blank");
};

// Helper Functions
function formatCurrencies() {
  document.querySelectorAll(".currency").forEach((element) => {
    const value = parseFloat(element.textContent);
    element.textContent = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  });
}

function showAlert(type, message) {
  const alertContainer = document.getElementById("alertContainer");
  const alertHtml = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertContainer.innerHTML = alertHtml;

  // Auto hide alert after 5 seconds
  setTimeout(() => {
    const alert = alertContainer.querySelector(".alert");
    if (alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }
  }, 5000);
}
