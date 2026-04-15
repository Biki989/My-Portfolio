/**
 * LetterGlitch — Vanilla JS port of the React Bits component.
 * Renders a full-container canvas of scrambling monospace characters
 * with smooth colour transitions and optional vignette overlays.
 *
 * Usage:
 *   LetterGlitch(containerElement, {
 *     glitchColors: ['#2b4539','#61dca3','#61b3dc'],
 *     glitchSpeed: 50,
 *     centerVignette: false,
 *     outerVignette: true,
 *     smooth: true,
 *     characters: 'ABC…'
 *   });
 */
function LetterGlitch(container, options = {}) {
  const {
    glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
    glitchSpeed = 50,
    centerVignette = false,
    outerVignette = true,
    smooth = true,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789'
  } = options;

  const lettersAndSymbols = Array.from(characters);
  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  /* ---- state ---- */
  let letters = [];
  let grid = { columns: 0, rows: 0 };
  let ctx = null;
  let animFrameId = null;
  let lastGlitchTime = Date.now();

  /* ---- helpers ---- */
  const getRandomChar = () =>
    lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];

  const getRandomColor = () =>
    glitchColors[Math.floor(Math.random() * glitchColors.length)];

  const hexToRgb = (hex) => {
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => r + r + g + g + b + b);
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  };

  const interpolateColor = (start, end, t) => {
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  /* ---- DOM setup ---- */
  Object.assign(container.style, {
    position: 'relative',
    overflow: 'hidden'
  });

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    display: 'block',
    zIndex: '-5'
  });
  canvas.setAttribute('aria-hidden', 'true');
  container.insertBefore(canvas, container.firstChild);

  if (outerVignette) {
    const ov = document.createElement('div');
    Object.assign(ov.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '-4',
      background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)'
    });
    ov.setAttribute('aria-hidden', 'true');
    container.insertBefore(ov, canvas.nextSibling);
  }

  if (centerVignette) {
    const cv = document.createElement('div');
    Object.assign(cv.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '-4',
      background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)'
    });
    cv.setAttribute('aria-hidden', 'true');
    container.insertBefore(cv, canvas.nextSibling);
  }

  /* ---- grid & letters ---- */
  const calculateGrid = (w, h) => ({
    columns: Math.ceil(w / charWidth),
    rows: Math.ceil(h / charHeight)
  });

  const initializeLetters = (columns, rows) => {
    grid = { columns, rows };
    letters = Array.from({ length: columns * rows }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1
    }));
  };

  /* ---- rendering ---- */
  const drawLetters = () => {
    if (!ctx || letters.length === 0) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const x = (i % grid.columns) * charWidth;
      const y = Math.floor(i / grid.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    }
  };

  const updateLetters = () => {
    if (!letters || letters.length === 0) return;
    const updateCount = Math.max(1, Math.floor(letters.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const idx = Math.floor(Math.random() * letters.length);
      if (!letters[idx]) continue;

      letters[idx].char = getRandomChar();
      letters[idx].targetColor = getRandomColor();

      if (!smooth) {
        letters[idx].color = letters[idx].targetColor;
        letters[idx].colorProgress = 1;
      } else {
        letters[idx].colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    for (const letter of letters) {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
          needsRedraw = true;
        }
      }
    }
    if (needsRedraw) drawLetters();
  };

  /* ---- resize ---- */
  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const g = calculateGrid(rect.width, rect.height);
    initializeLetters(g.columns, g.rows);
    drawLetters();
  };

  /* ---- animation loop ---- */
  const animate = () => {
    const now = Date.now();
    if (now - lastGlitchTime >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime = now;
    }
    if (smooth) handleSmoothTransitions();
    animFrameId = requestAnimationFrame(animate);
  };

  /* ---- init ---- */
  resizeCanvas();
  animate();

  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animFrameId);
      resizeCanvas();
      animate();
    }, 100);
  };

  window.addEventListener('resize', handleResize);

  /* ---- cleanup (call when you want to tear down) ---- */
  return function destroy() {
    cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', handleResize);
    canvas.remove();
  };
}
