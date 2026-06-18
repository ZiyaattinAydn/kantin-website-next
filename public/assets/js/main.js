(() => {
  // Header, mobil menü ve scroll durumu React bileşeni tarafından yönetiliyor.

  const revealItems = [...document.querySelectorAll(".reveal")];

  const showRevealItem = (item) => {
    item.classList.add("is-visible");
    item.classList.remove("reveal-pending");
  };

  const isNearViewport = (item) => {
    const rect = item.getBoundingClientRect();
    return rect.bottom >= -40 && rect.top <= window.innerHeight * 1.15;
  };

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showRevealItem(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px 90px 0px" }
    );

    revealItems.forEach((item) => {
      if (isNearViewport(item)) {
        showRevealItem(item);
      } else {
        item.classList.add("reveal-pending");
        revealObserver.observe(item);
      }
    });

    /* Safari geri/ileri önbelleği veya sekme geri yüklemesinde güvenlik ağı. */
    const revealVisibleItems = () => {
      revealItems.forEach((item) => {
        if (isNearViewport(item)) showRevealItem(item);
      });
    };

    window.addEventListener("pageshow", revealVisibleItems);
    window.addEventListener("orientationchange", revealVisibleItems);
    setTimeout(revealVisibleItems, 700);
    setTimeout(revealVisibleItems, 1800);
  } else {
    revealItems.forEach(showRevealItem);
  }

  // Etkinlik filtreleri
  const filterButtons = document.querySelectorAll("[data-event-filter]");
  const eventCards = document.querySelectorAll("[data-branch]");
  const emptyState = document.querySelector("[data-event-empty]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.eventFilter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      eventCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.branch === filter;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (emptyState) emptyState.hidden = visibleCount > 0;
    });
  });

  // Etkinlik butonlarından indirilebilir .ics takvim dosyaları oluşturur.
  const toast = document.querySelector("[data-toast]");
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const escapeICS = (value = "") =>
    value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");

  document.querySelectorAll("[data-calendar-title]").forEach((button) => {
    button.addEventListener("click", () => {
      const title = escapeICS(button.dataset.calendarTitle);
      const start = button.dataset.calendarStart;
      const end = button.dataset.calendarEnd;
      const location = escapeICS(button.dataset.calendarLocation);
      const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//kantin.//Events//TR",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@kantin.pub`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        `LOCATION:${location}`,
        "DESCRIPTION:savor the sip\\, share the bite.",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${button.dataset.calendarTitle.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Etkinlik takvim dosyası indirildi.");
    });
  });

  // Sayfa kaydırılırken etkin menü kategorisini belirler.
  const menuLinks = [...document.querySelectorAll(".menu-nav a")];
  const menuSections = [...document.querySelectorAll(".menu-category")];

  if (menuLinks.length && menuSections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        menuLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.05, 0.2, 0.5] }
    );

    menuSections.forEach((section) => sectionObserver.observe(section));
  }

  // Merch Drop: yalnızca fotoğraf hover'ında önizleme; buton veya fotoğraf tıklamasıyla kalıcı aç/kapat.
  document.querySelectorAll('[data-merch-toggle]').forEach((card) => {
    const trigger = card.querySelector('[data-merch-trigger]');
    const photoToggle = card.querySelector('[data-merch-photo-toggle]');
    if (!trigger) return;

    const updateState = () => {
      const open = card.classList.contains('is-open');
      trigger.setAttribute('aria-expanded', String(open));

      if (photoToggle) {
        photoToggle.setAttribute('aria-pressed', String(open));
        photoToggle.setAttribute(
          'aria-label',
          open ? 'Tişörtün ön yüzünü göster' : 'Tişörtün arka tasarımını göster'
        );
      }

      trigger.innerHTML = open
        ? 'Ön yüze dön <span aria-hidden="true">↺</span>'
        : 'Tasarımı aç <span aria-hidden="true">↗</span>';
    };

    const toggleCard = () => {
      card.classList.toggle('is-open');
      updateState();
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleCard();
    });

    if (photoToggle) {
      photoToggle.addEventListener('click', (event) => {
        if (event.target.closest('[data-merch-trigger]')) return;
        event.preventDefault();
        event.stopPropagation();
        toggleCard();

        // Dokunmatik cihazlarda kalıcı focus/hover görüntüsünü temizle.
        if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
          photoToggle.blur();
        }
      });

      photoToggle.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleCard();
      });
    }

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !card.classList.contains('is-open')) return;
      card.classList.remove('is-open');
      updateState();
      trigger.focus();
    });

    updateState();
  });


  // Tüm beyaz noktalı arka planlara merch alanındaki animasyonlu karikatürleri ekler.
  const doodleTargets = document.querySelectorAll('.dotted-paper');

  const createAmbientDoodleStage = () => {
    const stage = document.createElement('div');
    stage.className = 'merch-doodle-stage ambient-doodle-stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML = `
      <img class="merch-doodle merch-doodle-table ambient-doodle-table" src="/assets/img/merch/doodles/table-friends.png" alt="">
      <img class="merch-doodle merch-doodle-look ambient-doodle-look" src="/assets/img/merch/doodles/looking-up.png" alt="">
      <img class="merch-doodle merch-doodle-bar ambient-doodle-bar" src="/assets/img/merch/doodles/bar-friends.png" alt="">
      <img class="merch-doodle merch-doodle-jump ambient-doodle-jump" src="/assets/img/merch/doodles/jumping.png" alt="">
      <img class="merch-doodle merch-doodle-cats ambient-doodle-cats" src="/assets/img/merch/doodles/cats-table.png" alt="">
      <img class="merch-doodle merch-doodle-share ambient-doodle-share" src="/assets/img/merch/doodles/sharing-drink.png" alt="">
      <img class="merch-doodle merch-doodle-highfive ambient-doodle-highfive" src="/assets/img/merch/doodles/high-five.png" alt="">
      <img class="merch-doodle merch-doodle-hug ambient-doodle-hug" src="/assets/img/merch/doodles/hugging.png" alt="">
      <img class="merch-doodle merch-doodle-walk ambient-doodle-walk" src="/assets/img/merch/doodles/walking.png" alt="">
    `;
    return stage;
  };

  doodleTargets.forEach((section) => {
    if (section.querySelector('.ambient-doodle-stage')) return;
    section.insertBefore(createAmbientDoodleStage(), section.firstChild);
  });

  // Merch arka planındaki karakterlere masaüstünde hafif imleç paralaksı ekle.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-merch-parallax]').forEach((shell) => {
      const stage = shell.querySelector('.merch-doodle-stage');
      if (!stage) return;

      let animationFrame = 0;

      const resetParallax = () => {
        stage.style.setProperty('--parallax-x', '0px');
        stage.style.setProperty('--parallax-y', '0px');
      };

      shell.addEventListener('pointermove', (event) => {
        if (!window.matchMedia('(pointer: fine)').matches || window.innerWidth < 900) return;
        const rect = shell.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(() => {
          stage.style.setProperty('--parallax-x', `${(-normalizedX * 12).toFixed(1)}px`);
          stage.style.setProperty('--parallax-y', `${(-normalizedY * 9).toFixed(1)}px`);
        });
      }, { passive: true });

      shell.addEventListener('pointerleave', resetParallax);
    });
  }

})();
