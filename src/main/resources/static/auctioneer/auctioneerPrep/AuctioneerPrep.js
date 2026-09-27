// ==========================================
// STATE MANAGEMENT
// ==========================================
const prepState = {
  auctioneer: {
    name: "Trần Minh Đức",
    role: "Đấu giá viên",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  // Dữ liệu đã thay đổi cấu trúc khớp với Modal Thêm mới
  products: [
    {
      id: "P01",
      name: "Tượng Rồng Phong Thủy",
      desc: "Chạm khắc thủ công",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80",
      material: "Đồng nguyên khối",
      size: "30x20x25 cm",
      condition: "Mới 100%",
      startPrice: 10000000,
    },
    {
      id: "P02",
      name: "Đồng hồ Rolex Submariner",
      desc: "Bản giới hạn",
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=200&q=80",
      material: "Thép không gỉ 904L",
      size: "Mặt 41mm",
      condition: "Đã qua SD 98%",
      startPrice: 120000000,
    },
    {
      id: "P03",
      name: "Vòng tay Ngọc Jadeite",
      desc: "Ngọc thiên nhiên",
      image:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=200&q=80",
      material: "Ngọc Jadeite type A",
      size: "Ni 54mm",
      condition: "Mới 100%",
      startPrice: 8000000,
    },
    {
      id: "P04",
      name: "Bình Gốm Bát Tràng",
      desc: "Vẽ tay men rạn",
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80",
      material: "Gốm sứ cao cấp",
      size: "Cao 45cm",
      condition: "Mới 100%",
      startPrice: 12000000,
    },
  ],
};

let deleteTargetId = null;
let camStream = null;
let micStream = null;

// ==========================================
// RENDERING LOGIC
// ==========================================
function formatCurrency(amount) {
  if (amount >= 1000000)
    return (amount / 1000000).toLocaleString("vi-VN") + " Tr";
  return amount.toLocaleString("vi-VN") + "đ";
}

function renderUserInfo() {
  document.getElementById("headerAvatar").src = prepState.auctioneer.avatar;
  document.getElementById("headerName").innerHTML =
    `${prepState.auctioneer.name} <i class="fa-solid fa-circle user-status-dot"></i>`;
  document.getElementById("sidebarAvatar").src = prepState.auctioneer.avatar;
  document.getElementById("sidebarName").innerHTML =
    `${prepState.auctioneer.name} <i class="fa-solid fa-circle-check text-green-500" style="font-size: 11px; color: #22c55e;"></i>`;
}

function renderProductList() {
  const tbody = document.getElementById("productListBody");
  document.getElementById("totalItemsDisplay").textContent =
    `Tổng: ${prepState.products.length} sản phẩm`;

  tbody.innerHTML = prepState.products
    .map(
      (p, idx) => `
      <tr>
        <td class="text-center"><strong>${String(idx + 1).padStart(2, "0")}</strong></td>
        <td><img src="${p.image}" class="prod-img"></td>
        <td>
          <div class="prod-info">
            <h4>${p.name}</h4><p>${p.desc}</p>
          </div>
        </td>
        <td>${p.material}</td>
        <td>${p.size}</td>
        <td><span class="status-badge">${p.condition}</span></td>
        <td class="price-text">${formatCurrency(p.startPrice)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon btn-edit" title="Sửa"><i class="fa-solid fa-pen" style="font-size: 10px;"></i></button>
            <button class="btn-icon btn-del" title="Xóa" onclick="openDeleteModal('${p.id}')"><i class="fa-regular fa-trash-can" style="font-size: 10px;"></i></button>
          </div>
        </td>
      </tr>
    `,
    )
    .join("");
}

// ==========================================
// DEVICE & HARDWARE LOGIC (WEBRTC)
// ==========================================
async function toggleCamera() {
  const btn = document.getElementById("btnTestCam");
  const video = document.getElementById("camPreview");
  const icon = document.getElementById("camIcon");
  const text = document.getElementById("camText");

  if (!camStream) {
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = camStream;
      video.style.display = "block";
      icon.style.display = "none";
      btn.classList.add("active");
      text.textContent = "Camera Đã Bật";
    } catch (err) {
      alert("Không thể truy cập Camera. Vui lòng kiểm tra quyền thiết bị!");
    }
  } else {
    camStream.getTracks().forEach((track) => track.stop());
    camStream = null;
    video.style.display = "none";
    icon.style.display = "block";
    btn.classList.remove("active");
    text.textContent = "Mở Camera";
  }
}

