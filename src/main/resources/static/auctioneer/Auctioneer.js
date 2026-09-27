// ==========================================
// CENTRAL STATE & DYNAMIC API DATA
// ==========================================

const auctionState = {
  auctioneer: JSON.parse(localStorage.getItem('currentUser')) || {
    id: "auc_me",
    name: "Đấu giá viên",
    role: "Đấu giá viên",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  session: {
    liveTime: "Đang live",
    views: "1",
    totalBids: 0,
    isPaused: false,
    notice: "Chú ý: Vui lòng kiểm tra kỹ thông tin sản phẩm trước khi gõ búa chốt giá.",
  },
  product: {
    title: "Đang tải...",
    tag: "Đấu giá trực tuyến",
    description: "Đang cập nhật thông tin sản phẩm từ cơ sở dữ liệu...",
    specs: [],
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    ],
  },
  leader: {
    name: "Chưa có",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    amount: 0,
  },
  bidHistory: [],
  publicChatMessages: [
    {
      id: 1,
      senderId: "sys",
      name: "Hệ thống",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      text: "Phòng đấu giá đã sẵn sàng. Chúc bạn điều hành phiên thành công!",
      time: "Vừa xong",
    }
  ],
  participants: [],
};

// Lấy ID phòng đấu giá từ URL (Mặc định là 101 để đồng bộ với Bidder)
const urlParams = new URLSearchParams(window.location.search);
const auctionId = urlParams.get('id') || 101;

let currentTab = "history"; // 'history' hoặc 'chat'

