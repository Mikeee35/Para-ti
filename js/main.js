// Respeta reduce motion
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1) Reveal on scroll
(function revealOnScroll(){
  const els = document.querySelectorAll('.reveal');
  if(REDUCED || !('IntersectionObserver' in window)){
    els.forEach(el=> el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target);} });
  }, { threshold: .12 });
  els.forEach(el=> io.observe(el));
})();

// 2) Lluvia en Canvas (cantidad adaptativa por pantalla)
(function rain(){
  const c = document.getElementById('rain'); if(!c) return;
  const ctx = c.getContext('2d');
  function resize(){ c.width = window.innerWidth; c.height = window.innerHeight; }
  resize(); window.addEventListener('resize', ()=>{ resize(); initDrops(true); });

  let drops = [];
  function initDrops(keep=false){
    const area = c.width * c.height;
    const count = Math.max(120, Math.min(260, Math.floor(area * 0.00009))); // adapta entre 120-260
    const arr = Array.from({length: count}, (_, i) => drops[i] || {
      x: Math.random()*c.width,
      y: Math.random()*c.height,
      len: 8 + Math.random()*14,
      sp: 2 + Math.random()*4,
      a: 0.08 + Math.random()*0.15
    });
    drops = arr;
  }
  initDrops();

  function step(){
    ctx.clearRect(0,0,c.width,c.height);

    // Halo melancólico
    const g = ctx.createRadialGradient(c.width*0.78, c.height*0.12, 0, c.width*0.78, c.height*0.12, Math.max(c.width,c.height)*0.9);
    g.addColorStop(0, 'rgba(255,105,180,0.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,c.width,c.height);

    ctx.lineWidth = 1; ctx.lineCap = 'round';
    for(const d of drops){
      ctx.strokeStyle = `rgba(255,255,255,${d.a})`;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.len);
      ctx.stroke();
      d.y += d.sp;
      if(d.y > c.height){ d.y = -20; d.x = Math.random()*c.width; }
    }

    if(!REDUCED) requestAnimationFrame(step);
  }
  step();
})();

// 3) Toggle de tema claro/oscuro con persistencia
(function theme(){
  const btn = document.getElementById('toggle-theme');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  // estado inicial desde sistema o localStorage
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const startDark = saved ? (saved === 'dark') : prefersDark;
  document.body.classList.toggle('theme-light', !startDark);
  btn?.setAttribute('aria-pressed', String(!startDark));
  metaTheme && (metaTheme.setAttribute('content', startDark ? '#0d0d1b' : '#ffffff'));

  btn?.addEventListener('click', ()=>{
    const isLight = document.body.classList.toggle('theme-light');
    const darkNow = !isLight;
    btn.setAttribute('aria-pressed', String(isLight));
    localStorage.setItem('theme', darkNow ? 'dark' : 'light');
    metaTheme && (metaTheme.setAttribute('content', darkNow ? '#0d0d1b' : '#ffffff'));
  });
})();
