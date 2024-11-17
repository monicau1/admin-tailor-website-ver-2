// public/js/pesanan/pakaian-form.js

document.addEventListener("DOMContentLoaded", function () {
  setupCustomerTypeToggle();
  setupFormListeners();
});

// Toggle antara pelanggan baru dan lama
function setupCustomerTypeToggle() {
  const existingForm = document.getElementById("existingCustomerForm");
  const newForm = document.getElementById("newCustomerForm");

  document.querySelectorAll('[name="customerType"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.id === "existingCustomer") {
        existingForm.classList.remove("d-none");
        newForm.classList.add("d-none");
        // Reset form pelanggan baru
        newForm
          .querySelectorAll("input")
          .forEach((input) => (input.value = ""));
      } else {
        existingForm.classList.add("d-none");
        newForm.classList.remove("d-none");
        // Reset dropdown pelanggan
        document.querySelector('[name="id_pelanggan"]').value = "";
      }
    });
  });
}

// Tambah item pesanan
function addItem() {
  const container = document.getElementById("itemContainer");
  const template = document.getElementById("itemTemplate");
  const noItemMessage = document.getElementById("noItemMessage");

  const newItem = template.content.cloneNode(true);
  const itemCount = container.children.length + 1;

  newItem.querySelector(".item-number").textContent = itemCount;

  container.appendChild(newItem);
  noItemMessage.classList.add("d-none");
  updateTotalBiaya();
}

// Hapus item pesanan
function removeItem(button) {
  const item = button.closest(".item-pakaian");
  const container = document.getElementById("itemContainer");

  item.remove();

  // Update nomor item
  container.querySelectorAll(".item-number").forEach((span, index) => {
    span.textContent = index + 1;
  });

  if (container.children.length === 0) {
    document.getElementById("noItemMessage").classList.remove("d-none");
  }

  updateTotalBiaya();
}

// Update varian pakaian berdasarkan model yang dipilih
async function updateVarianPakaian(selectElement) {
  const id_pakaian = selectElement.value;
  const itemCard = selectElement.closest(".item-pakaian");
  const varianSelect = itemCard.querySelector('[name="id_varian_pakaian"]');
  const hargaElement = itemCard.querySelector(".harga-item");
  const kuantitasInput = itemCard.querySelector('[name="kuantitas"]');

  // Reset dan disable varian select
  varianSelect.innerHTML = '<option value="">Pilih varian</option>';
  varianSelect.disabled = true;

  if (!id_pakaian) {
    hargaElement.textContent = "Rp 0";
    updateTotalBiaya();
    return;
  }

  try {
    const response = await fetch(`/admin/pesanan/pakaian/varian/${id_pakaian}`);
    if (!response.ok) throw new Error("Gagal mengambil data varian");

    const result = await response.json();
    const varianList = result.data;

    // Populate varian options
    varianList.forEach((varian) => {
      const option = document.createElement("option");
      option.value = varian.id_varian_pakaian;
      option.textContent = `${varian.ukuran} - ${varian.warna} (Stok: ${varian.stok})`;
      option.dataset.stok = varian.stok;
      varianSelect.appendChild(option);
    });

    varianSelect.disabled = false;

    // Setup listeners untuk update harga
    varianSelect.onchange = () => updateItemSubtotal(itemCard);
    kuantitasInput.onchange = () => updateItemSubtotal(itemCard);
  } catch (error) {
    console.error("Error:", error);
    varianSelect.innerHTML = '<option value="">Error loading data</option>';
    showAlert("Gagal memuat data varian", "danger");
  }
}

// Update subtotal item dan total keseluruhan
function updateItemSubtotal(itemCard) {
  const pakaianSelect = itemCard.querySelector('[name="id_pakaian"]');
  const kuantitasInput = itemCard.querySelector('[name="kuantitas"]');
  const hargaElement = itemCard.querySelector(".harga-item");

  if (pakaianSelect.value && kuantitasInput.value) {
    const selectedOption = pakaianSelect.options[pakaianSelect.selectedIndex];
    const hargaText = selectedOption.textContent.split(" - Rp ")[1];
    const harga = parseInt(hargaText.replace(/\D/g, "")) || 0;
    const kuantitas = parseInt(kuantitasInput.value) || 0;

    const subtotal = harga * kuantitas;
    hargaElement.textContent = `Rp ${formatNumber(subtotal)}`;
  } else {
    hargaElement.textContent = "Rp 0";
  }

  updateTotalBiaya();
}

// Update total biaya keseluruhan
function updateTotalBiaya() {
  let totalBiaya = 0;
  document.querySelectorAll(".harga-item").forEach((el) => {
    const harga = parseInt(el.textContent.replace(/\D/g, "")) || 0;
    totalBiaya += harga;
  });

  const biayaPengiriman = parseInt(
    document.querySelector('[name="biaya_pengiriman"]')?.value || 0
  );
  const totalPembayaran = totalBiaya + biayaPengiriman;

  document.getElementById("totalBiayaPakaian").textContent = `Rp ${formatNumber(
    totalBiaya
  )}`;
  document.getElementById("biayaPengiriman").textContent = `Rp ${formatNumber(
    biayaPengiriman
  )}`;
  document.getElementById("totalPembayaran").textContent = `Rp ${formatNumber(
    totalPembayaran
  )}`;
}

// Setup form listeners
function setupFormListeners() {
  // Listen for changes in biaya pengiriman
  const biayaPengirimanInput = document.querySelector(
    '[name="biaya_pengiriman"]'
  );
  if (biayaPengirimanInput) {
    biayaPengirimanInput.addEventListener("input", updateTotalBiaya);
  }

  // Listen for form submission
  const form = document.getElementById("pakaianForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
}

// Handle form submission
async function handleSubmit(event) {
  event.preventDefault();

  try {
    const formData = new FormData(event.target);

    // Validasi dasar
    const items = document.querySelectorAll(".item-pakaian");
    if (items.length === 0) {
      showAlert("Minimal harus ada satu item pakaian", "danger");
      return;
    }

    const response = await fetch("/admin/pesanan/pakaian", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "success") {
      showAlert("Pesanan berhasil dibuat!", "success");
      setTimeout(() => {
        window.location.href = `/admin/pesanan/${result.data.id_pesanan}`;
      }, 1500);
    } else {
      throw new Error(result.message || "Gagal membuat pesanan");
    }
  } catch (error) {
    console.error("Error:", error);
    showAlert(error.message, "danger");
  }
}

// Utility functions
function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
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
