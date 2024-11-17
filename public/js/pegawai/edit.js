// public/js/pegawai/edit.js
document.addEventListener("DOMContentLoaded", function () {
  const pegawaiForm = document.getElementById("pegawaiForm");
  const pegawaiId = document.getElementById("pegawaiId").value;

  pegawaiForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const formData = {
        nama_pegawai: document.getElementById("namaPegawai").value,
        email_pegawai: document.getElementById("emailPegawai").value,
        nomor_telepon_pegawai: document.getElementById("nomorTelepon").value,
        tanggal_masuk_pegawai: document.getElementById("tanggalMasuk").value,
      };

      // Tambahkan password hanya jika diisi
      const password = document.getElementById("passwordPegawai").value;
      if (password) {
        formData.password_pegawai = password;
      }

      const response = await fetch(`/admin/pegawai/${pegawaiId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Terjadi kesalahan saat mengupdate data"
        );
      }

      alert("Data pegawai berhasil diperbarui");
      window.location.href = "/admin/pegawai";
    } catch (error) {
      alert(error.message);
      console.error("Error:", error);
    }
  });

  // Validasi format email
  const emailInput = document.getElementById("emailPegawai");
  emailInput.addEventListener("input", function () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      this.setCustomValidity("Format email tidak valid");
    } else {
      this.setCustomValidity("");
    }
  });

  // Validasi nomor telepon
  const phoneInput = document.getElementById("nomorTelepon");
  phoneInput.addEventListener("input", function () {
    const phoneRegex = /^[0-9+\-\s()]*$/;
    if (!phoneRegex.test(this.value)) {
      this.setCustomValidity(
        "Nomor telepon hanya boleh berisi angka dan karakter + - ( )"
      );
    } else {
      this.setCustomValidity("");
    }
  });

  // Validasi tanggal masuk
  const tanggalMasukInput = document.getElementById("tanggalMasuk");
  tanggalMasukInput.addEventListener("input", function () {
    const selectedDate = new Date(this.value);
    const today = new Date();

    if (selectedDate > today) {
      this.setCustomValidity("Tanggal masuk tidak boleh di masa depan");
    } else {
      this.setCustomValidity("");
    }
  });
});

// Fungsi untuk menghapus pegawai
async function deletePegawai() {
  const pegawaiId = document.getElementById("pegawaiId").value;

  if (!confirm("Apakah Anda yakin ingin menghapus pegawai ini?")) {
    return;
  }

  try {
    const response = await fetch(`/admin/pegawai/${pegawaiId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Terjadi kesalahan saat menghapus data"
      );
    }

    alert("Pegawai berhasil dihapus");
    window.location.href = "/admin/pegawai";
  } catch (error) {
    alert(error.message);
    console.error("Error:", error);
  }
}
