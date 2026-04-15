(function () {
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const yearTarget = document.querySelector("[data-year]");
  const animatedItems = document.querySelectorAll("[data-animate]");
  const typewriter = document.querySelector("[data-typewriter]");
  const pipelineSteps = document.querySelectorAll(".pipeline-step");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typewriterPhrases = [
    "building stronger ML workflows",
    "turning notebooks into project work",
    "practicing API-first ML workflows",
    "improving models with evaluation",
  ];

  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    animatedItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
      observer.observe(item);
    });
  } else {
    animatedItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (pipelineSteps.length) {
    let activeStep = 0;

    const updatePipeline = () => {
      pipelineSteps.forEach((step, index) => {
        step.classList.toggle("is-active", index === activeStep);
      });
      activeStep = (activeStep + 1) % pipelineSteps.length;
    };

    updatePipeline();

    if (!reduceMotion) {
      window.setInterval(updatePipeline, 1500);
    }
  }

  if (typewriter && !reduceMotion) {
    let phraseIndex = 0;
    let letterIndex = 0;
    let deleting = false;

    const tickTypewriter = () => {
      const phrase = typewriterPhrases[phraseIndex];
      typewriter.textContent = phrase.slice(0, letterIndex);

      if (!deleting && letterIndex < phrase.length) {
        letterIndex += 1;
        window.setTimeout(tickTypewriter, 54);
        return;
      }

      if (!deleting && letterIndex === phrase.length) {
        deleting = true;
        window.setTimeout(tickTypewriter, 1300);
        return;
      }

      if (deleting && letterIndex > 0) {
        letterIndex -= 1;
        window.setTimeout(tickTypewriter, 28);
        return;
      }

      deleting = false;
      phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
      window.setTimeout(tickTypewriter, 220);
    };

    tickTypewriter();
  }

  /* ---- LetterGlitch hero background ---- */
  const heroSection = document.querySelector('.hero');
  if (heroSection && !reduceMotion && typeof LetterGlitch === 'function') {
    LetterGlitch(heroSection, {
      glitchColors: ['#2b4539', '#61dca3', '#61b3dc'],
      glitchSpeed: 50,
      centerVignette: true,
      outerVignette: false,
      smooth: true
    });
  }

  /* ---- Silk background (About section onwards) ---- */
  const silkCanvas = document.getElementById('silk-canvas');
  if (silkCanvas && !reduceMotion && typeof Silk === 'function') {
    Silk(silkCanvas, {
      speed: 5,
      scale: 1,
      color: '#2b4539',
      noiseIntensity: 1.5,
      rotation: 0
    });
  }
})();
