document.addEventListener("DOMContentLoaded", () => {
  // CTA "Ouvir agora" com scroll suave e destaque da secao de musicas
  const ctaButton = document.querySelector(".cta-button[href='#music']");
  const musicSection = document.querySelector("#music");
  const navbar = document.querySelector(".navbar");

  if (ctaButton && musicSection) {
    ctaButton.addEventListener("click", (event) => {
      event.preventDefault();

      const navOffset = navbar ? navbar.offsetHeight : 0;
      const targetY = musicSection.getBoundingClientRect().top + window.scrollY - navOffset - 12;

      window.scrollTo({
        top: targetY,
        behavior: "smooth"
      });

      musicSection.classList.remove("section-focus");
      void musicSection.offsetWidth;
      musicSection.classList.add("section-focus");
      setTimeout(() => {
        musicSection.classList.remove("section-focus");
      }, 1200);
    });
  }

  // MENU MOBILE
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const isOpen = navLinks.classList.contains("active");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // PARTICLES
  const particlesContainer = document.querySelector(".particles");

  if (particlesContainer) {
    for (let i = 0; i < 40; i += 1) {
      const span = document.createElement("span");
      span.style.left = `${Math.random() * 100}vw`;
      span.style.animationDuration = `${5 + Math.random() * 10}s`;
      particlesContainer.appendChild(span);
    }
  }

  // LIGHTBOX
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox img");
  const closeBtn = document.querySelector(".lightbox-close");

  if (galleryItems.length && lightbox && lightboxImg && closeBtn) {
    galleryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const bg = getComputedStyle(item).backgroundImage;
        const match = bg.match(/url\(["']?(.*?)["']?\)/);

        if (match && match[1]) {
          lightboxImg.src = match[1];
          lightbox.classList.add("active");
          lightbox.setAttribute("aria-hidden", "false");
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
    };

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });
  }

  // SCROLL REVEAL
  const sections = document.querySelectorAll("section");

  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => {
      section.style.opacity = "0";
      section.style.transform = "translateY(40px)";
      section.style.transition = "all 0.8s ease";
      observer.observe(section);
    });
  }
});



