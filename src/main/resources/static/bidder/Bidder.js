// ==========================================
// CENTRAL STATE & DYNAMIC API DATA
// ==========================================

const bidderState = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || {
    id: "user_me",
    name: "Khách hàng",
    role: "Khách hàng",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    defaultBg: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80"
  },
  session: {
    liveTime: "Đang live",
    views: "1",
  },
  product: {
    title: "Đang tải...",
    tag: "Đấu giá trực tuyến",
    description: "Đang cập nhật thông tin sản phẩm từ cơ sở dữ liệu...",
    specs: [],
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80"
    ],
  },
  quickBids: [100000, 500000, 1000000, 5000000],
  currentPrice: 0,
  leader: {
    name: "Chưa có",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    amount: 0,
    streamImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80",
  },
  otherCams: [],
  publicChatMessages: [
    {
      id: 1,
      senderId: "sys",
      name: "Hệ thống",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      text: "Chào mừng bạn đến với phiên đấu giá trực tuyến real-time!",
      time: "Vừa xong",
    }
  ],
  privateChats: {},
  bidHistory: [],
  participants: [],
};

// Lấy ID phòng đấu giá từ URL (Ví dụ: /bidder/Bidder.html?id=101)
const urlParams = new URLSearchParams(window.location.search);
const auctionId = urlParams.get('id') || 101;

let currentTab = "public"; // "public" hoặc "private"
let selectedPrivateUser = null;
let localStream = null;
let isCamOn = false;

// ==========================================
// FETCH DỮ LIỆU THẬT TỪ SPRING BOOT BACKEND
// ==========================================
async function fetchAuctionDataFromBackend() {
  try {
    const response = await fetch(`http://localhost:8080/api/auctions/${auctionId}`);
    if (response.ok) {
      const auction = await response.json();

      // Cập nhật giá hiện tại từ DB
      bidderState.currentPrice = auction.currentHighestBid || auction.startingPrice || 0;
      if (auction.currentHighestBidder) {
        bidderState.leader.name = auction.currentHighestBidder;
        bidderState.leader.amount = auction.currentHighestBid;
      }

      // Cập nhật thông tin sản phẩm từ DB
      if (auction.product) {
        bidderState.product.title = auction.product.name;
        bidderState.product.description = auction.product.description || "Không có mô tả chi tiết";
        bidderState.product.specs = [
          { label: "Giá khởi điểm:", value: auction.startingPrice.toLocaleString("vi-VN") + "đ", icon: "fa-solid fa-tag" },
          { label: "Trạng thái:", value: auction.status, icon: "fa-solid fa-circle-info" }
        ];
      }

      renderAllUI();
    } else {
      console.warn("Không tìm thấy phiên đấu giá với ID:", auctionId);
    }
  } catch (error) {
    console.error("Lỗi kết nối tới Server Spring Boot:", error);
  }
}

