// /public/js/pelanggan/edit.js

// Counter untuk id alamat baru
let newAddressCounter = 0;

// Fungsi untuk memulai mode edit
function startEdit() {
  window.location.href = `/admin/pelanggan/${PELANGGAN_ID}?edit=true`;
}

// Fungsi untuk membatalkan edit
function cancelEdit() {
  window.location.href = `/admin/pelanggan/${PELANGGAN_ID}`;
}

// Fungsi untuk menambah alamat baru
function addNewAddress() {
  const template = document.getElementById("newAddressTemplate").innerHTML;
  const container = document.getElementById("alamatContainer");
  const noAddressMessage = document.getElementById("noAddressMessage");

  if (noAddressMessage) {
    noAddressMessage.remove();
  }

  // Tambahkan pembatas jika sudah ada alamat sebelumnya
  if (container.children.length > 0) {
    const hr = document.createElement("hr");
    container.appendChild(hr);
  }

  // Tambahkan form alamat baru
  const newAddress = template.replace(/{INDEX}/g, newAddressCounter++);
  container.insertAdjacentHTML("beforeend", newAddress);
}

// Fungsi untuk menghapus alamat yang sudah ada
function removeAddress(addressId) {
  const addressElement = document.getElementById(`alamat-${addressId}`);
  const hr = addressElement.nextElementSibling;

  if (hr && hr.tagName === "HR") {
    hr.remove();
  } else {
    const prevHr = addressElement.previousElementSibling;
    if (prevHr && prevHr.tagName === "HR") {
      prevHr.remove();
    }
  }

  addressElement.remove();
  checkNoAddress();
}

// Fungsi untuk menghapus alamat baru
function removeNewAddress(index) {
  const addressElement = document.getElementById(`alamat-new-${index}`);
  const hr = addressElement.nextElementSibling;

  if (hr && hr.tagName === "HR") {
    hr.remove();
  } else {
    const prevHr = addressElement.previousElementSibling;
    if (prevHr && prevHr.tagName === "HR") {
      prevHr.remove();
    }
  }

  addressElement.remove();
  checkNoAddress();
}

// Fungsi untuk memeriksa apakah perlu menampilkan pesan "tidak ada alamat"
function checkNoAddress() {
  const container = document.getElementById("alamatContainer");
  if (container.children.length === 0) {
    container.innerHTML =
      '<p class="text-muted mb-0" id="noAddressMessage">Belum ada alamat yang terdaftar</p>';
  }
}

// Fungsi untuk mengumpulkan data alamat
function collectAddressData() {
  const addressForms = document.querySelectorAll(".alamat-form");
  const addresses = [];

  addressForms.forEach((form) => {
    const formData = new FormData(form);
    const addressData = {
      alamat_jalan: formData.get("alamat_jalan"),
      kecamatan: formData.get("kecamatan"),
      provinsi: formData.get("provinsi"),
      kode_pos: formData.get("kode_pos"),
      negara: formData.get("negara"),
    };

    // Tambahkan id jika ini alamat yang sudah ada
    const idAlamat = formData.get("id_alamat_pelanggan");
    if (idAlamat) {
      addressData.id_alamat_pelanggan = idAlamat;
    }

    addresses.push(addressData);
  });

  return addresses;
}

// Validasi JavaScript di sisi client untuk email
const emailInput = document.getElementById("emailPelanggan");
emailInput.addEventListener("input", function () {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(this.value)) {
    this.setCustomValidity("Format email tidak valid");
  } else {
    this.setCustomValidity("");
  }
});

// Fungsi untuk validasi form
function validateForms() {
  const pelangganForm = document.getElementById("pelangganForm");
  const addressForms = document.querySelectorAll(".alamat-form");

  // Validasi form pelanggan
  if (!pelangganForm.checkValidity()) {
    pelangganForm.reportValidity();
    return false;
  }

  // Validasi semua form alamat
  for (let form of addressForms) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
  }

  return true;
}

// Fungsi untuk menyimpan perubahan
async function savePelanggan() {
  if (!validateForms()) {
    return;
  }

  try {
    const pelangganForm = document.getElementById("pelangganForm");
    const formData = new FormData(pelangganForm);

    const pelangganData = {
      nama_pelanggan: formData.get("nama_pelanggan"),
      email_pelanggan: formData.get("email_pelanggan"),
      nomor_telepon_pelanggan: formData.get("nomor_telepon_pelanggan"),
      alamat_pelanggan: collectAddressData(),
    };

    const response = await fetch(`/admin/pelanggan/${PELANGGAN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pelangganData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Terjadi kesalahan saat menyimpan data"
      );
    }

    // Tampilkan pesan sukses
    showAlert("success", "Data pelanggan berhasil diperbarui");

    // Redirect ke halaman detail setelah 1 detik
    setTimeout(() => {
      window.location.href = `/admin/pelanggan/${PELANGGAN_ID}`;
    }, 1000);
  } catch (error) {
    console.error("Error:", error);
    showAlert("danger", error.message);
  }
}

// Fungsi untuk menangani penghapusan pelanggan
async function deletePelanggan() {
  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  modal.show();

  document.getElementById("confirmDelete").onclick = async () => {
    try {
      const response = await fetch(`/admin/pelanggan/${PELANGGAN_ID}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Terjadi kesalahan saat menghapus data"
        );
      }

      showAlert("success", "Data pelanggan berhasil dihapus");

      // Redirect ke daftar pelanggan setelah 1 detik
      setTimeout(() => {
        window.location.href = "/admin/pelanggan";
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      showAlert("danger", error.message);
    } finally {
      modal.hide();
    }
  };
}

// Fungsi utilitas untuk menampilkan alert
function showAlert(type, message) {
  const alertContainer = document.getElementById("alertContainer");
  const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
  alertContainer.innerHTML = alertHtml;

  // Auto hide after 5 seconds
  setTimeout(() => {
    const alert = alertContainer.querySelector(".alert");
    if (alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }
  }, 5000);
}
