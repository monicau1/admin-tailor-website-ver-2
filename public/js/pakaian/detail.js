// public/js/pakaian/detail.js

// State management
let variants = [];

// DOM elements
const variantForm = document.getElementById("variantForm");
const variantTable = document
  .getElementById("variantTable")
  .getElementsByTagName("tbody")[0];
const productForm = document.getElementById("productForm");
const deleteButton = document.getElementById("deleteProduct");
const productId = document.getElementById("productId").value;

// Initialize variants dari data yang sudah ada
function initializeVariants() {
  const existingRows = variantTable.getElementsByTagName("tr");
  Array.from(existingRows).forEach((row) => {
    const cells = row.getElementsByTagName("td");
    variants.push({
      ukuran: cells[1].textContent.trim(),
      warna: cells[2].textContent.trim(),
      stok: parseInt(cells[3].textContent),
      kode_sku: cells[4].textContent.trim(),
    });
  });
}

function addVariant(e) {
  e.preventDefault();

  const size = document.getElementById("variantSize").value;
  const color = document.getElementById("variantColor").value;
  const stock = parseInt(document.getElementById("variantStock").value);

  variants.push({
    ukuran: size,
    warna: color,
    stok: stock,
  });

  updateVariantTable();
  variantForm.reset();
}

function removeVariant(index) {
  variants.splice(index, 1);
  updateVariantTable();
}

function updateVariantTable() {
  variantTable.innerHTML = "";

  variants.forEach((variant, index) => {
    const row = variantTable.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${variant.ukuran}</td>
      <td>${variant.warna}</td>
      <td>${variant.stok}</td>
      <td>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeVariant(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
  });
}

async function updateProduct(e) {
  e.preventDefault();

  if (variants.length === 0) {
    alert("Minimal harus ada satu varian produk!");
    return;
  }

  const formData = {
    nama_pakaian: document.getElementById("productName").value,
    deskripsi_pakaian: document.getElementById("productDescription").value,
    harga: parseFloat(document.getElementById("productPrice").value),
    id_kategori_pakaian: parseInt(document.getElementById("category").value),
    berat: parseFloat(document.getElementById("weight").value) || null,
    status_produk: document.getElementById("status").value,
    varian_pakaian: variants,
  };

  try {
    const response = await fetch(`/admin/pakaian/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengupdate produk");
    }

    alert("Produk berhasil diperbarui!");
    window.location.reload();
  } catch (error) {
    alert(error.message);
    console.error("Error:", error);
  }
}

async function deleteProduct() {
  if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    return;
  }

  try {
    const response = await fetch(`/admin/pakaian/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menghapus produk");
    }

    alert("Produk berhasil dihapus!");
    window.location.href = "/admin/pakaian";
  } catch (error) {
    alert(error.message);
    console.error("Error:", error);
  }
}

// Validation functions
function validatePrice(price) {
  return !isNaN(price) && price > 0;
}

function validateRequiredFields(formData) {
  if (!formData.nama_pakaian) {
    throw new Error("Nama produk harus diisi");
  }
  if (!validatePrice(formData.harga)) {
    throw new Error("Harga produk harus valid");
  }
  if (!formData.id_kategori_pakaian) {
    throw new Error("Kategori harus dipilih");
  }
}

// Form helper functions
function resetForm() {
  productForm.reset();
  variants = [];
  updateVariantTable();
}

function showLoadingState(isLoading) {
  const submitButton = productForm.querySelector('button[type="submit"]');
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  } else {
    submitButton.disabled = false;
    submitButton.innerHTML = "Update Product";
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  initializeVariants();

  variantForm.addEventListener("submit", addVariant);
  productForm.addEventListener("submit", updateProduct);
  deleteButton.addEventListener("click", deleteProduct);

  // Form validation listeners
  document.getElementById("productPrice").addEventListener("input", (e) => {
    const price = parseFloat(e.target.value);
    if (!validatePrice(price)) {
      e.target.classList.add("is-invalid");
    } else {
      e.target.classList.remove("is-invalid");
    }
  });

  // Expose functions yang dibutuhkan secara global
  window.removeVariant = removeVariant;
});
