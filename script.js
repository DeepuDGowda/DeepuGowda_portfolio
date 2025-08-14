document.addEventListener("DOMContentLoaded", () => {
  // ========= Sidebar (mobile) =========
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const backdrop = document.getElementById("backdrop");
  const navLinks = document.querySelectorAll(".sidebar nav a, .mobile-footer__link");

  const isMobile = () => window.innerWidth <= 768;

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    if (isMobile()) {
      document.body.classList.add("no-scroll");
      backdrop?.classList.add("show");
    }
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    document.body.classList.remove("no-scroll");
    backdrop?.classList.remove("show");
  }

  function toggleSidebar() {
    if (!sidebar) return;
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  }

  // Hamburger + keyboard
  if (menuToggle) {
    menuToggle.addEventListener("click", toggleSidebar);
    menuToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSidebar();
      }
    });
  }

  // Smooth scroll + close on mobile after tapping nav
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
          history.pushState(null, "", href); // update URL hash without jump
        }
      }
      if (isMobile()) setTimeout(closeSidebar, 50);
    });
  });

  // Backdrop click closes
  backdrop?.addEventListener("click", closeSidebar);

  // Esc closes (mobile)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMobile() && sidebar?.classList.contains("open")) {
      closeSidebar();
    }
  });

  // Hash changes (programmatic) -> close on mobile
  window.addEventListener("hashchange", () => {
    if (isMobile()) closeSidebar();
  });

  // On resize to desktop, clean overlay state
  window.addEventListener("resize", () => {
    if (!isMobile()) {
      document.body.classList.remove("no-scroll");
      backdrop?.classList.remove("show");
    }
  });

  // ========= Collapsible sections =========

  // Slide anim helpers
  function slideDown(el) {
    el.hidden = false;
    el.style.height = "0px";
    el.style.overflow = "hidden";
    el.getBoundingClientRect(); // reflow
    el.style.transition = "height .22s ease";
    el.style.height = el.scrollHeight + "px";
    el.addEventListener("transitionend", function onEnd() {
      el.style.height = "";
      el.style.overflow = "";
      el.style.transition = "";
      el.removeEventListener("transitionend", onEnd);
    });
  }

  function slideUp(el) {
    el.style.height = el.scrollHeight + "px";
    el.style.overflow = "hidden";
    el.getBoundingClientRect(); // reflow
    el.style.transition = "height .22s ease";
    el.style.height = "0px";
    el.addEventListener("transitionend", function onEnd() {
      el.hidden = true;
      el.style.height = "";
      el.style.overflow = "";
      el.style.transition = "";
      el.removeEventListener("transitionend", onEnd);
    });
  }

  function initCollapsible(section) {
    const header = section.querySelector(".collapsible__header");
    const panel = section.querySelector(".collapsible__panel");
    if (!header || !panel) return;

    // Add lock icon if not present
    if (!header.querySelector(".lock-icon")) {
      const lockIcon = document.createElement("i");
      lockIcon.className = "lock-icon fas fa-lock";
      header.appendChild(lockIcon);
    }

    let locked = false;

    function setExpanded(expanded) {
      section.setAttribute("aria-expanded", String(expanded));
      header.setAttribute("aria-expanded", String(expanded));
      if (expanded) slideDown(panel);
      else slideUp(panel);
    }

    // Hover preview (only when not locked)
    section.addEventListener("mouseenter", () => {
      if (!locked && section.getAttribute("aria-expanded") !== "true") {
        setExpanded(true);
      }
    });
    section.addEventListener("mouseleave", () => {
      if (!locked && section.getAttribute("aria-expanded") === "true") {
        setExpanded(false);
      }
    });

    // Click header to expand/collapse + lock/unlock
    header.addEventListener("click", () => {
      const isOpen = section.getAttribute("aria-expanded") === "true";

      if (isOpen && locked) {
        // Unlock & collapse
        locked = false;
        section.classList.remove("is-locked");
        setExpanded(false);
      } else if (isOpen && !locked) {
        // Lock open
        locked = true;
        section.classList.add("is-locked");
      } else if (!isOpen) {
        // Open & lock
        locked = true;
        section.classList.add("is-locked");
        setExpanded(true);
      }
    });

    // Keyboard accessibility (Enter/Space)
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        header.click();
      }
    });
  }



  document.querySelectorAll(".collapsible").forEach(initCollapsible);

  // (Optional) Accordion mode: ensure only one is locked at a time
  // Uncomment to enable:
  /*
  document.querySelectorAll(".collapsible__header").forEach((hdr) => {
    hdr.addEventListener("click", () => {
      const current = hdr.closest(".collapsible");
      document.querySelectorAll(".collapsible").forEach((sec) => {
        if (sec !== current && sec.classList.contains("is-locked")) {
          sec.classList.remove("is-locked");
          const panel = sec.querySelector(".collapsible__panel");
          sec.setAttribute("aria-expanded", "false");
          sec.querySelector(".collapsible__header")?.setAttribute("aria-expanded", "false");
          if (panel && !panel.hidden) slideUp(panel);
        }
      });
    });
  });
  */

   // If the page loads with a #hash, re-scroll to respect scroll-margin-top
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      // allow layout to settle
      setTimeout(() => {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }, 0);
    }
  }
});
