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
  privateChats: {},
  participants: [], // Lấy động từ Database
};

// Lấy ID phòng đấu giá từ URL
const urlParams = new URLSearchParams(window.location.search);
const auctionId = urlParams.get('id') || 101;

let currentTab = "history"; // 'history' hoặc 'chat'
let chatTab = "public"; // "public" hoặc "private"
let selectedPrivateUser = null;

// ==========================================
// FETCH DỮ LIỆU TỪ SERVER (HỖ TRỢ CẢ NGROK)
// ==========================================
async function fetchAuctionDataFromBackend() {
  try {
    const response = await fetch(`/api/auctions/${auctionId}`);
    if (response.ok) {
      const auction = await response.json();
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
      renderAllUI();
    }
  } catch (error) {
    console.error("Lỗi kết nối tới Server Spring Boot:", error);
  }
}

// Lấy danh sách người tham gia từ Database qua API
async function fetchParticipantsFromBackend() {
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      const users = await response.json();
      auctionState.participants = users.map((u, index) => ({
        id: u.userId ? u.userId.toString() : "user_" + index,
        name: u.displayName || u.username,
        avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        rank: index + 1
      }));
      renderParticipants();
      if (typeof renderPrivateUserList === 'function' && chatTab === "private" && !selectedPrivateUser) {
        renderPrivateUserList();
      }
    }
  } catch (error) {
    console.error("Lỗi tải danh sách người tham gia từ CSDL:", error);
  }
}

