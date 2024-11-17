// public/js/pegawai/create.js
document.addEventListener("DOMContentLoaded", function () {
  const pegawaiForm = document.getElementById("pegawaiForm");

  pegawaiForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const formData = {
        nama_pegawai: document.getElementById("namaPegawai").value,
        email_pegawai: document.getElementById("emailPegawai").value,
        password_pegawai: document.getElementById("passwordPegawai").value,
        nomor_telepon_pegawai: document.getElementById("nomorTelepon").value,
        tanggal_masuk_pegawai: document.getElementById("tanggalMasuk").value,
      };

      console.log("Sending data:", formData); // Untuk debugging

      const response = await fetch("/admin/pegawai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Terjadi kesalahan saat menyimpan data"
        );
      }

      alert("Data pegawai berhasil ditambahkan");
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

  // Validasi nomor telepon (hanya angka dan beberapa karakter khusus)
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

  // Validasi tanggal masuk (tidak boleh di masa depan)
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

  // Set max date untuk input tanggal ke hari ini
  const today = new Date().toISOString().split("T")[0];
  tanggalMasukInput.setAttribute("max", today);
});
