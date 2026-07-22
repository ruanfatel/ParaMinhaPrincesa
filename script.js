/* ==========================================================================
   PRESENTE DIGITAL — script.js
   Organizado em módulos simples por responsabilidade:
   1. Config (nome/senha, fáceis de alterar)
   2. Navegação entre telas (transições cinematográficas)
   3. Parallax da capa (tela 1)
   4. Login (validação + mensagem "Você é minha?")
   5. Áudio (fade-in, pausar/continuar)
   6. Chuva de código (tela 2)
   7. Bosque de tulipas: neve + sparkles + parallax (tela 3)
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. CONFIG — altere aqui o nome e a senha quando quiser
   * ------------------------------------------------------------------ */
  const CONFIG = {
    NAME: 'thayla',
    PASSWORD: 'princesa',
  };

  /* ------------------------------------------------------------------ *
   * 2. NAVEGAÇÃO ENTRE TELAS
   * ------------------------------------------------------------------ */
  const screens = {
    cover: document.getElementById('screen-cover'),
    code: document.getElementById('screen-code'),
    garden: document.getElementById('screen-garden'),
  };

  function goToScreen(name) {
    const next = screens[name];
    if (!next) return;

    Object.values(screens).forEach((el) => {
      if (el === next) return;
      if (el.classList.contains('screen--active')) {
        el.classList.add('screen--leaving');
        el.classList.remove('screen--active');
        setTimeout(() => el.classList.remove('screen--leaving'), 1200);
      }
    });

    // pequeno atraso para a transição de saída começar antes da entrada
    requestAnimationFrame(() => {
      setTimeout(() => next.classList.add('screen--active'), 60);
    });

    if (name === 'code') startCodeRain();
    if (name === 'garden') startGarden();
  }

  /* ------------------------------------------------------------------ *
   * 3. PARALLAX DA CAPA (mouse / giroscópio leve)
   * ------------------------------------------------------------------ */
  const coverBg = document.getElementById('coverBg');
  const coverSection = document.getElementById('screen-cover');

  function handleCoverParallax(x, y) {
    // x, y entre -1 e 1
    const moveX = x * 18; // px
    const moveY = y * 14; // px
    coverBg.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.08)`;
    coverSection.style.setProperty('--mx', `${50 + x * 20}%`);
    coverSection.style.setProperty('--my', `${38 + y * 16}%`);
  }

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    handleCoverParallax(x, y);
    handleGardenParallax(x, y);
  });

  /* ------------------------------------------------------------------ *
   * 4. LOGIN
   * ------------------------------------------------------------------ */
  const loginForm = document.getElementById('loginForm');
  const inputName = document.getElementById('inputName');
  const inputPass = document.getElementById('inputPass');
  const loginError = document.getElementById('loginError');
  const forgotBtn = document.getElementById('forgotBtn');
  const forgotMsg = document.getElementById('forgotMsg');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = inputName.value.trim().toLowerCase();
    const pass = inputPass.value.trim().toLowerCase();

    const isValid = name === CONFIG.NAME && pass === CONFIG.PASSWORD;

    if (!isValid) {
      loginError.textContent = 'Hmm, não é bem isso... tente novamente.';
      loginError.classList.add('is-visible');
      loginForm.classList.remove('shake');
      // força reflow para permitir repetir a animação
      void loginForm.offsetWidth;
      loginForm.classList.add('shake');
      return;
    }

    loginError.classList.remove('is-visible');
    playMusic();
    goToScreen('code');
  });

  forgotBtn.addEventListener('click', () => {
    forgotMsg.classList.toggle('is-visible');
  });

  /* pequena animação de "shake" para erro, injetada via classe */
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    .login-card.shake { animation: cardRise 0.01s, shakeX 0.5s; }
    @keyframes shakeX {
      0%,100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(7px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  /* ------------------------------------------------------------------ *
   * 5. ÁUDIO — fade-in ao logar, botão de pausar/continuar
   * ------------------------------------------------------------------ */
  const bgAudio = document.getElementById('bgAudio');
  const musicToggle = document.getElementById('musicToggle');
  let targetVolume = 0.55;
  let fadeInterval = null;

  function fadeAudio(to, duration = 2200) {
    clearInterval(fadeInterval);
    const steps = 40;
    const stepTime = duration / steps;
    const startVol = bgAudio.volume;
    const diff = to - startVol;
    let i = 0;
    fadeInterval = setInterval(() => {
      i++;
      bgAudio.volume = Math.min(1, Math.max(0, startVol + (diff * i) / steps));
      if (i >= steps) clearInterval(fadeInterval);
    }, stepTime);
  }

  function playMusic() {
    bgAudio.volume = 0;
    bgAudio.play().catch(() => {
      // navegadores podem bloquear autoplay; o botão de música permite iniciar manualmente
    });
    fadeAudio(targetVolume);
    musicToggle.classList.add('is-visible');
    musicToggle.classList.remove('is-paused');
  }

  musicToggle.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.play().catch(() => {});
      fadeAudio(targetVolume, 900);
      musicToggle.classList.remove('is-paused');
    } else {
      fadeAudio(0, 500);
      setTimeout(() => bgAudio.pause(), 520);
      musicToggle.classList.add('is-paused');
    }
  });

  /* ------------------------------------------------------------------ *
   * 6. CHUVA DE CÓDIGO (tela 2)
   * ------------------------------------------------------------------ */
  const codeRainEl = document.getElementById('codeRain');
  const organizeBtn = document.getElementById('organizeBtn');
  let codeRainStarted = false;

  const CODE_SNIPPETS = [
    'const love = true;',
    'function forever() { return "sempre"; }',
    'if (voce.existe) { sentido = true; }',
    'class Presente extends Amor {}',
    'while (vida) { pensar(voce); }',
    '// para thayla, com carinho',
    'export default felicidade;',
    'let saudade = infinito;',
    'const princesa = "thayla";',
    'git commit -m "te amo"',
    'return sorriso ?? "sempre";',
    'async function abracar() {}',
    'const nos = [voce, eu];',
    'try { viver(); } catch (medo) {}',
    'import { carinho } from "./coracao";',
  ];

  function startCodeRain() {
    if (codeRainStarted) return;
    codeRainStarted = true;

    const columnCount = Math.floor(window.innerWidth / 90);
    for (let i = 0; i < columnCount; i++) {
      const span = document.createElement('span');
      const lines = [];
      const lineCount = 18 + Math.floor(Math.random() * 12);
      for (let l = 0; l < lineCount; l++) {
        lines.push(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
      }
      span.textContent = lines.join('\n');
      span.style.left = `${(i / columnCount) * 100}%`;
      const duration = 14 + Math.random() * 10;
      const delay = -Math.random() * duration;
      span.style.animationDuration = `${duration}s`;
      span.style.animationDelay = `${delay}s`;
      span.style.opacity = 0.25 + Math.random() * 0.35;
      codeRainEl.appendChild(span);
    }
  }

  organizeBtn.addEventListener('click', () => {
    goToScreen('garden');
  });

  /* ------------------------------------------------------------------ *
   * 7. BOSQUE DE TULIPAS — neve, sparkles e parallax (tela 3)
   * ------------------------------------------------------------------ */
  let gardenStarted = false;
  const gardenLayers = () => document.querySelectorAll('#garden .garden__layer');

  function handleGardenParallax(x, y) {
    gardenLayers().forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth || '0.03');
      const moveX = x * depth * 100;
      const moveY = y * depth * 60;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  }

  // suporte a giroscópio em celulares (quando disponível e permitido)
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma === null || e.beta === null) return;
    const x = Math.max(-1, Math.min(1, e.gamma / 30));
    const y = Math.max(-1, Math.min(1, (e.beta - 40) / 30));
    handleCoverParallax(x, y);
    handleGardenParallax(x, y);
  });

  function spawnSparkles() {
    const container = document.getElementById('sparkles');
    const count = 40;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('i');
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${40 + Math.random() * 55}%`;
      dot.style.animationDelay = `${Math.random() * 4}s`;
      dot.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
      container.appendChild(dot);
    }
  }

  /* --- neve em canvas, leve e performática --- */
  const snowCanvas = document.getElementById('snowCanvas');
  const ctx = snowCanvas.getContext('2d');
  let snowflakes = [];
  let snowAnimId = null;

  function resizeCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
  }

  function initSnow() {
    resizeCanvas();
    const count = Math.floor((window.innerWidth * window.innerHeight) / 22000);
    snowflakes = Array.from({ length: count }, () => ({
      x: Math.random() * snowCanvas.width,
      y: Math.random() * snowCanvas.height,
      r: 1 + Math.random() * 2.4,
      speedY: 0.3 + Math.random() * 0.7,
      speedX: (Math.random() - 0.5) * 0.4,
      drift: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }

  function drawSnow() {
    ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    ctx.fillStyle = '#faf8ff';
    snowflakes.forEach((flake) => {
      flake.drift += 0.01;
      flake.y += flake.speedY;
      flake.x += flake.speedX + Math.sin(flake.drift) * 0.3;

      if (flake.y > snowCanvas.height) {
        flake.y = -4;
        flake.x = Math.random() * snowCanvas.width;
      }
      if (flake.x > snowCanvas.width) flake.x = 0;
      if (flake.x < 0) flake.x = snowCanvas.width;

      ctx.globalAlpha = flake.opacity;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    snowAnimId = requestAnimationFrame(drawSnow);
  }

  function startGarden() {
    if (gardenStarted) return;
    gardenStarted = true;
    spawnSparkles();
    initSnow();
    drawSnow();
  }

  window.addEventListener('resize', () => {
    if (gardenStarted) resizeCanvas();
  });

})();
