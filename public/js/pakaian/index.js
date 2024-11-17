// public/js/pakaian/index.js

// Initialize DOM elements
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const tbody = document.getElementById("productTableBody");
const rows = tbody.getElementsByTagName("tr");

// Functions
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alertHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertContainer.innerHTML = alertHTML;
}

function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  Array.from(rows).forEach((row) => {
    const nameCell = row.querySelector("td:first-child");
    if (!nameCell) return;

    const productName = nameCell.textContent.toLowerCase();
    const category = row.getAttribute("data-category");

    const matchesSearch = productName.includes(searchTerm);
    const matchesCategory = !selectedCategory || category === selectedCategory;

    row.style.display = matchesSearch && matchesCategory ? "" : "none";
  });
}

async function deleteProduct(productId) {
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
    if (result.status !== "success") {
      throw new Error(result.message || "Error deleting product");
    }

    const row = document.querySelector(`tr[data-id="${productId}"]`);
    if (row) {
      row.remove();
    }

    showAlert("Produk berhasil dihapus!");
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    showAlert(error.message, "danger");
    console.error("Error:", error);
  }
}

function changePage(page) {
  const url = new URL(window.location.href);
  url.searchParams.set("page", page);
  window.location.href = url.toString();
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  searchInput.addEventListener("input", filterProducts);
  categoryFilter.addEventListener("change", filterProducts);

  // Expose functions yang dibutuhkan secara global
  window.deleteProduct = deleteProduct;
  window.changePage = changePage;
});
