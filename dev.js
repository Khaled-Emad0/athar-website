// =======================
// إعدادات عامة لوضع المطوّر
// =======================

let devMode = false;
const DEV_PASSWORD = "1";
const VOL_KEY = "ATHAR_VOLUNTEERS_V1";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const pageId = body.dataset.page || "";

  const devToggle = document.getElementById("devToggle");
  const devPanel  = document.getElementById("devPanel");

  // زر الرجوع للأعلى
  const backBtn = document.getElementById("backToTop");
  if (backBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) backBtn.style.display = "block";
      else backBtn.style.display = "none";
    });
    backBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // تفعيل وضع المطوّر بكلمة مرور
  if (devToggle && devPanel) {
    devToggle.addEventListener("click", () => {
      if (!devMode) {
        const pwd = prompt("أدخل كلمة المرور لوضع المطوّر:");
        if (pwd !== DEV_PASSWORD) {
          alert("كلمة المرور غير صحيحة.");
          return;
        }
        devMode = true;
      } else {
        devMode = false;
      }
      body.classList.toggle("dev-mode", devMode);
      devPanel.classList.toggle("open", devMode);
      applyEditable(devMode);
    });
  }

  function applyEditable(on) {
    document.querySelectorAll(".editable").forEach((el) => {
      if (on) el.setAttribute("contenteditable", "true");
      else el.removeAttribute("contenteditable");
    });
  }

  // إعداد صفحة المتطوعين فقط
  if (pageId === "volunteers") {
    setupVolunteers(devPanel);
  } else {
    const volTools = document.getElementById("volTools");
    if (volTools) volTools.style.display = "none";
  }
});

// =======================
// بيانات المتطوعين (localStorage)
// =======================

function loadVolData() {
  try {
    const raw = localStorage.getItem(VOL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.committees)) return parsed;
    }
  } catch (e) {
    console.warn("تعذر قراءة بيانات المتطوعين:", e);
  }

  // بيانات افتراضية
  return {
    joinFormUrl: "",
    committees: [
      {
        id: "design",
        name: "لجنة الديزاين",
        volunteers: [
          {
            id: "d1",
            name: "متطوع ديزاين 1",
            role: "مصمم جرافيك",
            photo: "assets/images/volunteers/ali1.jpg",
            whatsapp: "",
            bio: ""
          }
        ]
      },
      {
        id: "media",
        name: "لجنة الميديا",
        volunteers: [
          {
            id: "m1",
            name: "متطوع ميديا 1",
            role: "مونتير / سوشيال ميديا",
            photo: "assets/images/volunteers/braa.jpg",
            whatsapp: "",
            bio: ""
          }
        ]
      }
    ]
  };
}

function saveVolData(data) {
  try {
    localStorage.setItem(VOL_KEY, JSON.stringify(data));
  } catch (e) {
    alert("تعذر حفظ بيانات المتطوعين في هذا المتصفح.");
  }
}

// =======================
// إعداد صفحة المتطوعين
// =======================

let currentVolData = null;
let volJoinUrl = "";

function setupVolunteers(devPanel) {
  const root = document.getElementById("volunteersRoot");
  if (!root) return;

  const data = loadVolData();
  currentVolData = data;

  renderVolunteers(root, data);
  updateJoinLink(data);
  setupVolModal();
  buildVolTools(devPanel, data, root);
}

// رسم المتطوعين واللجان
function renderVolunteers(root, data) {
  root.innerHTML = "";

  data.committees.forEach((com) => {
    const block = document.createElement("section");
    block.className = "committee-block card";
    block.dataset.comId = com.id;

    const title = document.createElement("h3");
    title.className = "committee-title";
    title.textContent = com.name;
    block.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "volunteers-grid";

    com.volunteers.forEach((v) => {
      const card = document.createElement("div");
      card.className = "vol-card";
      card.dataset.comId = com.id;
      card.dataset.volId = v.id;

      const img = document.createElement("img");
      img.src = v.photo;
      img.alt = v.name;

      const name = document.createElement("div");
      name.className = "vol-name";
      name.textContent = v.name;

      const role = document.createElement("div");
      role.className = "vol-role";
      role.textContent = "(" + v.role + ")";

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(role);

      if (v.whatsapp) {
        const wa = document.createElement("div");
        wa.className = "vol-wa-tag";
        wa.textContent = "متاح للتواصل عبر واتساب";
        card.appendChild(wa);
      }

      card.addEventListener("click", () => {
        openVolModal(v);
      });

      grid.appendChild(card);
    });

    block.appendChild(grid);
    root.appendChild(block);
  });
}

