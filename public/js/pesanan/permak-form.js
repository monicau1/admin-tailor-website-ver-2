// public/js/pesanan/permak-form.js

// Taruh function setupFormValidation di sini, sebelum DOMContentLoaded
function setupFormValidation() {
  const form = document.getElementById("permakForm");

  // Disable HTML5 default validation
  form.setAttribute("novalidate", true);

  // Add custom validation on form fields
  const requiredFields = form.querySelectorAll("[required]");
  requiredFields.forEach((field) => {
    field.addEventListener("blur", function () {
      validateField(this);
    });
  });
}

// Helper function untuk validasi field
function validateField(field) {
  const isValid = field.checkValidity();
  field.classList.toggle("is-invalid", !isValid);
  field.classList.toggle("is-valid", isValid);

  // Update feedback message if exists
  const feedbackElement = field.nextElementSibling;
  if (
    feedbackElement &&
    feedbackElement.classList.contains("invalid-feedback")
  ) {
    feedbackElement.textContent = field.validationMessage;
  }

  return isValid;
}

document.addEventListener("DOMContentLoaded", function () {
  setupCustomerTypeToggle();
  setupFormValidation();
  setupImagePreviews();
  updateProgress(1);
});

// Global variables
let currentStep = 1;
const totalSteps = 4;

// Customer type toggle
function setupCustomerTypeToggle() {
  const existingForm = document.getElementById("existingCustomerForm");
  const newForm = document.getElementById("newCustomerForm");

  document.querySelectorAll('[name="customerType"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.id === "existingCustomer") {
        existingForm.classList.remove("d-none");
        newForm.classList.add("d-none");
      } else {
        existingForm.classList.add("d-none");
        newForm.classList.remove("d-none");
      }
    });
  });
}

// Navigation functions
function updateProgress(step) {
  const progress = (step / totalSteps) * 100;
  document.getElementById("progressBar").style.width = `${progress}%`;
}

function showStep(step) {
  document
    .querySelectorAll(".step")
    .forEach((el) => el.classList.add("d-none"));
  document.getElementById(`step${step}`).classList.remove("d-none");
  updateProgress(step);
}

function nextStep() {
  if (!validateCurrentStep()) return;

  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

// Validation functions
function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      return validateCustomerStep();
    case 2:
      return validateItemsStep();
    case 3:
      return validateShippingStep();
    case 4:
      return validatePaymentStep();
    default:
      return true;
  }
}

function validateCustomerStep() {
  const isNewCustomer = document.getElementById("newCustomer").checked;

  if (isNewCustomer) {
    const nama = document.querySelector('[name="nama_pelanggan"]').value;
    const telepon = document.querySelector(
      '[name="nomor_telepon_pelanggan"]'
    ).value;

    if (!nama || !telepon) {
      showAlert("Nama dan nomor telepon wajib diisi!", "danger");
      return false;
    }
  } else {
    const pelangganId = document.querySelector('[name="id_pelanggan"]').value;
    if (!pelangganId) {
      showAlert("Silakan pilih pelanggan!", "danger");
      return false;
    }
  }
  return true;
}

function validateItemsStep() {
  const items = document.querySelectorAll(".item-permak");
  if (items.length === 0) {
    showAlert("Minimal harus ada satu item permak!", "danger");
    return false;
  }

  for (let item of items) {
    const kategori = item.querySelector('[name="kategori_permak"]').value;
    const jenis = item.querySelector('[name="jenis_permak"]').value;
    const lokasi = item.querySelector('[name="lokasi_perbaikan"]').value;
    const foto = item.querySelector('[name="gambar_permak"]').files[0];

    if (!kategori || !jenis || !lokasi || !foto) {
      showAlert("Semua field item permak wajib diisi!", "danger");
      return false;
    }
  }
  return true;
}

function validateShippingStep() {
  const requiredFields = [
    "alamat_jalan",
    "kecamatan",
    "kode_pos",
    "provinsi",
    "jasa_pengiriman",
    "biaya_pengiriman",
  ];

  for (let field of requiredFields) {
    const element = document.querySelector(`[name="${field}"]`);
    if (!element.value) {
      showAlert("Semua field pengiriman wajib diisi!", "danger");
      return false;
    }
  }
  return true;
}