async function fetchChatMessages() {
  try {
    let url = `/api/chats/${auctionId}?type=public`;
    if (chatTab === "private" && selectedPrivateUser) {
      const myId = auctionState.auctioneer.id || "auc_me";
      url = `/api/chats/${auctionId}?type=private&userId=${myId}&targetId=${selectedPrivateUser.id}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const messages = await response.json();
      if (chatTab === "public") {
        auctionState.publicChatMessages = messages;
      } else if (selectedPrivateUser) {
        auctionState.privateChats[selectedPrivateUser.id] = messages;
      }
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
// RENDER UI
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

  let messagesToRender = [];
  if (chatTab === "public") {
    messagesToRender = auctionState.publicChatMessages;
  } else if (selectedPrivateUser) {
    messagesToRender = auctionState.privateChats[selectedPrivateUser.id] || [];
  }

  const auctioneerName = auctionState.auctioneer.name || "Đấu giá viên";

  container.innerHTML = messagesToRender
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

// Giao diện hộp thư Messenger chuẩn cho danh sách chat riêng của Admin
function renderPrivateUserList() {
  const container = document.getElementById("privateUserListContainer");
  if (!container) return;

  if (auctionState.participants.length === 0) {
    container.innerHTML = `<div style="padding: 12px; color: #9ca3af; font-size: 12px; text-align: center;">Chưa có khách hàng nào trong phòng.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-weight: 700; margin-bottom: 8px; font-size: 12px; color: #374151; padding: 0 4px;">Hộp thư khách hàng (${auctionState.participants.length})</div>
    <div style="display: flex; flex-direction: column; gap: 6px; max-height: 280px; overflow-y: auto;" id="userSelectionList">
      ${auctionState.participants.map(p => {
    const isSelected = selectedPrivateUser?.id === p.id;
    return `
          <div class="user-option-item" data-id="${p.id}" data-name="${p.name}" data-avatar="${p.avatar}" 
               style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: ${isSelected ? '#eff6ff' : '#ffffff'}; border-radius: 8px; cursor: pointer; border: 1px solid ${isSelected ? '#3b82f6' : '#f3f4f6'}; transition: all 0.2s;">
            <div style="position: relative;">
              <img src="${p.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
              <span style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #22c55e; border: 2px solid #fff; border-radius: 50%;"></span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
              <div style="font-size: 11px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Bấm để xem tin nhắn riêng...</div>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;

  container.querySelectorAll('.user-option-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const name = item.getAttribute('data-name');
      const avatar = item.getAttribute('data-avatar');
      selectPrivateUser(id, name, avatar);
    });
  });
}

function selectPrivateUser(id, name, avatar) {
  selectedPrivateUser = { id, name, avatar };
  const container = document.getElementById("privateUserListContainer");
  if (container) {
    // Ẩn hoàn toàn thanh thông báo "Đang chat với..." đi sau khi chọn
    container.style.display = "none";
  }
  fetchChatMessages();
}

function renderParticipants() {
  const container = document.getElementById("participantsContainer");
  const countBadge = document.getElementById("participantCount");

  if (countBadge) countBadge.textContent = auctionState.participants.length;
  if (!container) return;

  container.innerHTML = auctionState.participants
      .map((p) => {
        return `
        <div class="participant-item participant-click-item" data-id="${p.id}" data-name="${p.name}" data-avatar="${p.avatar}" style="cursor: pointer;" title="Bấm để chat riêng">
          <div class="rank-num">${p.rank || 1}</div>
          <img src="${p.avatar}" alt="${p.name}" class="participant-avatar">
          <div class="participant-info">
            <div class="participant-name">${p.name}</div>
          </div>
          <i class="fa-solid fa-comments" style="color: var(--primary-accent); font-size: 11px;"></i>
        </div>
      `;
      })
      .join("");

  container.querySelectorAll('.participant-click-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const name = item.getAttribute('data-name');
      const avatar = item.getAttribute('data-avatar');

      document.getElementById("tabChat")?.click();
      switchChatTab("private");
      selectPrivateUser(id, name, avatar);
    });
  });
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
// TAB SWITCHER & CHAT CONTROLS
// ==========================================
function setupTabSwitcher() {
  const tabHistory = document.getElementById("tabHistory");
  const tabChat = document.getElementById("tabChat");
  const historyView = document.getElementById("historyView");
  const chatView = document.getElementById("chatView");

  if (tabHistory && tabChat) {
    tabHistory.addEventListener("click", () => switchMainTab("history"));
    tabChat.addEventListener("click", () => switchMainTab("chat"));
  }

  function switchMainTab(tab) {
    currentTab = tab;
    tabHistory?.classList.toggle("active", tab === "history");
    tabChat?.classList.toggle("active", tab === "chat");

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

  document.getElementById("tabPublic")?.addEventListener("click", () => switchChatTab("public"));
  document.getElementById("tabPrivate")?.addEventListener("click", () => switchChatTab("private"));

  // Gửi tin nhắn (Hỗ trợ cả Public và Private gửi lên Backend)
  document.getElementById("chatForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input?.value.trim();
    if (!text) return;

    if (chatTab === "private" && !selectedPrivateUser) {
      alert("Vui lòng chọn một khách hàng để chat riêng!");
      return;
    }

    const auctioneerName = auctionState.auctioneer.name || "Đấu giá viên";
    const userAvatar = auctionState.auctioneer.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

    const newMsg = {
      auctionId: parseInt(auctionId),
      senderId: auctionState.auctioneer.id || "auc_me",
      name: auctioneerName,
      avatar: userAvatar,
      text: text,
      time: getCurrentTime(),
      type: chatTab,
      recipientId: chatTab === "private" ? selectedPrivateUser.id : null
    };

    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newMsg)
      });
      input.value = "";
      fetchChatMessages();
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  });
}

function switchChatTab(tab) {
  chatTab = tab;
  const tabPub = document.getElementById("tabPublic");
  const tabPriv = document.getElementById("tabPrivate");
  if (tabPub) tabPub.classList.toggle("active", tab === "public");
  if (tabPriv) tabPriv.classList.toggle("active", tab === "private");

  const privateListContainer = document.getElementById("privateUserListContainer");
  if (privateListContainer) {
    if (tab === "private") {
      // Nếu chưa chọn ai thì hiển thị danh sách, nếu đã chọn người chat rồi thì ẩn hộp thông báo đi
      if (!selectedPrivateUser) {
        privateListContainer.style.display = "block";
        renderPrivateUserList();
      } else {
        privateListContainer.style.display = "none";
      }
    } else {
      privateListContainer.style.display = "none";
    }
  }
  fetchChatMessages();
}

// ==========================================
// SETUP KHÁC (SLIDESHOW, CAMERA, MODAL)
// ==========================================
function setupSlideshows() {
  setInterval(() => {
    const images = auctionState.product.images || [];
    if (images.length === 0) return;
    let currentSlideLeft = 0;
    currentSlideLeft = (currentSlideLeft + 1) % images.length;
    const track = document.getElementById("sliderTrack");
    const indicators = document.querySelectorAll("#sliderIndicators .indicator");
    if (track) track.style.transform = `translateX(-${currentSlideLeft * (100 / images.length)}%)`;
    indicators.forEach((ind, idx) => ind.classList.toggle("active", idx === currentSlideLeft));
  }, 3500);
}

let localStream = null;
let isCamOn = false;

async function startCamera() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const webcamVideo = document.getElementById("webcamVideo");
    const streamSlideshow = document.getElementById("streamSlideshow");
    if (webcamVideo) {
      webcamVideo.srcObject = localStream;
      webcamVideo.classList.remove("hidden");
    }
    if (streamSlideshow) streamSlideshow.classList.add("active");
  } catch (err) {
    alert("Không thể mở Webcam!");
    isCamOn = false;
  }
}

function stopCamera() {
  if (localStream) {
    localStream.getVideoTracks().forEach((track) => track.stop());
  }
  const webcamVideo = document.getElementById("webcamVideo");
  const streamSlideshow = document.getElementById("streamSlideshow");
  if (webcamVideo) {
    webcamVideo.classList.add("hidden");
    webcamVideo.srcObject = null;
  }
  if (streamSlideshow) streamSlideshow.classList.remove("active");
}

function setupMediaControls() {
  const toggleCamBtn = document.getElementById("toggleCamera");
  if (toggleCamBtn) {
    toggleCamBtn.addEventListener("click", async () => {
      isCamOn = !isCamOn;
      toggleCamBtn.classList.toggle("active", isCamOn);
      toggleCamBtn.innerHTML = `<i class="fa-solid ${isCamOn ? 'fa-video' : 'fa-video-slash'}"></i>`;
      if (isCamOn) await startCamera();
      else stopCamera();
    });
  }
}

function setupSessionControls() {
  const btnPauseSession = document.getElementById("btnPauseSession");
  const pauseModal = document.getElementById("pauseModal");
  const btnCancelPause = document.getElementById("btnCancelPause");
  const btnConfirmPause = document.getElementById("btnConfirmPause");

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

// Khởi chạy ứng dụng và tự động gọi API từ Database
window.addEventListener("DOMContentLoaded", () => {
  fetchAuctionDataFromBackend();
  fetchChatMessages();
  fetchParticipantsFromBackend();

  setInterval(() => {
    fetchAuctionDataFromBackend();
    fetchChatMessages();
    fetchParticipantsFromBackend();
  }, 3000);

  setupTabSwitcher();
  setupSlideshows();
  setupMediaControls();
  setupSessionControls();
  setupHammerModal();
});