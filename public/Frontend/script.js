const el = (id) => document.getElementById(id);

/* ================= ELEMENTS ================= */
const nameEl = el("name");
const roleEl = el("role");
const bioEl = el("bio");

const chatBox = el("chat-box");
const userInput = el("user-input");
const sendBtn = el("send-btn");

const form = el("guestbook-form");
const gbName = el("gb-name");
const gbMessage = el("gb-message");
const messagesList = el("messages-list");

const loader = el("loader");
const chatToggle = el("chat-toggle");
const chatModal = el("chat-modal");
const closeChat = el("close-chat");

/* ================= UI & MICRO INTERACTIONS ================= */

// Loader Cinematic Fade
window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 1500);
});

// Dynamic Year Footer
el("current-year").textContent = new Date().getFullYear();

// Navbar Scroll Effect
const navbar = el("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Mobile Hamburger Menu
const hamburger = el("hamburger");
const navLinks = el("nav-links");
const links = document.querySelectorAll(".nav-links a");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");
});

links.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    hamburger.classList.remove("active");
  });
});

// Scroll Reveal & Skill Bar Animation Observer
const revealElements = document.querySelectorAll(".reveal");
const bars = document.querySelectorAll(".bar");
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

const observerOptions = { threshold: 0.15 };

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    // Reveal Elements
    if (entry.isIntersecting && entry.target.classList.contains('reveal')) {
      entry.target.classList.add("active");
    }
    
    // Skill Bars
    if (entry.isIntersecting && entry.target.classList.contains('bar')) {
      const percent = entry.target.getAttribute("data-percent");
      entry.target.style.width = percent + "%";
    }

    // Active Navbar Link Update
    if (entry.isIntersecting && entry.target.tagName === 'SECTION') {
      let id = entry.target.getAttribute('id');
      navItems.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, observerOptions);

revealElements.forEach((el) => scrollObserver.observe(el));
bars.forEach((bar) => scrollObserver.observe(bar));
sections.forEach((sec) => scrollObserver.observe(sec));


/* ================= PROFILE API ================= */
async function loadProfile() {
  try {
    const res = await fetch("http://localhost:5000/profile");
    const json = await res.json();

    const p = json?.data?.profile;
    if (p) {
      nameEl.textContent = p.name || "Nama Kamu";
      roleEl.textContent = p.role || "Fullstack Developer";
      bioEl.textContent = p.bio || "";
    }
  } catch (err) {
    console.log("Gagal load profile:", err);
  }
}


/* ================= CHATBOT UPGRADE ================= */
chatToggle.addEventListener("click", () => {
  chatModal.classList.toggle("show");
  if(chatModal.classList.contains("show")) {
      chatToggle.classList.remove("pulse-anim");
  }
});

closeChat.addEventListener("click", () => {
  chatModal.classList.remove("show");
});

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
  
  const icon = role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
  
  div.innerHTML = `
    <div class="msg-avatar">${icon}</div>
    <div class="msg-bubble">${text}</div>
  `;
  
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const div = document.createElement("div");
  div.className = "msg bot-msg typing-msg";
  div.id = "typing-indicator";
  div.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
    <div class="msg-bubble">
      <div class="typing-indicator">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typingMsg = el("typing-indicator");
  if (typingMsg) typingMsg.remove();
}

async function sendChat() {
  const text = userInput.value.trim();
  if (!text) return;

  // 1. Tampilkan pesan user
  appendMessage("user", text);
  userInput.value = "";
  
  // 2. Tampilkan typing indicator bot
  showTypingIndicator();

  try {
    const res = await fetch(
      `http://localhost:5000/chat?prompt=${encodeURIComponent(text)}`
    );
    const json = await res.json();
    let content = json?.message?.content ?? "Tidak ada jawaban dari server.";
    
    // 3. Hapus typing & tampilkan jawaban
    removeTypingIndicator();
    appendMessage("bot", content);
  } catch (err) {
    removeTypingIndicator();
    appendMessage("bot", "Koneksi server terputus. Mohon coba lagi.");
  }
}

sendBtn.addEventListener("click", sendChat);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});


/* ================= GUESTBOOK API ================= */
function renderMessages(messages) {
  messagesList.innerHTML = "";

  messages
    .slice()
    .reverse()
    .forEach((m) => {
      const card = document.createElement("div");
      card.className = "message-card glass"; // Added glass class for premium look

      card.innerHTML = `
        <p class="who"><i class="fa-regular fa-user-circle"></i> ${m.name}</p>
        <p class="text">${m.message}</p>
      `;

      messagesList.appendChild(card);
    });
}

async function loadGuestbook() {
  try {
    const res = await fetch("http://localhost:5000/guestbook");
    const json = await res.json();
    renderMessages(json.data || []);
  } catch (err) {
    console.log("Gagal load guestbook:", err);
  }
}

async function submitGuestbook(e) {
  e.preventDefault();

  const name = gbName.value.trim();
  const message = gbMessage.value.trim();
  if (!name || !message) return;

  // Ubah state button saat loading
  const btn = form.querySelector('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
  btn.disabled = true;

  try {
    const res = await fetch("http://localhost:5000/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });

    const json = await res.json();
    if (json.status === "success") {
      gbName.value = "";
      gbMessage.value = "";
      await loadGuestbook();
    }
  } catch (err) {
    console.log("Gagal kirim pesan:", err);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

form.addEventListener("submit", submitGuestbook);

/* ================= INIT ================= */
loadProfile();
loadGuestbook();