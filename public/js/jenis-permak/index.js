// public/js/jenis-permak/index.js

document.addEventListener("DOMContentLoaded", function () {
  // State untuk menyimpan data
  let state = {
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
      status: "",
      kategori: "",
      search: "",
    },
  };

  // Cache DOM Elements
  const elements = {
    searchInput: document.getElementById("searchInput"),
    statusFilter: document.getElementById("statusFilter"),
    kategoriFilter: document.getElementById("kategoriFilter"),
    tableBody: document.getElementById("layananTableBody"),
    pagination: document.getElementById("pagination"),
    totalItem: document.getElementById("totalItem"),
    modal: new bootstrap.Modal(document.getElementById("layananModal")),
    form: document.getElementById("layananForm"),
  };

  function updateTable(data = []) {
    if (!elements.tableBody) return;

    elements.tableBody.innerHTML = data
      .map(
        (item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.nama_permak}</td>
            <td>${item.KategoriPermak?.nama_kategori_permak || "-"}</td>
            <td>Rp ${formatNumber(item.harga)}</td>
            <td>
                <span class="badge ${
                  item.status_produk === "active"
                    ? "bg-success"
                    : "bg-secondary"
                }">
                    ${item.status_produk}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editLayanan(${
                      item.id_jenis_permak
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteLayanan(${
                      item.id_jenis_permak
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `
      )
      .join("");
  }

  function updatePagination(paginationData) {
    if (!elements.pagination) return;

    const { current_page, total_page, total_item } = paginationData;

    // Update total items
    if (elements.totalItem) {
      elements.totalItem.textContent = `${total_item} Hasil`;
    }

    // Build pagination
    let paginationHTML = "";

    // Previous button
    if (current_page > 1) {
      paginationHTML += `
          <li class="page-item">
              <button class="page-link" onclick="changePage(${
                current_page - 1
              })">
                  <i class="fas fa-chevron-left"></i>
              </button>
          </li>
      `;
    }

    // Page numbers
    for (let i = 1; i <= total_page; i++) {
      paginationHTML += `
          <li class="page-item ${i === current_page ? "active" : ""}">
              <button class="page-link" onclick="changePage(${i})">${i}</button>
          </li>
      `;
    }

    // Next button
    if (current_page < total_page) {
      paginationHTML += `
          <li class="page-item">
              <button class="page-link" onclick="changePage(${
                current_page + 1
              })">
                  <i class="fas fa-chevron-right"></i>
              </button>
          </li>
      `;
    }

    elements.pagination.innerHTML = paginationHTML;
  }

  // Tambahkan ini di bagian window functions
  window.changePage = function (page) {
    fetchLayanan(page);
  };

  // Helper Functions
  const helpers = {
    showAlert(message, type = "success") {
      const alertContainer = document.getElementById("alertContainer");
      const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
      alertContainer.innerHTML = alertHTML;
    },

    formatRupiah(amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    },

    debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    buildURL(endpoint) {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.append("page", state.currentPage);
      url.searchParams.append("limit", state.itemsPerPage);

      Object.entries(state.filters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });

      return url;
    },
  };

  // API Calls
  const api = {
    async fetchKategori() {
      try {
        const response = await fetch("/admin/kategori/permak", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const { data } = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching kategori:", error);
        helpers.showAlert("Gagal memuat data kategori", "danger");
        return [];
      }
    },

    async fetchLayanan() {
      try {
        const url = helpers.buildURL("/admin/permak");
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const { data } = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching layanan:", error);
        helpers.showAlert("Gagal memuat data layanan", "danger");
        return null;
      }
    },

    async saveLayanan(formData, id = null) {
      try {
        const url = id ? `/admin/permak/${id}` : "/admin/permak";
        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        helpers.showAlert(
          id ? "Layanan berhasil diperbarui" : "Layanan berhasil ditambahkan"
        );
        return true;
      } catch (error) {
        console.error("Error saving layanan:", error);
        helpers.showAlert(error.message, "danger");
        return false;
      }
    },

    async deleteLayanan(id) {
      try {
        const response = await fetch(`/admin/permak/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        helpers.showAlert("Layanan berhasil dihapus");
        return true;
      } catch (error) {
        console.error("Error deleting layanan:", error);
        helpers.showAlert(error.message, "danger");
        return false;
      }
    },
  };

  // UI Update Functions
  const ui = {
    populateKategoriDropdowns(kategoriList) {
      const formSelect = document.getElementById("kategoriLayanan");
      const filterSelect = elements.kategoriFilter;

      formSelect.innerHTML =
        '<option value="" disabled selected>Pilih Kategori</option>';
      filterSelect.innerHTML = '<option value="">Semua Kategori</option>';

      kategoriList.forEach((kategori) => {
        const optionHTML = `<option value="${kategori.id_kategori}">${kategori.nama_kategori}</option>`;
        formSelect.insertAdjacentHTML("beforeend", optionHTML);
        filterSelect.insertAdjacentHTML("beforeend", optionHTML);
      });
    },

    updateTable(jenisPermak = []) {
      elements.tableBody.innerHTML = jenisPermak
        .map(
          (item, index) => `
        <tr>
          <td>${(state.currentPage - 1) * state.itemsPerPage + index + 1}</td>
          <td>
            <div class="fw-bold">${item.nama_permak}</div>
          </td>
          <td>${item.KategoriPermak.nama_kategori_permak}</td>
          <td>${helpers.formatRupiah(item.harga)}</td>
          <td>
            <span class="badge ${
              item.status_produk === "active" ? "bg-success" : "bg-secondary"
            }">
              ${item.status_produk}
            </span>
          </td>
          <td>
            <div class="btn-group">
              <button onclick="editLayanan(${
                item.id_jenis_permak
              })" class="btn btn-outline-primary btn-sm">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteLayanan(${
                item.id_jenis_permak
              })" class="btn btn-outline-danger btn-sm">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
        )
        .join("");
    },

    updatePagination(paginationData) {
      const { current_page, total_page } = paginationData;

      const paginationHTML = [];

      if (current_page > 1) {
        paginationHTML.push(`
          <li class="page-item">
            <button class="page-link" onclick="changePage(${current_page - 1})">
              <i class="fas fa-chevron-left"></i>
            </button>
          </li>
        `);
      }

      for (let i = 1; i <= total_page; i++) {
        paginationHTML.push(`
          <li class="page-item ${i === current_page ? "active" : ""}">
            <button class="page-link" onclick="changePage(${i})">${i}</button>
          </li>
        `);
      }

      if (current_page < total_page) {
        paginationHTML.push(`
          <li class="page-item">
            <button class="page-link" onclick="changePage(${current_page + 1})">
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        `);
      }

      elements.pagination.innerHTML = paginationHTML.join("");
      elements.totalItem.textContent = `${paginationData.total_item} Hasil`;
    },
  };

  // Event Handlers
  const handlers = {
    async refreshData() {
      const data = await api.fetchLayanan();
      if (data) {
        ui.updateTable(data.jenis_permak);
        ui.updatePagination(data.pagination);
      }
    },

    showAddModal() {
      document.getElementById("modalTitle").textContent =
        "Tambah Layanan Permak";
      document.getElementById("layananId").value = "";
      elements.form.reset();
      elements.modal.show();
    },

    async editLayanan(id) {
      try {
        const response = await fetch(`/admin/permak/${id}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success" && data.data) {
          // Populate form
          document.getElementById("modalTitle").textContent =
            "Edit Layanan Permak";
          document.getElementById("layananId").value =
            data.data.id_jenis_permak;
          document.getElementById("namaLayanan").value = data.data.nama_permak;
          document.getElementById("kategoriLayanan").value =
            data.data.id_kategori_permak;
          document.getElementById("hargaLayanan").value = data.data.harga;
          document.getElementById("deskripsiLayanan").value =
            data.data.deskripsi_jenis_permak || "";
          document.getElementById("statusLayanan").value =
            data.data.status_produk;

          // Show modal
          const modal = new bootstrap.Modal(
            document.getElementById("layananModal")
          );
          modal.show();
        } else {
          throw new Error(data.message || "Gagal mengambil data layanan");
        }
      } catch (error) {
        console.error("Error fetching layanan details:", error);
        showAlert(error.message, "danger");
      }
    },

    async saveLayanan() {
      const id = document.getElementById("layananId").value;
      const formData = {
        nama_permak: document.getElementById("namaLayanan").value,
        id_kategori_permak: document.getElementById("kategoriLayanan").value,
        harga: document.getElementById("hargaLayanan").value,
        deskripsi_jenis_permak:
          document.getElementById("deskripsiLayanan").value,
        status_produk: document.getElementById("statusLayanan").value,
      };

      const success = await api.saveLayanan(formData, id);
      if (success) {
        elements.modal.hide();
        handlers.refreshData();
      }
    },

    async deleteLayanan(id) {
      if (!confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return;

      const success = await api.deleteLayanan(id);
      if (success) {
        handlers.refreshData();
      }
    },

    changePage(page) {
      state.currentPage = page;
      handlers.refreshData();
    },
  };

  // Bind Event Listeners
  function bindEvents() {
    elements.searchInput.addEventListener(
      "input",
      helpers.debounce(() => {
        state.filters.search = elements.searchInput.value;
        state.currentPage = 1;
        handlers.refreshData();
      }, 500)
    );

    elements.statusFilter.addEventListener("change", () => {
      state.filters.status = elements.statusFilter.value;
      state.currentPage = 1;
      handlers.refreshData();
    });

    elements.kategoriFilter.addEventListener("change", () => {
      state.filters.kategori = elements.kategoriFilter.value;
      state.currentPage = 1;
      handlers.refreshData();
    });
  }

  // Initialize
  async function init() {
    const kategoriList = await api.fetchKategori();
    ui.populateKategoriDropdowns(kategoriList);
    bindEvents();
    handlers.refreshData();
  }

  // Expose necessary functions to window
  window.showAddLayananModal = handlers.showAddModal;
  window.editLayanan = handlers.editLayanan;
  window.saveLayanan = handlers.saveLayanan;
  window.deleteLayanan = handlers.deleteLayanan;
  window.changePage = handlers.changePage;

  // Start the app
  init();
});