function validatePaymentStep() {
  const metodePembayaran = document.querySelector(
    '[name="metode_pembayaran"]'
  ).value;
  const statusPembayaran = document.querySelector(
    '[name="status_pembayaran"]'
  ).value;

  if (!metodePembayaran || !statusPembayaran) {
    showAlert("Metode dan status pembayaran wajib dipilih!", "danger");
    return false;
  }

  if (statusPembayaran === "paid") {
    const buktiPembayaran = document.querySelector('[name="bukti_pembayaran"]')
      .files[0];
    if (!buktiPembayaran) {
      showAlert(
        "Bukti pembayaran wajib diupload untuk status Sudah Dibayar!",
        "danger"
      );
      return false;
    }
  }
  return true;
}

// Item management
function addItem() {
  const container = document.getElementById("itemContainer");
  const template = document.getElementById("itemTemplate");
  const noItemMessage = document.getElementById("noItemMessage");

  const newItem = template.content.cloneNode(true);
  const itemCount = container.children.length + 1;

  newItem.querySelector(".item-number").textContent = itemCount;

  container.appendChild(newItem);
  noItemMessage.classList.add("d-none");
  setupImagePreviewForItem(container.lastElementChild);
  updateTotalBiaya();
}

function removeItem(button) {
  const item = button.closest(".item-permak");
  const container = document.getElementById("itemContainer");

  item.remove();

  // Update item numbers
  container.querySelectorAll(".item-number").forEach((span, index) => {
    span.textContent = index + 1;
  });

  if (container.children.length === 0) {
    document.getElementById("noItemMessage").classList.remove("d-none");
  }

  updateTotalBiaya();
}

async function updateJenisPermak(selectElement) {
  const kategoriId = selectElement.value;
  const itemCard = selectElement.closest(".item-permak");
  const jenisSelect = itemCard.querySelector('[name="jenis_permak"]');
  const hargaElement = itemCard.querySelector(".harga-permak");

  jenisSelect.innerHTML = '<option value="">Loading...</option>';
  jenisSelect.disabled = true;

  try {
    const response = await fetch(
      `/admin/pesanan/permak/kategori/${kategoriId}/jenis`
    );

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Response was not JSON");
    }

    const result = await response.json();

    // Validasi response
    if (result.status === "error") {
      throw new Error(result.message);
    }

    const jenisList = result.data || [];

    jenisSelect.innerHTML = '<option value="">Pilih jenis permak</option>';
    jenisList.forEach((jenis) => {
      jenisSelect.add(
        new Option(
          `${jenis.nama_permak} - Rp ${formatNumber(jenis.harga)}`,
          jenis.id_jenis_permak
        )
      );
    });

    jenisSelect.disabled = false;

    // Add change event for harga update
    jenisSelect.onchange = function () {
      const selectedJenis = jenisList.find(
        (j) => j.id_jenis_permak === parseInt(this.value)
      );
      if (selectedJenis) {
        hargaElement.textContent = `Rp ${formatNumber(selectedJenis.harga)}`;
        updateTotalBiaya();
      }
    };
  } catch (error) {
    console.error("Error fetching jenis permak:", error);
    jenisSelect.innerHTML = '<option value="">Error loading data</option>';
    jenisSelect.disabled = true;
    showAlert("Gagal memuat data jenis permak: " + error.message, "danger");
  }
}

