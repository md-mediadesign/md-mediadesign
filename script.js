/* =====================================================
   md-mediadesign — Script v3
   WebGL Animated Shader Hero + Interactions
   ===================================================== */

/* =====================================================
   WebGL Shader Hero
   ===================================================== */
(function initShader() {
  const canvas = document.getElementById('shader-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) {
    canvas.style.display = 'none';
    document.body.style.background = '#050508';
    return;
  }

  const VS = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const FS = `
    precision mediump float;
    uniform float u_t;
    uniform vec2  u_res;

    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
    }

    float gnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(dot(hash2(i),           f),
            dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
        mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
            dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * gnoise(p);
        p  = p * 2.1 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_t * 0.09;

      vec2 q = vec2(fbm(uv + t * 0.8),
                    fbm(uv + vec2(5.2, 1.3) + t * 0.6));

      vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + t * 0.13),
                    fbm(uv + 4.0 * q + vec2(8.3, 2.8) + t * 0.11));

      float n = fbm(uv + 4.0 * r);
      n = n * 0.5 + 0.5;

      /* Color palette: very dark indigo → violet → deep blue */
      vec3 c0 = vec3(0.018, 0.012, 0.06);   /* near black-indigo   */
      vec3 c1 = vec3(0.06,  0.03,  0.22);   /* dark purple         */
      vec3 c2 = vec3(0.12,  0.06,  0.38);   /* mid violet          */
      vec3 c3 = vec3(0.22,  0.12,  0.55);   /* bright violet       */
      vec3 c4 = vec3(0.04,  0.08,  0.30);   /* deep blue           */

      vec3 col = mix(c0, c1, smoothstep(0.0,  0.25, n));
      col = mix(col, c4, smoothstep(0.15, 0.45, n));
      col = mix(col, c2, smoothstep(0.35, 0.65, n));
      col = mix(col, c3, smoothstep(0.55, 0.88, n));

      /* Subtle cyan shimmer near top */
      float shimmer = smoothstep(0.85, 1.0, n) * smoothstep(0.7, 1.0, uv.y);
      col += vec3(0.0, 0.08, 0.15) * shimmer;

      /* Vignette */
      vec2 cen = uv - 0.5;
      float vig = 1.0 - smoothstep(0.3, 1.1, length(cen) * 1.6);
      col *= vig * 0.8 + 0.2;

      /* Enforce dark floor */
      col = mix(vec3(0.018, 0.012, 0.06), col, 0.68);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uT   = gl.getUniformLocation(prog, 'u_t');
  const uRes = gl.getUniformLocation(prog, 'u_res');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  let start = null;
  let frame = null;
  let visible = true;

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible && !frame) render(null);
  });

  function render(ts) {
    if (!visible) { frame = null; return; }
    if (!start) start = ts;
    gl.uniform1f(uT, (ts - start) * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame = requestAnimationFrame(render);
  }

  frame = requestAnimationFrame(render);
})();

/* =====================================================
   DOM Ready
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* --- Header scroll effect --- */
  const header = document.getElementById('header');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 48);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Mobile burger menu --- */
  const burger  = document.getElementById('burger');
  const mainNav = document.getElementById('mainNav');

  burger.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    burger.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      burger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* --- Scroll Reveal (staggered) --- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObs = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger cards in the same row
      const el = entry.target;
      setTimeout(() => el.classList.add('visible'), delay);
      // Detect sibling cards for stagger
      const parent = el.parentElement;
      const siblings = [...parent.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      delay = (idx % 3) * 80;
      revealObs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  /* --- Animated Counters --- */
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1800;
      const start  = performance.now();

      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        // Ease out expo
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(e * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };

      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.4 });

  counters.forEach(el => counterObs.observe(el));

  /* --- Active nav on scroll --- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.style.color = active ? 'var(--brand-bright)' : '';
      });
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -45% 0px' });

  sections.forEach(s => navObs.observe(s));

  /* --- Custom Cursor Glow (desktop only) --- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: opacity 0.4s;
      top: 0; left: 0;
    `;
    document.body.appendChild(glow);

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx, ty = cy;

    window.addEventListener('mousemove', e => {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });

    (function animGlow() {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
      requestAnimationFrame(animGlow);
    })();
  }

  /* --- Magnetic buttons --- */
  document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta').forEach(btn => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* --- Contact Form --- */
  const form = document.getElementById('kontaktForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const span = btn.querySelector('span');
    const orig = span.textContent;

    btn.disabled = true;
    span.textContent = 'Wird gesendet …';
    btn.style.opacity = '0.7';

    setTimeout(() => {
      span.textContent = 'Nachricht gesendet ✓';
      btn.style.opacity = '1';
      btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

      setTimeout(() => {
        span.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3200);
    }, 900);
  });

});
