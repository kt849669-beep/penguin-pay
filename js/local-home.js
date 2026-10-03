document.addEventListener("DOMContentLoaded", () => {
  const sessionKey = "penguinpay_session";
  const savedSession = sessionStorage.getItem(sessionKey);
  const clearSession = () => {
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem("mpin_pending");
  };
  const logout = () => {
    clearSession();
    window.location.replace("./index.html");
  };
  if (!savedSession || performance.getEntriesByType("navigation")[0]?.type === "reload") {
    logout();
    return;
  }

  window.addEventListener("pagehide", clearSession);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) logout();
  });

  // 15-second automatic sign-out
  const AUTO_LOGOUT_DELAY = 15000;
  const autoLogoutTimer = setTimeout(logout, AUTO_LOGOUT_DELAY);

  const slider = document.getElementById("sliderContainer");
  const floatBtn = document.getElementById("floatingSupport");
  const panels = {
    home: document.getElementById("homeSection"),
    me: document.getElementById("profileSection"),
    deposit: document.getElementById("depositSection")
  };
  try {
    const user = JSON.parse(savedSession);
    const profileEl = document.getElementById("profileUserId");
    if (profileEl) {
      profileEl.textContent = user.mobile || user.id || "—";
    }
  } catch {}

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const selected = item.dataset.screen;
      const page = panels[selected] ? selected : "home";
      Object.entries(panels).forEach(([name, panel]) => { if (panel) panel.hidden = name !== page; });
      if (floatBtn) floatBtn.hidden = page === "deposit";
      navItems.forEach((nav) => {
        const active = nav === item;
        nav.classList.toggle("active", active);
        if (active) nav.setAttribute("aria-current", "page");
        else nav.removeAttribute("aria-current");
      });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  });

  let bannerOverlayElement = null;

  function renderSettings() {
    let slides = [];
    let telegram = null;
    let banner = null;

    try {
      const slidesRaw = localStorage.getItem("penguinpay_table_slider_images");
      if (slidesRaw) slides = JSON.parse(slidesRaw);
    } catch(e) {}

    try {
      const telRaw = localStorage.getItem("penguinpay_table_telegram_popup");
      if (telRaw) {
        const tList = JSON.parse(telRaw);
        if (tList.length > 0) telegram = tList[0];
      }
    } catch(e) {}

    try {
      const banRaw = localStorage.getItem("penguinpay_table_banner_popup");
      if (banRaw) {
        const bList = JSON.parse(banRaw);
        if (bList.length > 0) banner = bList[0];
      }
    } catch(e) {}

    // Render Slider
    if (slider) {
      if (slides && slides.length > 0) {
        slider.dataset.defaultSlide = "false";
        slider.innerHTML = '';
        const newDots = document.createElement("div");
        newDots.id = "sliderDots";
        newDots.className = "slider-dots";
        slider.appendChild(newDots);
        
        slides.forEach((slide, idx) => {
          const el = document.createElement("div");
          el.className = "slide image-promo" + (idx === 0 ? " active" : "");
          el.style.backgroundImage = `url('${slide.image_url || slide.src}')`;
          slider.insertBefore(el, newDots);
          
          const dot = document.createElement("div");
          dot.className = "dot" + (idx === 0 ? " active" : "");
          newDots.appendChild(dot);
        });
      } else {
        slider.dataset.defaultSlide = "true";
        slider.innerHTML = '';
        const newDots = document.createElement("div");
        newDots.id = "sliderDots";
        newDots.className = "slider-dots";
        slider.appendChild(newDots);
        
        const promo = document.createElement("div");
        promo.className = "slide image-promo active";
        promo.setAttribute("role", "img");
        promo.style.backgroundImage = "url('/hero-slots.jpeg')";
        slider.insertBefore(promo, newDots);
        const dot = document.createElement("div");
        dot.className = "dot active";
        newDots.appendChild(dot);
      }
    }

    // Telegram popup
    const overlay = document.getElementById("overlay");
    const tel = document.getElementById("telegramPopup");
    const telBtn = document.getElementById("telegramJoinBtn");
    if (tel && telBtn && overlay) {
      if (telegram && telegram.is_enabled) {
        telBtn.href = telegram.telegram_url || '#';
        overlay.classList.remove("hidden");
        tel.classList.remove("hidden");
        const closeBtn = document.getElementById("telegramCloseBtn");
        if (closeBtn) {
          closeBtn.onclick = () => {
            tel.classList.add("hidden");
            if (Array.from(overlay.children).every(c => c.classList.contains("hidden"))) overlay.classList.add("hidden");
          };
        }
      } else {
        tel.classList.add("hidden");
        if (Array.from(overlay.children).every(c => c.classList.contains("hidden"))) overlay.classList.add("hidden");
      }
    }

    // Banner popup
    if (bannerOverlayElement) {
      bannerOverlayElement.remove();
      bannerOverlayElement = null;
    }
    
    if (banner && banner.is_enabled && banner.banner_url) {
      bannerOverlayElement = document.createElement("div");
      bannerOverlayElement.style = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
      bannerOverlayElement.innerHTML = `<div style="position:relative;max-width:400px;width:100%;"><span onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:-15px;right:-15px;background:#fff;color:#000;width:30px;height:30px;border-radius:50%;text-align:center;line-height:30px;cursor:pointer;font-weight:bold;z-index:10000;box-shadow:0 2px 4px rgba(0,0,0,0.2);">✕</span><img src="${banner.banner_url}" style="width:100%;border-radius:12px;display:block;"/></div>`;
      document.body.appendChild(bannerOverlayElement);
    }
  }

  renderSettings();

  window.addEventListener("storage", renderSettings);
  window.addEventListener("penguinpay_db_change", renderSettings);

  if (window.lucide) window.lucide.createIcons();
});
