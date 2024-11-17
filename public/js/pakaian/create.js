// public/js/pakaian/create.js

// State management
let variants = [];
let variantCount = 0;

// DOM elements
const variantForm = document.getElementById("variantForm");
const variantTable = document
  .getElementById("variantTable")
  .getElementsByTagName("tbody")[0];
const productForm = document.getElementById("productForm");

// Helper Functions
function showLoadingState(isLoading) {
  const submitButton = productForm.querySelector('button[type="submit"]');
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menyimpan...';
  } else {
    submitButton.disabled = false;
    submitButton.innerHTML = "Simpan";
  }
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

  const newRow = variantTable.insertRow();
  variantCount++;

  newRow.innerHTML = `
    <td>${variantCount}</td>
    <td>${size}</td>
    <td>${color}</td>
    <td>${stock}</td>
    <td>''</td>
    <td>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeVariant(${
        variantCount - 1
      })">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;

  variantForm.reset();
}

function removeVariant(index) {
  variants.splice(index, 1);
  updateVariantTable();
}

function updateVariantTable() {
  variantTable.innerHTML = "";
  variantCount = 0;

  variants.forEach((variant, index) => {
    const row = variantTable.insertRow();
    variantCount++;

    row.innerHTML = `
      <td>${variantCount}</td>
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

async function saveProduct(e) {
  e.preventDefault();

  if (variants.length === 0) {
    alert("Minimal harus menambahkan satu varian produk!");
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
    showLoadingState(true);

    const response = await fetch("/admin/pakaian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    alert(
      "Produk berhasil ditambahkan! Anda akan diarahkan ke halaman edit untuk menambahkan gambar."
    );
    window.location.href = `/admin/pakaian/${result.data.id_pakaian}`;
  } catch (error) {
    alert(error.message);
    console.error("Error:", error);
  } finally {
    showLoadingState(false);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  variantForm.addEventListener("submit", addVariant);
  productForm.addEventListener("submit", saveProduct);

  // Expose functions yang dibutuhkan secara global
  window.removeVariant = removeVariant;
});
