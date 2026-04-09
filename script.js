/* =====================================================
   md-mediadesign — Script v3.1
   WebGL2 Animated Shader Hero (ported from React)
   Colors adapted: orange/amber → indigo/violet/cyan
   ===================================================== */

/* =====================================================
   WebGL2 Shader Hero
   Shader core by Matthias Hurrle (@atzedent), adapted
   ===================================================== */
(function initShader() {
  const canvas = document.getElementById('shader-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  /* --- Shaders --- */
  const VS = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

  /* Adapted: Visitenkarte palette — Dark Navy + Steel Blue */
  const FS = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2  resolution;
uniform float time;
uniform vec2  move;
uniform vec2  touch;
uniform int   pointerCount;
uniform vec2  pointers;
#define FC gl_FragCoord.xy
#define T  time
#define R  resolution
#define MN min(R.x, R.y)

float rnd(vec2 p) {
  p = fract(p * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(in vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  float a = rnd(i),
        b = rnd(i + vec2(1, 0)),
        c = rnd(i + vec2(0, 1)),
        d = rnd(i + 1.);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float t = .0, a = 1.;
  mat2 m = mat2(1., -.5, .2, 1.2);
  for (int i = 0; i < 5; i++) {
    t += a * noise(p);
    p *= 2. * m;
    a *= .5;
  }
  return t;
}

float clouds(vec2 p) {
  float d = 1., t = .0;
  for (float i = .0; i < 3.; i++) {
    float a = d * fbm(i * 10. + p.x * .2 + .2 * (1. + i) * p.y + d + i * i + p);
    t = mix(t, d, a);
    d = a;
    p *= 2. / (i + 1.);
  }
  return t;
}

void main(void) {
  vec2 uv = (FC - .5 * R) / MN;
  vec2 st = uv * vec2(2., 1.);

  vec3 col = vec3(0);

  float bg = clouds(vec2(st.x + T * .5, -st.y));
  uv *= 1. - .3 * (sin(T * .2) * .5 + .5);

  for (float i = 1.; i < 12.; i++) {
    uv += .1 * cos(i * vec2(.1 + .01 * i, .8) + i * i + T * .5 + .1 * uv.x);
    vec2 p = uv;
    float d = length(p);

    /* Original used vec3(1,2,3) for warm colors.
       We rotate the hue to cool indigo/violet/cyan:
       channel order (3,1,2) → blue-dominant, purple accent, cyan highlight */
    col += .00125 / d * (cos(sin(i) * vec3(3., 1., 2.)) + 1.);

    float b = noise(i + p + bg * 1.731);
    col += .002 * b / length(max(p, vec2(b * p.x * .02, p.y)));

    /* Background tint: deep indigo instead of warm brown */
    col = mix(col, vec3(bg * .05, bg * .04, bg * .25), d);
  }

  /* Shift palette toward Visitenkarte: dark navy + steel blue.
     Keep blue channel dominant, reduce red/green. */
  col = col.bgr * vec3(.55, .45, 1.0)   /* strong blue channel */
      + col.grb * vec3(.05, .08, .30);  /* deep navy base */

  /* Tint toward steel blue (#4a80d0 ~ .29,.50,.82) */
  float lum = dot(col, vec3(.2126,.7152,.0722));
  col = mix(col, vec3(.06, .14, .30) * lum * 3.5, .35);

  /* Darken floor so text stays readable */
  col *= .52;
  col = pow(max(col, vec3(0.)), vec3(.82));

  O = vec4(col, 1.);
}`;

  /* --- Compile helpers --- */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s));
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    canvas.style.display = 'none';
    return;
  }
  gl.useProgram(prog);

  /* --- Geometry (full-screen quad) --- */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  /* --- Uniform locations --- */
  const uRes          = gl.getUniformLocation(prog, 'resolution');
  const uTime         = gl.getUniformLocation(prog, 'time');
  const uMove         = gl.getUniformLocation(prog, 'move');
  const uTouch        = gl.getUniformLocation(prog, 'touch');
  const uPointerCount = gl.getUniformLocation(prog, 'pointerCount');
  const uPointers     = gl.getUniformLocation(prog, 'pointers');

  /* --- Resize --- */
  let dpr = Math.max(1, 0.5 * window.devicePixelRatio);

  function resize() {
    dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* --- Pointer tracking --- */
  const pointers   = new Map();
  let   mouseMove  = [0, 0];
  let   lastCoords = [0, 0];

  function mapCoords(x, y) {
    return [x * dpr, canvas.height - y * dpr];
  }

  canvas.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, mapCoords(e.clientX, e.clientY));
  });
  canvas.addEventListener('pointerup', e => {
    lastCoords = pointers.get(e.pointerId) || lastCoords;
    pointers.delete(e.pointerId);
  });
  canvas.addEventListener('pointerleave', e => {
    lastCoords = pointers.get(e.pointerId) || lastCoords;
    pointers.delete(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!pointers.size) return;
    pointers.set(e.pointerId, mapCoords(e.clientX, e.clientY));
    mouseMove = [mouseMove[0] + e.movementX, mouseMove[1] + e.movementY];
  });

  /* --- Render loop --- */
  let startTime  = null;
  let frameId    = null;
  let pageActive = true;

  document.addEventListener('visibilitychange', () => {
    pageActive = !document.hidden;
    if (pageActive && !frameId) frameId = requestAnimationFrame(loop);
  });

  function loop(now) {
    if (!pageActive) { frameId = null; return; }
    if (!startTime) startTime = now;
    const t = (now - startTime) * 1e-3;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);

    const firstPtr = pointers.size
      ? Array.from(pointers.values())[0]
      : lastCoords;
    const allPtrs = pointers.size
      ? Array.from(pointers.values()).flat()
      : [0, 0];

    gl.uniform2f(uRes,    canvas.width, canvas.height);
    gl.uniform1f(uTime,   t);
    gl.uniform2f(uMove,   ...mouseMove);
    gl.uniform2f(uTouch,  ...firstPtr);
    gl.uniform1i(uPointerCount, pointers.size);
    gl.uniform2fv(uPointers, allPtrs);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    mouseMove = [0, 0];
    frameId = requestAnimationFrame(loop);
  }

  frameId = requestAnimationFrame(loop);
})();

/* =====================================================
   DOM Ready — Interactions & Animations
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* --- Header scroll effect --- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 48);
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
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      setTimeout(() => el.classList.add('visible'), (idx % 3) * 80);
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
        link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--brand-bright)' : '';
      });
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -45% 0px' });

  sections.forEach(s => navObs.observe(s));

  /* --- Cursor glow (desktop only) --- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      width:420px;height:420px;border-radius:50%;
      background:radial-gradient(circle, rgba(74,128,208,0.08) 0%, transparent 70%);
      transform:translate(-50%,-50%);
      top:0;left:0;transition:opacity .4s;
    `;
    document.body.appendChild(glow);

    let cx = innerWidth / 2, cy = innerHeight / 2;
    let tx = cx, ty = cy;

    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function animGlow() {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      glow.style.left = cx + 'px';
      glow.style.top  = cy + 'px';
      requestAnimationFrame(animGlow);
    })();
  }

  /* --- Magnetic buttons --- */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left  - r.width  / 2;
        const y = e.clientY - r.top   - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

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