async function toggleMic() {
  const btn = document.getElementById("btnTestMic");
  const text = document.getElementById("micText");

  if (!micStream) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      btn.classList.add("active");
      text.textContent = "Mic Đã Bật";
    } catch (err) {
      alert("Không thể truy cập Micro. Vui lòng kiểm tra quyền thiết bị!");
    }
  } else {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
    btn.classList.remove("active");
    text.textContent = "Mở Mic";
  }
}

// ==========================================
// MODALS & EVENT BINDINGS
// ==========================================
function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById("deleteModal").classList.add("active");
}

function setupEvents() {
  // 1. Device Buttons
  document.getElementById("btnTestCam").addEventListener("click", toggleCamera);
  document.getElementById("btnTestMic").addEventListener("click", toggleMic);
  document.getElementById("btnSystemCheck").addEventListener("click", () => {
    alert("Hệ thống máy chủ đấu giá đang hoạt động ổn định (Ping: 12ms)");
  });

  // 2. Add Product Modal
  const addModal = document.getElementById("addProductModal");
  document
    .getElementById("btnAddProduct")
    .addEventListener("click", () => addModal.classList.add("active"));
  document
    .getElementById("btnCancelAdd")
    .addEventListener("click", () => addModal.classList.remove("active"));

  document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const newProduct = {
      id: "P" + Date.now(),
      image: document.getElementById("p_img").value,
      name: document.getElementById("p_name").value,
      desc: document.getElementById("p_desc").value,
      material: document.getElementById("p_material").value,
      size: document.getElementById("p_size").value,
      condition: document.getElementById("p_condition").value,
      startPrice: parseInt(document.getElementById("p_price").value),
    };
    prepState.products.push(newProduct);
    renderProductList();
    addModal.classList.remove("active");
    e.target.reset(); // Clear form
  });

  // 3. Delete Modal
  const delModal = document.getElementById("deleteModal");
  document
    .getElementById("btnCancelDelete")
    .addEventListener("click", () => delModal.classList.remove("active"));
  document.getElementById("btnConfirmDelete").addEventListener("click", () => {
    prepState.products = prepState.products.filter(
      (p) => p.id !== deleteTargetId,
    );
    renderProductList();
    delModal.classList.remove("active");
  });

  // 4. Start Live Modal
  const startModal = document.getElementById("startLiveModal");
  document.getElementById("btnStartLivePre").addEventListener("click", () => {
    if (!camStream || !micStream) {
      alert(
        "Vui lòng BẬT thiết bị Camera và Mic thật trước khi mở phiên Live!",
      );
      return;
    }
    startModal.classList.add("active");
  });
  document
    .getElementById("btnCancelStart")
    .addEventListener("click", () => startModal.classList.remove("active"));
  document.getElementById("btnConfirmStart").addEventListener("click", () => {
    alert("Đang chuyển hướng sang trang Live Stream!");
    startModal.classList.remove("active");
  });

  // 5. Logout Modal
  const logoutModal = document.getElementById("logoutModal");
  document
    .getElementById("btnLogout")
    .addEventListener("click", () => logoutModal.classList.add("active"));
  document
    .getElementById("btnCancelLogout")
    .addEventListener("click", () => logoutModal.classList.remove("active"));
  document.getElementById("btnConfirmLogout").addEventListener("click", () => {
    alert("Đã thoát!");
    logoutModal.classList.remove("active");
  });
}

// Khởi chạy
window.addEventListener("DOMContentLoaded", () => {
  renderUserInfo();
  renderProductList();
  setupEvents();
});
