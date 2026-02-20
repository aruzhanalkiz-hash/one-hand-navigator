// One Hand Navigator (MVP)
// Toggle with: Alt+Shift+O
(() => {
  const STATE_KEY = "__oneHandNavEnabled";
  let enabled = false;
  let elements = [];
  let idx = 0;

  let overlay, label;

  function isInteractive(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    const interactiveTags = ["a", "button", "input", "select", "textarea"];
    if (interactiveTags.includes(tag)) return true;
    const role = el.getAttribute?.("role");
    if (role === "button" || role === "link") return true;
    const tabindex = el.getAttribute?.("tabindex");
    if (tabindex !== null && tabindex !== "-1") return true;
    return false;
  }

  function collectInteractive() {
    const all = Array.from(document.querySelectorAll("*"));
    const filtered = all.filter(el => isInteractive(el) && el.offsetParent !== null);
    return filtered;
  }

  function ensureOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.className = "ohn-overlay";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "◀ Prev";
    prevBtn.onclick = () => move(-1);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next ▶";
    nextBtn.onclick = () => move(1);

    const clickBtn = document.createElement("button");
    clickBtn.textContent = "Click ✅";
    clickBtn.onclick = () => clickCurrent();

    const exitBtn = document.createElement("button");
    exitBtn.textContent = "Exit ✖";
    exitBtn.onclick = () => disable();

    label = document.createElement("div");
    label.className = "ohn-label";
    label.textContent = "0 / 0";

    overlay.append(prevBtn, nextBtn, clickBtn, exitBtn, label);
    document.documentElement.appendChild(overlay);
  }

  function updateLabel() {
    if (!label) return;
    label.textContent = `${elements.length ? idx + 1 : 0} / ${elements.length}`;
  }

  function highlight(el) {
    elements.forEach(e => e.classList.remove("ohn-focus"));
    if (!el) return;
    el.classList.add("ohn-focus");
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  }

  function refresh() {
    elements = collectInteractive();
    idx = 0;
    highlight(elements[idx]);
    updateLabel();
  }

  function move(delta) {
    if (!enabled) return;
    if (!elements.length) refresh();
    idx = (idx + delta + elements.length) % elements.length;
    highlight(elements[idx]);
    updateLabel();
  }

  function clickCurrent() {
    if (!enabled) return;
    const el = elements[idx];
    if (!el) return;
    el.click();
  }

  function enable() {
    enabled = true;
    ensureOverlay();
    refresh();
    window[STATE_KEY] = true;
  }

  function disable() {
    enabled = false;
    window[STATE_KEY] = false;
    elements.forEach(e => e.classList.remove("ohn-focus"));
    if (overlay) overlay.remove();
    overlay = null;
    label = null;
  }

  function toggle() {
    if (enabled) disable();
    else enable();
  }

  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    // Toggle: Alt+Shift+O
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === "o") {
      e.preventDefault();
      toggle();
      return;
    }
    if (!enabled) return;

    // Alt+J = next, Alt+K = prev, Alt+Enter = click
    if (e.altKey && e.key.toLowerCase() === "j") {
      e.preventDefault();
      move(1);
    } else if (e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      move(-1);
    } else if (e.altKey && e.key === "Enter") {
      e.preventDefault();
      clickCurrent();
    } else if (e.key === "Escape") {
      e.preventDefault();
      disable();
    }
  });

  // Don’t auto-enable; user toggles.
})();

