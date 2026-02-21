/* ========= Theme Toggle (WORKING) ========= */
const themeToggle = document.getElementById("themeToggle");
const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

function setTheme(mode){
  const isLight = mode === "light";
  document.body.classList.toggle("light", isLight);
  localStorage.setItem("theme", mode);

  // icon
  themeToggle.innerHTML = isLight
    ? '<i class="fa-solid fa-moon"></i>'
    : '<i class="fa-solid fa-sun"></i>';
}

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const now = document.body.classList.contains("light") ? "dark" : "light";
  setTheme(now);
});

/* ========= Mobile Menu ========= */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

burger.addEventListener("click", () => {
  if (navLinks.style.display === "flex") {
    navLinks.style.display = "none";
  } else {
    navLinks.style.display = "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "68px";
    navLinks.style.right = "18px";
    navLinks.style.background = "rgba(10,16,28,.85)";
    navLinks.style.backdropFilter = "blur(14px)";
    navLinks.style.border = "1px solid rgba(255,255,255,.10)";
    navLinks.style.borderRadius = "16px";
    navLinks.style.padding = "10px";
    navLinks.style.width = "210px";
    navLinks.style.zIndex = "99";
  }
});

/* ========= Active Nav Link on Scroll ========= */
const sections = ["home","about","skills","projects","experience","education","certificates","contact"]
  .map(id => document.getElementById(id));
const navA = [...document.querySelectorAll(".nav-link")];

function updateActiveNav(){
  const y = window.scrollY + 140;
  let current = "home";
  for (const s of sections){
    if (!s) continue;
    if (y >= s.offsetTop) current = s.id;
  }
  navA.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
}
window.addEventListener("scroll", updateActiveNav);
updateActiveNav();

/* ========= Back To Top ========= */
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 500);
});
backToTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

/* ========= Carousel Helper ========= */
function createCarousel(trackId, prevId, nextId, dotsId){
  const track = document.getElementById(trackId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  const dots = document.getElementById(dotsId);

  const slides = [...track.children];
  let index = 0;

  // build dots
  dots.innerHTML = "";
  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.setAttribute("aria-label", `Go to ${i+1}`);
    d.addEventListener("click", () => go(i));
    dots.appendChild(d);
  });

  function update(){
    track.style.transform = `translateX(${-index * 100}%)`;
    [...dots.children].forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function go(i){
    index = (i + slides.length) % slides.length;
    update();
  }

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));

  // swipe (mobile)
  let startX = 0;
  track.addEventListener("touchstart", (e) => startX = e.touches[0].clientX, {passive:true});
  track.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  });

  update();
}

createCarousel("projTrack", "projPrev", "projNext", "projDots");
createCarousel("certTrack", "certPrev", "certNext", "certDots");

/* ========= Particles Background (Canvas) ========= */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
let particles = [];

function resize(){
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR,0,0,DPR,0,0);

  // rebuild particles for consistent density
  const count = Math.floor((W * H) / 24000); // density similar to screenshot
  particles = Array.from({length: count}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: 1 + Math.random() * 1.6
  }));
}
window.addEventListener("resize", resize);
resize();

function draw(){
  ctx.clearRect(0,0,W,H);

  const isLight = document.body.classList.contains("light");
  const dotColor = isLight ? "rgba(15,26,45,.25)" : "rgba(180,220,255,.28)";
  const lineColor = isLight ? "rgba(59,149,246,.10)" : "rgba(59,149,246,.14)";

  // move
  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = W + 20;
    if (p.x > W + 20) p.x = -20;
    if (p.y < -20) p.y = H + 20;
    if (p.y > H + 20) p.y = -20;
  }

  // lines
  for (let i=0;i<particles.length;i++){
    for (let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 110*110){
        const alpha = 1 - Math.sqrt(d2)/110;
        ctx.strokeStyle = lineColor.replace(")", `,${alpha})`).replace("rgba(", "rgba(");
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // dots
  ctx.fillStyle = dotColor;
  for (const p of particles){
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();