// ==========================================
// FETCH TIN NHẮN CHAT TỪ SERVER (LỌC THEO TYPE)
// ==========================================
async function fetchChatMessages() {
  try {
    // Chỉ lấy tin nhắn chung (public) từ Backend để hiển thị khung chat chung
    const response = await fetch(`http://localhost:8080/api/chats/${auctionId}?type=public`);
    if (response.ok) {
      const messages = await response.json();
      bidderState.publicChatMessages = messages;
      renderChat();
    }
  } catch (error) {
    console.error("Lỗi đồng bộ tin nhắn:", error);
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function formatCurrency(amount) {
  if (typeof amount !== "number") return "--";
  return amount.toLocaleString("vi-VN") + "đ";
}

function getCurrentTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// ==========================================
// RENDER DYNAMIC UI
// ==========================================
function renderHeader() {
  const nameEl = document.getElementById("bidderName");
  const roleEl = document.getElementById("bidderRole");
  const avatarEl = document.getElementById("bidderAvatar");
  const liveTimeEl = document.getElementById("liveTimeCounter");

  const userName = bidderState.currentUser.name || bidderState.currentUser.fullName || bidderState.currentUser.username || "Khách hàng";

  if (nameEl) nameEl.innerHTML = `${userName} <i class="fa-solid fa-circle user-status-dot"></i>`;
  if (roleEl) roleEl.textContent = bidderState.currentUser.role || "Thành viên";
  if (avatarEl) avatarEl.src = bidderState.currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
  if (liveTimeEl) liveTimeEl.innerHTML = `<i class="fa-regular fa-clock"></i> Phòng #${auctionId}`;

  const logoutModalMsg = document.getElementById("logoutModalMessage");
  if (logoutModalMsg) {
    logoutModalMsg.innerHTML = `<strong>${userName}</strong> có chắc chắn muốn thoát khỏi phiên đấu giá không?`;
  }
}

function renderProductInfo() {
  const titleEl = document.getElementById("productTitle");
  const tagEl = document.getElementById("productTag");
  const descEl = document.getElementById("productDesc");
  const specsEl = document.getElementById("productSpecs");

  if (titleEl) titleEl.textContent = bidderState.product.title;
  if (tagEl) tagEl.textContent = bidderState.product.tag;
  if (descEl) descEl.textContent = bidderState.product.description;

  if (specsEl) {
    specsEl.innerHTML = bidderState.product.specs
        .map(
            (spec) => `
      <div class="spec-item">
        <i class="${spec.icon}"></i>
        <span>${spec.label}</span> <strong>${spec.value}</strong>
      </div>
    `,
        )
        .join("");
  }

  // Slideshow
  const track = document.getElementById("sliderTrack");
  const indicators = document.getElementById("sliderIndicators");
  const images = bidderState.product.images || [];

  if (track) {
    track.style.width = `${images.length * 100}%`;
    track.innerHTML = images
        .map(
            (img) => `
      <div class="slide" style="width: ${100 / images.length}%">
        <img src="${img}" alt="Ảnh sản phẩm" />
      </div>
    `,
        )
        .join("");
  }

  if (indicators) {
    indicators.innerHTML = images
        .map(
            (_, idx) =>
                `<span class="indicator ${idx === 0 ? "active" : ""}"></span>`,
        )
        .join("");
  }
}

function renderBidControls() {
  const currentPriceDisplay = document.getElementById("currentPriceDisplay");
  const quickBidButtons = document.getElementById("quickBidButtons");
  const customBidLabel = document.getElementById("customBidLabel");
  const userName = bidderState.currentUser.name || bidderState.currentUser.fullName || bidderState.currentUser.username || "Bạn";

  if (currentPriceDisplay) {
    currentPriceDisplay.innerHTML = `${formatCurrency(bidderState.currentPrice)} <i class="fa-solid fa-arrow-up trend-icon"></i>`;
  }

  if (customBidLabel) {
    customBidLabel.textContent = `Hoặc nhập giá của ${userName}`;
  }

  if (quickBidButtons) {
    quickBidButtons.innerHTML = bidderState.quickBids
        .map((step) => {
          const displayStep = step >= 1000000 ? `+${step / 1000000}M` : `+${step / 100}K`;
          return `<button class="btn-quick" onclick="addBidStep(${step})">${displayStep}</button>`;
        })
        .join("");
  }
}

function renderMainStream() {
  const streamViewsBadge = document.getElementById("streamViewsBadge");
  const highestBidderName = document.getElementById("highestBidderName");
  const highestBidderPrice = document.getElementById("highestBidderPrice");
  const highestBidderAvatar = document.getElementById("highestBidderAvatar");
  const mainBidderStreamImg = document.getElementById("mainBidderStreamImg");

  if (streamViewsBadge) streamViewsBadge.innerHTML = `<i class="fa-regular fa-eye"></i> ${bidderState.session.views}`;
  if (highestBidderName) highestBidderName.textContent = bidderState.leader.name;
  if (highestBidderPrice) highestBidderPrice.textContent = formatCurrency(bidderState.leader.amount);
  if (highestBidderAvatar) highestBidderAvatar.src = bidderState.leader.avatar;
  if (mainBidderStreamImg) mainBidderStreamImg.src = bidderState.leader.streamImg;
}

function renderCams() {
  const container = document.getElementById("camsContainer");
  if (!container) return;

  const userName = bidderState.currentUser.name || bidderState.currentUser.fullName || bidderState.currentUser.username || "Bạn";

  let html = `
    <div class="cam-item self-cam" id="selfCamContainer">
      <div class="cam-controls">
        <button class="btn-cam-toggle ${isCamOn ? "active" : ""}" id="btnToggleCam" title="Bật/Tắt Camera">
          <i class="fa-solid ${isCamOn ? "fa-video" : "fa-video-slash"}"></i>
        </button>
      </div>
      <video id="selfVideo" autoplay playsinline muted class="cam-video-element" style="display: ${isCamOn ? "block" : "none"};"></video>
      
      <div id="selfCamPlaceholder" class="cam-bg-off-container" style="display: ${isCamOn ? "none" : "flex"};">
        <img src="${bidderState.currentUser.defaultBg || ''}" class="cam-bg-blur" alt="Background" />
        <img src="${bidderState.currentUser.avatar || ''}" class="cam-avatar-center" alt="Avatar" />
      </div>

      <span class="cam-name">${userName}</span>
    </div>
  `;

  container.innerHTML = html;
  document.getElementById("btnToggleCam")?.addEventListener("click", toggleCamera);

  if (isCamOn && localStream) {
    const videoElem = document.getElementById("selfVideo");
    if (videoElem) videoElem.srcObject = localStream;
  }
}

function renderChat() {
  const container = document.getElementById("chatContainer");
  if (!container) return;

  let messagesToRender = [];
  if (currentTab === "public") {
    messagesToRender = bidderState.publicChatMessages;
  } else if (selectedPrivateUser) {
    messagesToRender = bidderState.privateChats[selectedPrivateUser.id] || [];
  }

  const userName = bidderState.currentUser.name || bidderState.currentUser.fullName || bidderState.currentUser.username || "Bạn";

  container.innerHTML = messagesToRender
      .map((msg) => {
        const isSelf = msg.senderId === bidderState.currentUser.id;
        return `
        <div class="chat-msg ${isSelf ? "msg-self" : "msg-other"}">
          <img src="${msg.avatar}" alt="${msg.name}">
          <div class="msg-bubble">
            <div class="msg-header-inline">
              <span>${isSelf ? userName : msg.name}</span>
              <span>${msg.time}</span>
            </div>
            <div>${msg.text}</div>
          </div>
        </div>
      `;
      })
      .join("");

  container.scrollTop = container.scrollHeight;
}

function renderHistory() {
  const container = document.getElementById("historyContainer");
  const countBadge = document.getElementById("historyCount");

  if (countBadge) countBadge.textContent = bidderState.bidHistory.length;
  if (!container) return;

  container.innerHTML = bidderState.bidHistory
      .map(
          (item) => `
      <div class="history-item ${item.isTop ? "top-bid" : ""}">
        <div class="time-cell">${item.time}</div>
        <div class="user-cell">
            ${item.isTop ? '<i class="fa-solid fa-crown crown-inline-icon"></i>' : ""}
            <img src="${item.avatar}" alt="${item.name}">
            <span>${item.name}</span>
        </div>
        <div class="price-cell">${formatCurrency(item.amount)}</div>
      </div>
    `,
      )
      .join("");
}

function renderParticipants() {
  const container = document.getElementById("participantsContainer");
  const countBadge = document.getElementById("participantCount");

  if (countBadge) countBadge.textContent = bidderState.participants.length;
  if (!container) return;

  container.innerHTML = bidderState.participants
      .map((p) => {
        return `
        <div class="participant-item">
          <div class="rank-num">${p.rank || 1}</div>
          <img src="${p.avatar}" alt="${p.name}" class="participant-avatar">
          <div class="participant-info">
            <div class="participant-name">${p.name}</div>
          </div>
          <i class="fa-solid fa-video cam-on cam-status-icon"></i>
        </div>
      `;
      })
      .join("");
}

function renderAllUI() {
  renderHeader();
  renderProductInfo();
  renderBidControls();
  renderMainStream();
  renderCams();
  renderChat();
  renderHistory();
  renderParticipants();
}

// ==========================================
// SLIDESHOW & CAMERA CONTROLLERS
// ==========================================
let currentSlide = 0;
function setupSlideshow() {
  setInterval(() => {
    const images = bidderState.product.images || [];
    if (images.length === 0) return;
    currentSlide = (currentSlide + 1) % images.length;
    const track = document.getElementById("sliderTrack");
    const indicators = document.querySelectorAll("#sliderIndicators .indicator");

    if (track) track.style.transform = `translateX(-${currentSlide * (100 / images.length)}%)`;
    indicators.forEach((ind, idx) => ind.classList.toggle("active", idx === currentSlide));
  }, 3500);
}

async function toggleCamera() {
  if (!isCamOn) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      isCamOn = true;
      renderCams();
    } catch (err) {
      alert("Không thể truy cập Camera. Vui lòng cấp quyền thiết bị!");
    }
  } else {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
    }
    isCamOn = false;
    renderCams();
  }
}

