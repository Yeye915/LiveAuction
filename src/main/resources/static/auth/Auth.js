// ==========================================
// Cấu hình URL Backend API (Tự động thích ứng với localhost và Ngrok)
// ==========================================
const API_BASE_URL = "/api/auth";

document.addEventListener("DOMContentLoaded", () => {
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  tabLogin?.addEventListener("click", () => switchTab("login"));
  tabRegister?.addEventListener("click", () => switchTab("register"));

  function switchTab(tab) {
    if (tab === "login") {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      loginForm.classList.add("active");
      registerForm.classList.remove("active");
    } else {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      registerForm.classList.add("active");
      loginForm.classList.remove("active");
    }
  }

  // ==========================================
  // BẬT / TẮT ẨN HIỆN MẬT KHẨU
  // ==========================================
  const pwToggleBtns = document.querySelectorAll(".btn-toggle-pw");
  pwToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-regular fa-eye-slash";
      } else {
        input.type = "password";
        icon.className = "fa-regular fa-eye";
      }
    });
  });

  // ==========================================
  // XỬ LÝ ĐĂNG NHẬP (ĐỒNG BỘ VỚI BIDDER.JS & AUCTIONEER.JS)
  // ==========================================
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Chuẩn hóa role từ server (chống lỗi lệch chữ hoa/thường)
        const roleUpper = (data.role || "").toUpperCase();
        const isAuctioneer = roleUpper === "AUCTIONEER" || roleUpper === "ADMIN";

        // ĐÓNG GÓI THÀNH OBJECT CURRENTUSER ĐỂ CÁC FILE JS KHÁC ĐỌC ĐƯỢC CHÍNH XÁC
        const currentUser = {
          id: data.userId || data.id || username,
          name: data.displayName || data.fullName || data.username || username,
          role: isAuctioneer ? "Đấu giá viên" : "Khách hàng",
          roleCode: roleUpper,
          avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          defaultBg: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80"
        };

        // Lưu vào localStorage theo đúng key chuẩn
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("token", data.token || "");

        showModal(
            true,
            "Đăng nhập thành công!",
            `Chào mừng <strong>${currentUser.name}</strong> quay trở lại Elite Auction.`,
        );

        // Chuyển hướng theo Quyền (Role) kèm ID phòng mặc định 101
        setTimeout(() => {
          if (isAuctioneer) {
            window.location.href = "/auctioneer/Auctioneer.html?id=101";
          } else {
            window.location.href = "/bidder/Bidder.html?id=101";
          }
        }, 1200);
      } else {
        showModal(
            false,
            "Đăng nhập thất bại!",
            data.message || "Tên đăng nhập hoặc mật khẩu không chính xác.",
        );
      }
    } catch (error) {
      showModal(
          false,
          "Lỗi kết nối!",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend!",
      );
    }
  });

  // ==========================================
  // XỬ LÝ ĐĂNG KÝ (GỌI API BACKEND)
  // ==========================================
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPw = document.getElementById("regConfirmPassword").value;

    if (password !== confirmPw) {
      showModal(
          false,
          "Đăng ký thất bại!",
          "Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại.",
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          displayName: username,
          fullName: username,
          role: "BIDDER"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showModal(
            true,
            "Tạo tài khoản thành công!",
            `Tài khoản <strong>${username}</strong> đã khởi tạo thành công. Đang tự động chuyển sang trang Đăng nhập...`,
        );

        registerForm.reset();
        setTimeout(() => {
          closeModal();
          switchTab("login");
          document.getElementById("loginUsername").value = username;
        }, 1500);
      } else {
        showModal(
            false,
            "Đăng ký thất bại!",
            data.message || "Tên đăng nhập đã tồn tại hoặc dữ liệu không hợp lệ.",
        );
      }
    } catch (error) {
      showModal(
          false,
          "Lỗi kết nối!",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend!",
      );
    }
  });

  // ==========================================
  // QUẢN LÝ MODAL THÔNG BÁO
  // ==========================================
  const modalOverlay = document.getElementById("authModal");
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const btnCloseModal = document.getElementById("btnCloseModal");

  function showModal(isSuccess, title, message) {
    if (isSuccess) {
      modalIcon.className = "modal-icon success-icon";
      modalIcon.innerHTML = '<i class="fa-solid fa-trophy"></i>';
    } else {
      modalIcon.className = "modal-icon error-icon";
      modalIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
    }

    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modalOverlay.classList.add("active");
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
  }

  btnCloseModal?.addEventListener("click", closeModal);
});