
let devMode = false;
const DEV_PASSWORD = "112233";
const VOL_KEY = "ATHAR_VOLUNTEERS_V1";

document.addEventListener("DOMContentLoaded", () => {
  const devToggle = document.getElementById("devToggle");
  const devPanel = document.getElementById("devPanel");
  const body = document.body;
  const pageId = body.dataset.page || "";

  // Back to top
  const backBtn = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) backBtn.style.display = "block";
    else backBtn.style.display = "none";
  });
  backBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Dev mode toggle with password
  if (devToggle) {
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

  // Lightbox for gallery
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const closeLb = document.getElementById("closeLightbox");
  if (lb && lbImg && closeLb) {
    document.querySelectorAll(".gallery-img").forEach((img) => {
      img.addEventListener("click", () => {
        lb.style.display = "block";
        lbImg.src = img.src;
      });
    });
    closeLb.addEventListener("click", () => (lb.style.display = "none"));
    lb.addEventListener("click", (e) => {
      if (e.target === lb) lb.style.display = "none";
    });
  }

  // Volunteers management (only on volunteers page)
  if (pageId === "volunteers") {
    setupVolunteers(devPanel);
  } else {
    const volTools = document.getElementById("volTools");
    if (volTools) volTools.style.display = "none";
  }
});

// Volunteers data helpers
function loadVolData() {
  try {
    const raw = localStorage.getItem(VOL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("تعذر قراءة بيانات المتطوعين:", e);
  }
  // default structure
  return {
    committees: [
      {
        id: "design",
        name: "لجنة الديزاين",
        volunteers: [
          {
            id: "d1",
            name: "متطوع ديزاين 1",
            role: "مصمم جرافيك",
            photo: "assets/images/volunteers/design1.jpg"
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
            photo: "assets/images/volunteers/media1.jpg"
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
    alert("تعذر حفظ بيانات المتطوعين في المتصفح.");
  }
}

function setupVolunteers(devPanel) {
  const root = document.getElementById("volunteersRoot");
  if (!root) return;

  let data = loadVolData();
  renderVolunteers(root, data);
  buildVolTools(devPanel, data, root);
}

function renderVolunteers(root, data) {
  root.innerHTML = "";
  data.committees.forEach((com) => {
    const block = document.createElement("div");
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
      grid.appendChild(card);
    });

    block.appendChild(grid);
    root.appendChild(block);
  });

  // Click to edit volunteer when in dev mode
  root.addEventListener("click", (e) => {
    const card = e.target.closest(".vol-card");
    if (!card) return;
    if (!document.body.classList.contains("dev-mode")) return;

    const comId = card.dataset.comId;
    const volId = card.dataset.volId;
    let data = loadVolData();
    const com = data.committees.find((c) => c.id === comId);
    if (!com) return;
    const v = com.volunteers.find((vv) => vv.id === volId);
    if (!v) return;

    const newName = prompt("اسم المتطوع:", v.name);
    if (newName === null) return;
    const newRole = prompt("دور المتطوع:", v.role);
    if (newRole === null) return;
    const newPhoto = prompt(
      "مسار صورة المتطوع (مثال: assets/images/volunteers/photo.jpg):",
      v.photo
    );
    if (newPhoto === null) return;

    v.name = newName.trim() || v.name;
    v.role = newRole.trim() || v.role;
    v.photo = newPhoto.trim() || v.photo;

    saveVolData(data);
    renderVolunteers(root, data);
  });
}

function buildVolTools(devPanel, data, root) {
  const tools = document.getElementById("volTools");
  if (!tools) return;

  const comSelect = document.getElementById("volComSelect");
  const newComNameInput = document.getElementById("newCommitteeName");
  const addComBtn = document.getElementById("btnAddCommittee");
  const volNameInput = document.getElementById("volName");
  const volRoleInput = document.getElementById("volRole");
  const volPhotoInput = document.getElementById("volPhoto");
  const addVolBtn = document.getElementById("btnAddVolunteer");
  const resetVolBtn = document.getElementById("btnResetVolunteers");

  function refreshComOptions() {
    comSelect.innerHTML = "";
    data.committees.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      comSelect.appendChild(opt);
    });
  }
  refreshComOptions();

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

  addVolBtn.addEventListener("click", () => {
    const comId = comSelect.value;
    const name = (volNameInput.value || "").trim();
    const role = (volRoleInput.value || "").trim();
    let photo = (volPhotoInput.value || "").trim();

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
      photo
    };
    com.volunteers.push(vol);
    saveVolData(data);
    renderVolunteers(root, data);

    volNameInput.value = "";
    volRoleInput.value = "";
    volPhotoInput.value = "";
  });

  resetVolBtn.addEventListener("click", () => {
    if (!confirm("هل أنت متأكد من إعادة تعيين بيانات المتطوعين للمبدئية؟")) return;
    localStorage.removeItem(VOL_KEY);
    data = loadVolData();
    saveVolData(data);
    refreshComOptions();
    renderVolunteers(root, data);
  });
}