// ==========================================
// CHAT & BIDDING EVENTS
// ==========================================
function setupChatControls() {
  document.getElementById("tabPublic")?.addEventListener("click", () => switchChatTab("public"));
  document.getElementById("tabPrivate")?.addEventListener("click", () => switchChatTab("private"));

  document.getElementById("chatForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input?.value.trim();
    if (!text) return;

    const userName = bidderState.currentUser.name || bidderState.currentUser.fullName || bidderState.currentUser.username || "Thành viên";
    const userAvatar = bidderState.currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

    const newMsg = {
      auctionId: parseInt(auctionId),
      senderId: bidderState.currentUser.id || "user_me",
      name: userName,
      avatar: userAvatar,
      text: text,
      time: getCurrentTime(),
      type: currentTab // ⚠️ Gửi kèm loại tin nhắn ("public" hoặc "private") lên Backend
    };

    try {
      // Gửi tin nhắn lên Backend Spring Boot
      await fetch('http://localhost:8080/api/chats', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newMsg)
      });

      input.value = "";
      fetchChatMessages(); // Tải lại ngay lập tức sau khi gửi
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  });
}

function switchChatTab(tab) {
  currentTab = tab;
  document.getElementById("tabPublic")?.classList.toggle("active", tab === "public");
  document.getElementById("tabPrivate")?.classList.toggle("active", tab === "private");
  renderChat();
}