// Image preview
function setupImagePreviews() {
  document
    .querySelector('[name="bukti_pembayaran"]')
    .addEventListener("change", function (e) {
      const preview = this.parentElement.querySelector(".img-preview");
      const previewContainer =
        this.parentElement.querySelector(".preview-container");

      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          previewContainer.classList.remove("d-none");
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
}

function setupImagePreviewForItem(item) {
  const fileInput = item.querySelector('[name="gambar_permak"]');
  fileInput.addEventListener("change", function (e) {
    const preview = this.parentElement.querySelector(".img-preview");
    const previewContainer =
      this.parentElement.querySelector(".preview-container");

    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        previewContainer.classList.remove("d-none");
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

// Helper functions
function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

function updateTotalBiaya() {
  let totalBiayaPermak = 0;
  document.querySelectorAll(".harga-permak").forEach((el) => {
    const harga = parseInt(el.textContent.replace(/\D/g, "")) || 0;
    totalBiayaPermak += harga;
  });

  const biayaPengiriman = parseInt(
    document.querySelector('[name="biaya_pengiriman"]')?.value || 0
  );
  const totalPembayaran = totalBiayaPermak + biayaPengiriman;

  document.getElementById("totalBiayaPermak").textContent = `Rp ${formatNumber(
    totalBiayaPermak
  )}`;
  document.getElementById("biayaPengiriman").textContent = `Rp ${formatNumber(
    biayaPengiriman
  )}`;
  document.getElementById("totalPembayaran").textContent = `Rp ${formatNumber(
    totalPembayaran
  )}`;
}

function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
  alertContainer.innerHTML = alert;
}

// Setup form submission
document
  .getElementById("permakForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    const formData = new FormData();

    // Add customer data
    const isNewCustomer = document.getElementById("newCustomer").checked;
    if (isNewCustomer) {
      formData.append(
        "nama_pelanggan",
        document.querySelector('[name="nama_pelanggan"]').value
      );
      formData.append(
        "nomor_telepon_pelanggan",
        document.querySelector('[name="nomor_telepon_pelanggan"]').value
      );
      formData.append(
        "email_pelanggan",
        document.querySelector('[name="email_pelanggan"]').value
      );
    } else {
      formData.append(
        "id_pelanggan",
        document.querySelector('[name="id_pelanggan"]').value
      );
    }

    // Add items data
    document.querySelectorAll(".item-permak").forEach((item, index) => {
      formData.append(
        `items[${index}][kategori_permak]`,
        item.querySelector('[name="kategori_permak"]').value
      );
      formData.append(
        `items[${index}][jenis_permak]`,
        item.querySelector('[name="jenis_permak"]').value
      );
      formData.append(
        `items[${index}][lokasi_perbaikan]`,
        item.querySelector('[name="lokasi_perbaikan"]').value
      );
      formData.append(
        `items[${index}][deskripsi_perbaikan]`,
        item.querySelector('[name="deskripsi_perbaikan"]').value
      );
      formData.append(
        `items[${index}][catatan]`,
        item.querySelector('[name="catatan"]').value
      );

      const fotoFile = item.querySelector('[name="gambar_permak"]').files[0];
      if (fotoFile) {
        formData.append(`gambar_permak`, fotoFile); // Ubah nama field
      }
    });

    // Add shipping data
    const shippingFields = [
      "alamat_jalan",
      "kecamatan",
      "kode_pos",
      "provinsi",
      "jasa_pengiriman",
      "biaya_pengiriman",
    ];
    shippingFields.forEach((field) => {
      formData.append(
        `pengiriman[${field}]`,
        document.querySelector(`[name="${field}"]`).value
      );
    });

    // Add payment data
    formData.append(
      "pembayaran[metode_pembayaran]",
      document.querySelector('[name="metode_pembayaran"]').value
    );
    formData.append(
      "pembayaran[status_pembayaran]",
      document.querySelector('[name="status_pembayaran"]').value
    );

    // Add payment data
    const buktiFile = document.querySelector('[name="bukti_pembayaran"]')
      .files[0];
    if (buktiFile) {
      formData.append("bukti_pembayaran", buktiFile); // Ubah nama field
    }

    try {
      const response = await fetch("/admin/pesanan/permak", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan");
      }

      showAlert("Pesanan berhasil dibuat!");
      setTimeout(() => {
        window.location.href = `/admin/pesanan/permak/${result.data.id_pesanan}`;
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      showAlert(error.message, "danger");
    }
  });

// Add event listener for shipping cost changes
document
  .querySelector('[name="biaya_pengiriman"]')
  .addEventListener("input", updateTotalBiaya);
