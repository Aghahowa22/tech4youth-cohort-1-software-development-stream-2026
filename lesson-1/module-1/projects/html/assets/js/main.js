/* =========================================================
   Emmanuel Omonzebaguan — Portfolio
   main.js
   Three jobs, each guarded so this one file can be shared
     3. Validate the contact form before it "submits" (contact.html)
   ========================================================= */
const ICONS = {
  grid: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  flex: '<svg class="icon" viewBox="0 0 24 24"><rect x="2.5" y="8" width="5" height="8" rx="1"/><rect x="9.5" y="5" width="5" height="14" rx="1"/><rect x="16.5" y="9" width="5" height="6" rx="1"/></svg>',
  fetch:
    '<svg class="icon" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14.9-4"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14.9 4"/><path d="M4 20v-5h5"/></svg>',
  arrow:
    '<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
  back: '<svg class="icon" viewBox="0 0 24 24"><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></svg>',
  eye: '<svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:
    '<svg class="icon" viewBox="0 0 24 24"><path d="M17.9 17.9A10.7 10.7 0 0 1 12 19c-7 0-11-7-11-7a19.4 19.4 0 0 1 4.2-5.1M9.9 4.2A9.7 9.7 0 0 1 12 4c7 0 11 7 11 7a19.6 19.6 0 0 1-2.2 3.1"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M1 1l22 22"/></svg>',
  alert:
    '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
  check:
    '<svg class="icon" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  mail: '<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>',
  phone:
    '<svg class="icon" viewBox="0 0 24 24"><path d="M4 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 5a2 2 0 0 1 2-2z"/></svg>',
  pin: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  file: '<svg class="icon" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/></svg>',
};

document.addEventListener("DOMContentLoaded", () => {
  initBlogGrid();
  initContactForm();
});

/* =========================================================
   1. Blog grid (index.html) — fetch + render
   ========================================================= */
function initBlogGrid() {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  const stateMsg = document.getElementById("blog-state");
  const setState = (text, isError = false) => {
    if (!stateMsg) return;
    stateMsg.textContent = text;
    stateMsg.classList.toggle("is-error", isError);
    stateMsg.style.display = text ? "block" : "none";
  };

  setState("Loading posts…");

  fetch("./assets/data/posts.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      return res.json();
    })
    .then((posts) => {
      setState("");
      grid.innerHTML = posts.map(postCardTemplate).join("");
    })
    .catch((err) => {
      setState("Couldn't load posts right now. Please refresh the page.", true);
      console.error("Failed to fetch posts.json:", err);
    });
}

function postCardTemplate(post) {
  const dateLabel = formatDate(post.date);
  return `
    <article class="post-card">
      <div class="post-icon">${ICONS[post.icon] || ICONS.file}</div>
      <time datetime="${post.date}">${dateLabel}</time>
      <h4>${escapeHTML(post.title)}</h4>
      <p>${escapeHTML(post.excerpt)}</p>
      <a class="post-link" href="details.html?id=${post.id}">
        Read more ${ICONS.arrow}
      </a>
    </article>
  `;
}

/* =========================================================
   3. Contact form validation (contact.html)
   ========================================================= */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");

  const rules = {
    fullname: {
      validate: (v) => v.trim().length >= 3,
      message: "Enter your full name (at least 3 characters).",
    },
    email: {
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: "Enter a valid email address, like name@example.com.",
    },
    dob: {
      validate: (v) => {
        if (!v) return false;
        const dob = new Date(v);
        if (Number.isNaN(dob.getTime()) || dob > new Date()) return false;
        const age = getAge(dob);
        return age >= 13;
      },
      message: "You must enter a valid date of birth (13 years or older).",
    },
    password: {
      validate: (v) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v),
      message:
        "Password needs 8+ characters, with at least one letter and one number.",
    },
    phone: {
      validate: (v) => /^\d{9,13}$/.test(v.trim()),
      message: "Enter a valid phone number (9–13 digits, no spaces).",
    },
    file: {
      validate: (input) => {
        const f = input.files[0];
        if (!f) return false;
        const okType =
          /^image\/(png|jpe?g)$/.test(f.type) || f.type === "application/pdf";
        const okSize = f.size <= 2 * 1024 * 1024; // 2MB
        return okType && okSize;
      },
      message: "Upload a passport photo or PDF, 2MB or smaller.",
    },
  };

  // Password show/hide toggle
  const pwToggle = document.getElementById("toggle-password");
  const pwInput = document.getElementById("password");
  if (pwToggle && pwInput) {
    pwToggle.addEventListener("click", () => {
      const isHidden = pwInput.type === "password";
      pwInput.type = isHidden ? "text" : "password";
      pwToggle.innerHTML = isHidden ? ICONS.eyeOff : ICONS.eye;
      pwToggle.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password",
      );
    });
  }

  // Validate one field and reflect the result in the UI
  function validateField(name) {
    const rule = rules[name];
    if (!rule) return true;
    const fieldEl = form.querySelector(`[data-field="${name}"]`);
    const input = form.elements[name];
    const msgEl = fieldEl.querySelector(".field-msg");
    const valid =
      name === "file" ? rule.validate(input) : rule.validate(input.value);

    fieldEl.classList.toggle("has-error", !valid);
    fieldEl.classList.toggle("has-success", valid);
    if (msgEl) msgEl.innerHTML = valid ? "" : `${ICONS.alert} ${rule.message}`;
    return valid;
  }

  // Live validation as the user moves through the form
  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    const evt = name === "file" ? "change" : "blur";
    input.addEventListener(evt, () => validateField(name));
    input.addEventListener("input", () => {
      const fieldEl = form.querySelector(`[data-field="${name}"]`);
      if (fieldEl.classList.contains("has-error")) validateField(name);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const results = Object.keys(rules).map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      showStatus(false, "Please fix the highlighted fields before submitting.");
      const firstError = form.querySelector(".has-error input");
      if (firstError) firstError.focus();
      return;
    }

    showStatus(true, "Thanks! Your message has been sent.");
    form.reset();
    form
      .querySelectorAll(".field")
      .forEach((f) => f.classList.remove("has-error", "has-success"));
  });

  function showStatus(success, text) {
    if (!status) return;
    status.innerHTML = `${success ? ICONS.check : ICONS.alert} ${text}`;
    status.classList.add("is-visible");
    status.classList.toggle("is-success", success);
    status.classList.toggle("is-error", !success);
  }
}

/* ---------- shared helpers -------------------------------- */
function getAge(dob) {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate()))
    age--;
  return age;
}

function formatDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
