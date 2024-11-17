// public/js/pelanggan/create.js
document.addEventListener("DOMContentLoaded", function () {
  // Fungsi untuk validasi form
  function validateForm() {
    const form = document.getElementById("pelangganForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
    return true;
  }

  // Fungsi untuk menampilkan alert
  function showAlert(type, message) {
    const alertContainer = document.getElementById("alertContainer");
    if (!alertContainer) {
      console.error("Alert container not found");
      return;
    }

    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertContainer.innerHTML = alertHtml;
  }

  // Validasi JavaScript di sisi client untuk email
  const emailInput = document.getElementById("emailPelanggan");
  let emailTimeout;

  // Tambahkan fungsi untuk mengecek email
  async function checkEmailAvailability(email) {
    try {
      const response = await fetch(
        `/admin/pelanggan/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (!response.ok) {
        emailInput.setCustomValidity("Email sudah terdaftar");
        return false;
      }

      emailInput.setCustomValidity("");
      return true;
    } catch (error) {
      console.error("Error checking email:", error);
      return true; // Biarkan form submit jika ada error pengecekan
    }
  }

  // Email validation
  emailInput.addEventListener("input", function () {
    clearTimeout(emailTimeout);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.value)) {
      this.setCustomValidity("Format email tidak valid");
    } else {
      // Tunggu user selesai mengetik baru cek ke server
      emailTimeout = setTimeout(() => {
        checkEmailAvailability(this.value);
      }, 500);
    }
  });

  // Event listener saat form di-submit
  document
    .getElementById("pelangganForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Cek email sekali lagi sebelum submit
      const emailInput = document.getElementById("emailPelanggan");
      const isEmailAvailable = await checkEmailAvailability(emailInput.value);

      if (!isEmailAvailable) {
        showAlert(
          "danger",
          "Email sudah terdaftar. Silakan gunakan email lain."
        );
        return;
      }

      try {
        const formData = new FormData(this);
        const data = {
          nama_pelanggan: formData.get("nama_pelanggan"),
          email_pelanggan: formData.get("email_pelanggan"),
          password_pelanggan: formData.get("password_pelanggan"),
          nomor_telepon_pelanggan: formData.get("nomor_telepon_pelanggan"),
          alamat_jalan: formData.get("alamat_jalan"),
          kecamatan: formData.get("kecamatan"),
          provinsi: formData.get("provinsi"),
          kode_pos: formData.get("kode_pos"),
          negara: formData.get("negara") || "Indonesia",
        };

        // Debug
        console.log("Sending data:", data);

        const response = await fetch("/admin/pelanggan/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Terjadi kesalahan saat menyimpan data"
          );
        }

        // Tampilkan pesan sukses
        showAlert("success", "Pelanggan berhasil ditambahkan");

        // Redirect ke daftar pelanggan setelah 1 detik
        setTimeout(() => {
          window.location.href = "/admin/pelanggan";
        }, 1000);
      } catch (error) {
        console.error("Error:", error);
        showAlert("danger", error.message);
      }
    });
});