// ==========================================
// FETCH DỮ LIỆU THẬT TỪ SPRING BOOT BACKEND
// ==========================================
async function fetchAuctionDataFromBackend() {
  try {
    const response = await fetch(`http://localhost:8080/api/auctions/${auctionId}`);
    if (response.ok) {
      const auction = await response.json();

      // Cập nhật giá hiện tại và thông tin người dẫn đầu nếu có từ DB
      auctionState.leader.amount = auction.currentHighestBid || auction.startingPrice || 0;

      if (auction.currentHighestBidder) {
        auctionState.leader.name = auction.currentHighestBidder;
      }

      if (auction.product) {
        auctionState.product.title = auction.product.name;
        auctionState.product.description = auction.product.description || "Không có mô tả chi tiết";
        auctionState.product.specs = [
          { label: "Giá khởi điểm:", value: auction.startingPrice.toLocaleString("vi-VN") + "đ", icon: "fa-solid fa-tag" },
          { label: "Trạng thái:", value: auction.status, icon: "fa-solid fa-circle-info" }
        ];
      }

      // Cập nhật lại toàn bộ giao diện sau khi lấy dữ liệu mới
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
    // Chỉ lấy tin nhắn chung (public) để hiển thị lên khung chat của Admin
    const response = await fetch(`http://localhost:8080/api/chats/${auctionId}?type=public`);
    if (response.ok) {
      const messages = await response.json();
      auctionState.publicChatMessages = messages;
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
// DYNAMIC UI RENDERERS
// ==========================================
function renderHeader() {
  const nameEl = document.getElementById("auctioneerName");
  const roleEl = document.getElementById("auctioneerRole");
  const avatarEl = document.getElementById("auctioneerAvatar");
  const liveTimeEl = document.getElementById("liveTimeCounter");

  const auctioneerName = auctionState.auctioneer.name || "Đấu giá viên";

  if (nameEl) nameEl.innerHTML = `${auctioneerName} <i class="fa-solid fa-circle user-status-dot"></i>`;
  if (roleEl) roleEl.textContent = auctionState.auctioneer.role || "Đấu giá viên";
  if (avatarEl) avatarEl.src = auctionState.auctioneer.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
  if (liveTimeEl) liveTimeEl.innerHTML = `<i class="fa-regular fa-clock"></i> Phòng #${auctionId}`;
}

function renderProductInfo() {
  const titleEl = document.getElementById("productTitle");
  const tagEl = document.getElementById("productTag");
  const descEl = document.getElementById("productDesc");
  const specsEl = document.getElementById("productSpecs");

  if (titleEl) titleEl.textContent = auctionState.product.title;
  if (tagEl) tagEl.textContent = auctionState.product.tag;
  if (descEl) descEl.textContent = auctionState.product.description;

  if (specsEl) {
    specsEl.innerHTML = auctionState.product.specs
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

  renderSlideshowTrack("sliderTrack", "sliderIndicators", "slide", "indicator");
  renderSlideshowTrack("streamSlideshowTrack", "streamSliderIndicators", "stream-slide", "stream-indicator");
}

function renderSlideshowTrack(trackId, indicatorsId, slideClass, indicatorClass) {
  const track = document.getElementById(trackId);
  const indicators = document.getElementById(indicatorsId);
  const images = auctionState.product.images || [];

  if (track) {
    track.style.width = `${images.length * 100}%`;
    track.innerHTML = images
        .map(
            (img) => `
      <div class="${slideClass}" style="width: ${100 / images.length}%">
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
                `<span class="${indicatorClass} ${idx === 0 ? "active" : ""}"></span>`,
        )
        .join("");
  }
}

function renderLeaderAndPrice() {
  const formattedPrice = formatCurrency(auctionState.leader.amount);

  const priceDisplay = document.getElementById("currentPriceDisplay");
  const leaderAvatar = document.getElementById("leaderAvatar");
  const leaderName = document.getElementById("leaderName");
  const leaderBid = document.getElementById("leaderBid");

  if (priceDisplay) priceDisplay.innerHTML = `${formattedPrice} <i class="fa-solid fa-arrow-up trend-icon"></i>`;
  if (leaderAvatar) leaderAvatar.src = auctionState.leader.avatar;
  if (leaderName) leaderName.textContent = auctionState.leader.name;
  if (leaderBid) leaderBid.textContent = formattedPrice;

  const highestBidderAvatar = document.getElementById("highestBidderAvatar");
  const highestBidderName = document.getElementById("highestBidderName");
  const highestBidderPrice = document.getElementById("highestBidderPrice");

  if (highestBidderAvatar) highestBidderAvatar.src = auctionState.leader.avatar;
  if (highestBidderName) highestBidderName.textContent = auctionState.leader.name;
  if (highestBidderPrice) highestBidderPrice.textContent = formattedPrice;

  const hammerModalMessage = document.getElementById("hammerModalMessage");
  if (hammerModalMessage) {
    hammerModalMessage.innerHTML = `Bạn có chắc chắn muốn chốt sản phẩm này cho người tham gia <strong>${auctionState.leader.name}</strong> với mức giá <strong>${formattedPrice}</strong> không?`;
  }
}

function renderSessionStats() {
  const streamViewsBadge = document.getElementById("streamViewsBadge");
  const statViews = document.getElementById("statViews");
  const statTotalBids = document.getElementById("statTotalBids");
  const statLiveTime = document.getElementById("statLiveTime");
  const statLeaderName = document.getElementById("statLeaderName");
  const statLeaderBid = document.getElementById("statLeaderBid");
  const sessionNoticeText = document.getElementById("sessionNoticeText");

  if (streamViewsBadge) streamViewsBadge.innerHTML = `<i class="fa-regular fa-eye"></i> ${auctionState.session.views}`;
  if (statViews) statViews.textContent = auctionState.session.views;
  if (statTotalBids) statTotalBids.textContent = auctionState.session.totalBids;
  if (statLiveTime) statLiveTime.textContent = auctionState.session.liveTime;
  if (statLeaderName) statLeaderName.textContent = auctionState.leader.name;
  if (statLeaderBid) statLeaderBid.textContent = formatCurrency(auctionState.leader.amount);
  if (sessionNoticeText) sessionNoticeText.textContent = auctionState.session.notice;
}

function renderHistory() {
  const container = document.getElementById("historyContainer");
  if (!container) return;

  container.innerHTML = auctionState.bidHistory
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

function renderChat() {
  const container = document.getElementById("chatContainer");
  if (!container) return;

  const auctioneerName = auctionState.auctioneer.name || "Đấu giá viên";

  container.innerHTML = auctionState.publicChatMessages
      .map((msg) => {
        const isSelf = msg.senderId === auctionState.auctioneer.id;
        return `
        <div class="chat-msg ${isSelf ? "msg-self" : "msg-other"}">
          <img src="${msg.avatar}" alt="${msg.name}">
          <div class="msg-bubble">
            <div class="msg-header-inline">
              <span>${isSelf ? auctioneerName : msg.name}</span>
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

function renderParticipants() {
  const container = document.getElementById("participantsContainer");
  const countBadge = document.getElementById("participantCount");

  if (countBadge) countBadge.textContent = auctionState.participants.length;
  if (!container) return;

  container.innerHTML = auctionState.participants
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
  renderLeaderAndPrice();
  renderSessionStats();
  renderHistory();
  renderChat();
  renderParticipants();
}

// ==========================================
// TAB SWITCHER & CHAT
// ==========================================
function setupTabSwitcher() {
  const tabHistory = document.getElementById("tabHistory");
  const tabChat = document.getElementById("tabChat");
  const historyView = document.getElementById("historyView");
  const chatView = document.getElementById("chatView");

  if (tabHistory && tabChat) {
    tabHistory.addEventListener("click", () => switchTab("history"));
    tabChat.addEventListener("click", () => switchTab("chat"));
  }

  function switchTab(tab) {
    currentTab = tab;
    tabHistory.classList.toggle("active", tab === "history");
    tabChat.classList.toggle("active", tab === "chat");

    if (historyView && chatView) {
      historyView.classList.toggle("active", tab === "history");
      chatView.classList.toggle("active", tab === "chat");
    }

    if (tab === "chat") {
      renderChat();
    } else {
      renderHistory();
    }
  }

  document.getElementById("chatForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input?.value.trim();
    if (!text) return;

    const auctioneerName = auctionState.auctioneer.name || "Đấu giá viên";
    const userAvatar = auctionState.auctioneer.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

    const newMsg = {
      auctionId: parseInt(auctionId),
      senderId: auctionState.auctioneer.id || "auc_me",
      name: auctioneerName,
      avatar: userAvatar,
      text: text,
      time: getCurrentTime(),
      type: "public" // ⚠️ Gắn type public cho tin nhắn của admin
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

// ==========================================
// SLIDESHOWS & CAMERA
// ==========================================
let currentSlideLeft = 0;
let currentStreamSlide = 0;

function setupSlideshows() {
  setInterval(() => {
    const images = auctionState.product.images || [];
    if (images.length === 0) return;
    currentSlideLeft = (currentSlideLeft + 1) % images.length;
    const track = document.getElementById("sliderTrack");
    const indicators = document.querySelectorAll("#sliderIndicators .indicator");

    if (track) track.style.transform = `translateX(-${currentSlideLeft * (100 / images.length)}%)`;
    indicators.forEach((ind, idx) => ind.classList.toggle("active", idx === currentSlideLeft));
  }, 3500);

  setInterval(() => {
    const images = auctionState.product.images || [];
    if (images.length === 0) return;
    currentStreamSlide = (currentStreamSlide + 1) % images.length;
    const track = document.getElementById("streamSlideshowTrack");
    const indicators = document.querySelectorAll("#streamSliderIndicators .stream-indicator");

    if (track) track.style.transform = `translateX(-${currentStreamSlide * (100 / images.length)}%)`;
    indicators.forEach((ind, idx) => ind.classList.toggle("active", idx === currentStreamSlide));
  }, 3500);
}

let localStream = null;
let isCamOn = false;
let isMicOn = false;

const toggleCamBtn = document.getElementById("toggleCamera");
const toggleMicBtn = document.getElementById("toggleMic");
const webcamVideo = document.getElementById("webcamVideo");
const streamSlideshow = document.getElementById("streamSlideshow");

async function startCamera() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));

    if (webcamVideo) {
      webcamVideo.srcObject = localStream;
      webcamVideo.classList.remove("hidden");
    }
    if (streamSlideshow) streamSlideshow.classList.remove("active");
  } catch (err) {
    alert("Không thể mở Webcam! Vui lòng cấp quyền thiết bị.");
    isCamOn = false;
    updateCamUI();
  }
}

function stopCamera() {
  if (localStream) {
    localStream.getVideoTracks().forEach((track) => track.stop());
  }
  if (webcamVideo) {
    webcamVideo.classList.add("hidden");
    webcamVideo.srcObject = null;
  }
  if (streamSlideshow) streamSlideshow.classList.add("active");
}

function updateCamUI() {
  if (!toggleCamBtn) return;
  if (isCamOn) {
    toggleCamBtn.classList.add("active");
    toggleCamBtn.innerHTML = '<i class="fa-solid fa-video"></i>';
  } else {
    toggleCamBtn.classList.remove("active");
    toggleCamBtn.innerHTML = '<i class="fa-solid fa-video-slash"></i>';
  }
}

function setupMediaControls() {
  if (toggleCamBtn) {
    stopCamera();
    toggleCamBtn.addEventListener("click", async () => {
      isCamOn = !isCamOn;
      updateCamUI();
      if (isCamOn) await startCamera();
      else stopCamera();
    });
  }

  if (toggleMicBtn) {
    toggleMicBtn.addEventListener("click", () => {
      isMicOn = !isMicOn;
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => (track.enabled = isMicOn));
      }
      if (isMicOn) {
        toggleMicBtn.classList.add("active");
        toggleMicBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
      } else {
        toggleMicBtn.classList.remove("active");
        toggleMicBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
      }
    });
  }
}

// ==========================================
// SESSION CONTROLS & MODALS
// ==========================================
function setupSessionControls() {
  const btnPauseSession = document.getElementById("btnPauseSession");
  const pauseModal = document.getElementById("pauseModal");
  const btnCancelPause = document.getElementById("btnCancelPause");
  const btnConfirmPause = document.getElementById("btnConfirmPause");
  const sessionLiveBadge = document.getElementById("sessionLiveBadge");

  if (btnPauseSession && pauseModal) {
    btnPauseSession.addEventListener("click", () => pauseModal.classList.add("active"));
  }
  if (btnCancelPause && pauseModal) {
    btnCancelPause.addEventListener("click", () => pauseModal.classList.remove("active"));
  }
  if (btnConfirmPause && pauseModal) {
    btnConfirmPause.addEventListener("click", () => {
      auctionState.session.isPaused = !auctionState.session.isPaused;
      pauseModal.classList.remove("active");

      if (auctionState.session.isPaused) {
        document.body.classList.add("session-paused");
        btnPauseSession.classList.add("is-paused");
        btnPauseSession.innerHTML = '<i class="fa-solid fa-play"></i> Tiếp tục phiên';
        sessionLiveBadge.classList.add("paused");
        sessionLiveBadge.innerHTML = '<i class="fa-solid fa-pause"></i> TẠM DỪNG';
      } else {
        document.body.classList.remove("session-paused");
        btnPauseSession.classList.remove("is-paused");
        btnPauseSession.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng phiên';
        sessionLiveBadge.classList.remove("paused");
        sessionLiveBadge.innerHTML = '<i class="fa-solid fa-circle dot pulsing-dot"></i> LIVE';
      }
    });
  }

  const btnFullscreen = document.getElementById("btnFullscreen");
  const appContainer = document.getElementById("appContainer");

  if (btnFullscreen && appContainer) {
    btnFullscreen.addEventListener("click", () => {
      appContainer.classList.toggle("stream-maximized");
      const icon = btnFullscreen.querySelector("i");
      icon.className = appContainer.classList.contains("stream-maximized") ? "fa-solid fa-compress" : "fa-solid fa-expand";
    });
  }
}

function setupHammerModal() {
  const hammerModal = document.getElementById("hammerModal");
  const btnHammerSubmit = document.getElementById("btnHammerSubmit");
  const btnCancelHammer = document.getElementById("btnCancelHammer");
  const btnConfirmHammer = document.getElementById("btnConfirmHammer");

  if (btnHammerSubmit && hammerModal) {
    btnHammerSubmit.addEventListener("click", () => hammerModal.classList.add("active"));
  }
  if (btnCancelHammer && hammerModal) {
    btnCancelHammer.addEventListener("click", () => hammerModal.classList.remove("active"));
  }
  if (btnConfirmHammer && hammerModal) {
    btnConfirmHammer.addEventListener("click", () => {
      hammerModal.classList.remove("active");
      alert("Đã gõ búa chốt giá thành công!");
    });
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
window.addEventListener("DOMContentLoaded", () => {
  fetchAuctionDataFromBackend();
  fetchChatMessages(); // Tải tin nhắn lần đầu khi vào trang

  // Tự động gọi API cập nhật giá đấu và tin nhắn chat mỗi 3 giây
  setInterval(() => {
    fetchAuctionDataFromBackend();
    fetchChatMessages();
  }, 3000);

  setupTabSwitcher();
  setupSlideshows();
  setupMediaControls();
  setupSessionControls();
  setupHammerModal();
});