// تحديث زر طلب الانضمام
function updateJoinLink(data) {
  const btn = document.getElementById("joinButton");
  volJoinUrl = (data && data.joinFormUrl) || "";
  if (!btn) return;

  if (volJoinUrl) {
    btn.href = volJoinUrl;
    btn.style.display = "inline-block";
  } else {
    btn.href = "#";
    btn.style.display = "inline-block"; // يبقى ظاهر بدون رابط حقيقي
  }
}

// =======================
// نافذة تفاصيل المتطوع (Modal)
// =======================

function setupVolModal() {
  const modal   = document.getElementById("volModal");
  const closeBtn = document.getElementById("closeVolModal");
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

function openVolModal(v) {
  const modal = document.getElementById("volModal");
  if (!modal) return;

  const img      = document.getElementById("volModalImg");
  const nameEl   = document.getElementById("volModalName");
  const roleEl   = document.getElementById("volModalRole");
  const bioEl    = document.getElementById("volModalBio");
  const waLink   = document.getElementById("volModalWhats");
  const joinLink = document.getElementById("volModalJoin");

  if (img)    img.src = v.photo || "";
  if (nameEl) nameEl.textContent = v.name || "";
  if (roleEl) roleEl.textContent = v.role ? "(" + v.role + ")" : "";
  if (bioEl)  bioEl.textContent  = v.bio || "";

  if (waLink) {
    if (v.whatsapp) {
      const clean = v.whatsapp.replace(/\D/g, "");
      waLink.href = "https://wa.me/" + clean;
      waLink.style.display = "inline-block";
    } else {
      waLink.style.display = "none";
    }
  }

  if (joinLink) {
    if (volJoinUrl) {
      joinLink.href = volJoinUrl;
      joinLink.style.display = "inline-block";
    } else {
      joinLink.href = "#";
      joinLink.style.display = "inline-block";
    }
  }

  modal.style.display = "block";
}

// =======================
// لوحة أدوات المتطوعين (وضع المطوّر)
// =======================

function buildVolTools(devPanel, data, root) {
  const tools = document.getElementById("volTools");
  if (!tools) return;

  // التبويبات
  const tabButtons = tools.querySelectorAll(".dev-tab-btn");
  const tabs       = tools.querySelectorAll(".dev-tab");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabs.forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      const tab = tools.querySelector("#tab-" + target);
      if (tab) tab.classList.add("active");
    });
  });

  const comSelect          = document.getElementById("volComSelect");
  const newComNameInput    = document.getElementById("newCommitteeName");
  const addComBtn          = document.getElementById("btnAddCommittee");
  const volNameInput       = document.getElementById("volName");
  const volRoleInput       = document.getElementById("volRole");
  const volPhotoInput      = document.getElementById("volPhoto");
  const volWhatsInput      = document.getElementById("volWhats");
  const volBioInput        = document.getElementById("volBio");
  const addVolBtn          = document.getElementById("btnAddVolunteer");
  const resetVolBtn        = document.getElementById("btnResetVolunteers");
  const joinInput          = document.getElementById("joinUrl");
  const saveJoinBtn        = document.getElementById("btnSaveJoin");

  // عناصر الحذف الجديدة
  const volDeleteSelect    = document.getElementById("volDeleteSelect");
  const btnDeleteVolunteer = document.getElementById("btnDeleteVolunteer");

  function refreshComOptions() {
    if (!comSelect) return;
    comSelect.innerHTML = "";
    data.committees.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      comSelect.appendChild(opt);
    });
    refreshDeleteList();
  }

  function refreshDeleteList() {
    if (!volDeleteSelect || !comSelect) return;
    volDeleteSelect.innerHTML = "";
    const comId = comSelect.value;
    const com = data.committees.find((c) => c.id === comId);
    if (!com) return;
    com.volunteers.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.name + (v.role ? " — " + v.role : "");
      volDeleteSelect.appendChild(opt);
    });
  }

  refreshComOptions();

  if (comSelect) {
    comSelect.addEventListener("change", () => {
      refreshDeleteList();
    });
  }

  if (joinInput) {
    joinInput.value = data.joinFormUrl || "";
  }

  // إضافة لجنة جديدة
  if (addComBtn) {
    addComBtn.addEventListener("click", () => {
      const name = (newComNameInput.value || "").trim();
      if (!name) {
        alert("اكتب اسم اللجنة الجديدة أولاً.");
        return;
      }
      const id = "com_" + Date.now();
      data.committees.push({ id, name, volunteers: [] });
      saveVolData(data);
      refreshComOptions();
      renderVolunteers(root, data);
      newComNameInput.value = "";
    });
  }

  // إضافة متطوع جديد
  if (addVolBtn) {
    addVolBtn.addEventListener("click", () => {
      const comId = comSelect ? comSelect.value : null;
      const name  = (volNameInput.value || "").trim();
      const role  = (volRoleInput.value || "").trim();
      let photo   = (volPhotoInput.value || "").trim();
      const whatsapp = (volWhatsInput.value || "").trim();
      const bio      = (volBioInput.value || "").trim();

      if (!comId || !name || !role) {
        alert("يجب إدخال اللجنة، اسم المتطوع، ودوره.");
        return;
      }

      if (!photo) {
        photo = "assets/images/volunteers/default.png";
      } else if (!photo.startsWith("assets/")) {
        photo = "assets/images/volunteers/" + photo;
      }

      const com = data.committees.find((c) => c.id === comId);
      if (!com) {
        alert("تعذر العثور على اللجنة.");
        return;
      }

      const vol = {
        id: "v_" + Date.now(),
        name,
        role,
        photo,
        whatsapp,
        bio
      };

      com.volunteers.push(vol);
      saveVolData(data);
      renderVolunteers(root, data);
      refreshDeleteList();

      volNameInput.value  = "";
      volRoleInput.value  = "";
      volPhotoInput.value = "";
      volWhatsInput.value = "";
      volBioInput.value   = "";
    });
  }

  // حذف متطوع موجود
  if (btnDeleteVolunteer && volDeleteSelect && comSelect) {
    btnDeleteVolunteer.addEventListener("click", () => {
      if (!document.body.classList.contains("dev-mode")) {
        alert("يمكن حذف المتطوعين فقط من داخل وضع المطوّر.");
        return;
      }
      const comId = comSelect.value;
      const volId = volDeleteSelect.value;
      if (!comId || !volId) {
        alert("اختر اللجنة والمتطوع أولاً.");
        return;
      }

      const com = data.committees.find((c) => c.id === comId);
      if (!com) {
        alert("تعذر العثور على اللجنة.");
        return;
      }

      const vol = com.volunteers.find((v) => v.id === volId);
      if (!vol) {
        alert("تعذر العثور على المتطوع.");
        return;
      }

      if (!confirm('هل أنت متأكد من حذف المتطوع "' + vol.name + '" من هذه اللجنة؟')) {
        return;
      }

      com.volunteers = com.volunteers.filter((v) => v.id !== volId);
      saveVolData(data);
      renderVolunteers(root, data);
      refreshDeleteList();
    });
  }

  // إعادة تعيين المتطوعين للوضع الافتراضي
  if (resetVolBtn) {
    resetVolBtn.addEventListener("click", () => {
      if (!confirm("هل أنت متأكد من إعادة تعيين بيانات المتطوعين للوضع الافتراضي؟")) return;
      localStorage.removeItem(VOL_KEY);
      const fresh = loadVolData();
      saveVolData(fresh);
      renderVolunteers(root, fresh);
      data.committees = fresh.committees;
      if (joinInput) joinInput.value = fresh.joinFormUrl || "";
      refreshComOptions();
    });
  }

  // حفظ رابط نموذج الانضمام
  if (saveJoinBtn && joinInput) {
    saveJoinBtn.addEventListener("click", () => {
      const url = (joinInput.value || "").trim();
      data.joinFormUrl = url;
      saveVolData(data);
      updateJoinLink(data);
      alert("تم حفظ رابط الانضمام.");
    });
  }
}
