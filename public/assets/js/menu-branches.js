(() => {
  const tabs = [...document.querySelectorAll("[data-menu-branch]")];
  const panels = [...document.querySelectorAll("[data-menu-panel]")];
  if (!tabs.length || !panels.length) return;

  const validBranches = ["alsancak", "atakent"];

  function activate(branch, options = {}) {
    const { updateUrl = true, scroll = true } = options;
    if (!validBranches.includes(branch)) branch = "alsancak";

    tabs.forEach((tab) => {
      const active = tab.dataset.menuBranch === branch;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.menuPanel === branch;
      panel.hidden = !active;

      if (active) {
        panel.querySelectorAll(".reveal").forEach((item) => {
          item.classList.add("is-visible");
          item.classList.remove("reveal-pending");
        });
      }
    });

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("sube", branch);
      history.replaceState({}, "", url);
    }

    if (scroll) {
      const selector = document.querySelector(".branch-selector-wrap");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (selector) {
        window.scrollTo({
          top: Math.max(0, selector.offsetTop - 80),
          behavior: reduceMotion ? "auto" : "smooth"
        });
      }
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.menuBranch));

    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + direction + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next].dataset.menuBranch);
    });
  });

  const initial = new URLSearchParams(window.location.search).get("sube");
  activate(validBranches.includes(initial) ? initial : "alsancak", {
    updateUrl: false,
    scroll: false
  });
})();