window.addBidStep = function (step) {
  bidderState.currentPrice += step;
  const priceDisplay = document.getElementById("currentPriceDisplay");
  const inputElem = document.getElementById("customBidInput");

  if (priceDisplay) {
    priceDisplay.innerHTML = `${formatCurrency(bidderState.currentPrice)} <i class="fa-solid fa-arrow-up trend-icon"></i>`;
  }
  if (inputElem) inputElem.value = bidderState.currentPrice;
};

function setupBidAndModalEvents() {
  const btnSubmitBid = document.getElementById("btnSubmitBid");
  const bidSuccessModal = document.getElementById("bidSuccessModal");
  const btnCloseBidModal = document.getElementById("btnCloseBidModal");

  if (btnSubmitBid) {
    btnSubmitBid.addEventListener("click", async () => {
      const customValInput = document.getElementById("customBidInput");
      const customVal = customValInput ? customValInput.value.replace(/[^0-9]/g, "") : "";

      let finalAmount = bidderState.currentPrice;
      if (customVal && parseInt(customVal) > 0) {
        finalAmount = parseInt(customVal);
      }

      const userName = bidderState.currentUser.name || bidderState.currentUser.fullName || bidderState.currentUser.username || "Khách hàng";

      // GỬI LƯỢT RA GIÁ KÈM THEO USERNAME LÊN BACKEND SPRING BOOT
      try {
        const response = await fetch('http://localhost:8080/api/bids', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auctionId: parseInt(auctionId),
            userId: bidderState.currentUser.id,
            userName: userName,
            amount: finalAmount
          })
        });

        if (!response.ok) {
          alert("Gửi giá thất bại từ máy chủ!");
          return;
        }
      } catch (error) {
        console.error("Lỗi kết nối khi ra giá:", error);
        alert("Không thể kết nối đến máy chủ để ra giá!");
        return;
      }

      const userAvatar = bidderState.currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

      bidderState.bidHistory.forEach((item) => (item.isTop = false));

      bidderState.bidHistory.unshift({
        id: Date.now(),
        name: userName,
        avatar: userAvatar,
        amount: finalAmount,
        time: getCurrentTime(),
        isTop: true,
      });

      bidderState.currentPrice = finalAmount;
      bidderState.leader = {
        name: userName,
        avatar: userAvatar,
        amount: finalAmount,
        streamImg: userAvatar,
      };

      renderBidControls();
      renderMainStream();
      renderHistory();

      const modalMsg = document.getElementById("modalBidMessage");
      if (modalMsg) {
        modalMsg.innerHTML = `Chúc mừng <strong>${userName}</strong> đã ra giá thành công <strong>${formatCurrency(finalAmount)}</strong>!`;
      }
      if (bidSuccessModal) bidSuccessModal.classList.add("active");
    });
  }

  if (btnCloseBidModal && bidSuccessModal) {
    btnCloseBidModal.addEventListener("click", () => bidSuccessModal.classList.remove("active"));
  }

  // Nút đăng xuất
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/auth/Auth.html';
  });
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
window.addEventListener("DOMContentLoaded", () => {
  fetchAuctionDataFromBackend();
  fetchChatMessages(); // Tải tin nhắn lần đầu khi vào trang

  // Tự động đồng bộ giá đấu và tin nhắn mỗi 3 giây cho mọi client
  setInterval(() => {
    fetchAuctionDataFromBackend();
    fetchChatMessages();
  }, 3000);

  setupSlideshow();
  setupChatControls();
  setupBidAndModalEvents();
});