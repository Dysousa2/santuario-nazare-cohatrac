/***** Header shrink + section highlight *****/
const header = document.getElementById("site-header");
const links = [...document.querySelectorAll(".nav-links a")];
const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);

addEventListener("scroll", () => {
  header.classList.toggle("scrolled", scrollY > 10);
  const current = sections.findLast(s => s.offsetTop - 120 <= scrollY);
  links.forEach(a => a.classList.toggle("active", current && a.getAttribute("href") === `#${current.id}`));
});

/***** Mobile nav *****/
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector(".nav-toggle");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

/***** Smooth anchors *****/
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const el = document.querySelector(a.getAttribute("href"));
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  nav?.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
});

/***** Reveal on scroll *****/
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("visible"));
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

/***** Parallax hero *****/
const hero = document.querySelector(".hero");
addEventListener("scroll", () => {
  if (!hero) return;
  const y = Math.min(40, scrollY * 0.08);
  hero.style.transform = `translateY(${y * -0.5}px)`;
});


/* ============================
   AGENDA DINÂMICA DE MISSAS
   ============================ */
/* Horários fixos informados:
   Seg–Sex: 06:30 e 18:00
   Sáb:     06:30 e 17:00
   Dom:     06:30, 09:00, 17:00 e 19:00
*/
const MASS_SCHEDULE = {
  1: ["06:30","18:00"], // Monday
  2: ["06:30","18:00"], // Tuesday
  3: ["06:30","18:00"], // Wednesday
  4: ["06:30","18:00"], // Thursday
  5: ["06:30","18:00"], // Friday
  6: ["06:30","17:00"], // Saturday
  0: ["06:30","09:00","17:00","19:00"], // Sunday (JS: 0)
};
const WEEKDAY_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function parseTimeToDate(date, hhmm){
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function nextNMasses(n=8){
  const now = new Date();
  const out = [];
  let day = new Date(now);
  let guard = 0;
  while (out.length < n && guard < 200){
    const dayTimes = MASS_SCHEDULE[day.getDay()] || [];
    dayTimes.forEach(t => {
      const dt = parseTimeToDate(day, t);
      if (dt > now) out.push(dt);
    });
    day.setDate(day.getDate() + 1);
    guard++;
  }
  return out.sort((a,b)=>a-b);
}

function renderAgenda(){
  const grid = document.getElementById("agendaGrid");
  const note = document.getElementById("nextMassNote");
  if (!grid || !note) return;

  // próximo horário
  const next = nextNMasses(1)[0];
  if (next){
    const wd = WEEKDAY_PT[next.getDay()];
    const fmt = next.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
    const dataFmt = next.toLocaleDateString([], {day:"2-digit", month:"2-digit"});
    note.textContent = `Próxima missa: ${wd} • ${dataFmt} às ${fmt}`;
  } else {
    note.textContent = "Sem próximos horários encontrados.";
  }

  // próximos 7 dias em formato “calendário”
  grid.innerHTML = "";
  const start = new Date();
  for (let i=0; i<7; i++){
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const weekday = WEEKDAY_PT[d.getDay()];
    const title = `${weekday} • ${d.toLocaleDateString([], {day:"2-digit", month:"2-digit"})}`;

    const times = MASS_SCHEDULE[d.getDay()] || [];
    const now = new Date();
    const items = times.map(t=>{
      const dt = parseTimeToDate(d, t);
      const isPast = dt < now;
      const isNext = next && dt.getTime() === next.getTime();
      return `<span class="time-pill ${isPast ? 'past':''} ${isNext ? 'next':''}">${t}</span>`;
    }).join("");

    grid.insertAdjacentHTML("beforeend", `
      <div class="day-card">
        <h4>${title}</h4>
        <div>${items || '<span class="time-pill">—</span>'}</div>
      </div>
    `);
  }
}
renderAgenda();

/* Recalcular à virada de minuto (para não mostrar horário passado como atual) */
setInterval(renderAgenda, 60*1000);

/* ============================
   CARROSSEL: PASTORAIS
   ============================ */
const PASTORAIS = [
  { nome: "Actio Nazaré",
    descricao: "Grupo de evangelização que atua em missões e ações sociais, inspirando fé e solidariedade.",
    link: "/pastorais/actio-nazare" },

  { nome: "Amigos Solidários",
    descricao: "Realiza campanhas de arrecadação e visitas a famílias carentes, levando amor e esperança.",
    link: "/pastorais/amigos-solidarios" },

  { nome: "Amiguinhos de Jesus",
    descricao: "Espaço de iniciação cristã para crianças, promovendo valores evangélicos de forma lúdica.",
    link: "/pastorais/amiguinhos-de-jesus" },

  { nome: "Apostolado da Oração",
    descricao: "Movimento de intercessão e devoção ao Sagrado Coração de Jesus, presente em todo o mundo.",
    link: "/pastorais/apostolado-da-oracao" },

  { nome: "Comissão do Círio",
    descricao: "Equipe responsável pela organização e vivência do Círio de Nazaré, maior expressão da fé mariana.",
    link: "/pastorais/comissao-do-cirio" },

  { nome: "CEB's",
    descricao: "Comunidades Eclesiais de Base que fortalecem a vivência do Evangelho em pequenos grupos locais.",
    link: "/pastorais/cebs" },

  { nome: "Coroinhas",
    descricao: "Servem com alegria no altar, auxiliando os padres e animando as celebrações litúrgicas.",
    link: "/pastorais/coroinhas" },

  { nome: "ECC",
    descricao: "Encontro de Casais com Cristo — promove o amor conjugal e a vida familiar à luz do Evangelho.",
    link: "/pastorais/ecc" },

  { nome: "EJC",
    descricao: "Encontro de Jovens com Cristo — incentiva o protagonismo juvenil e a vivência comunitária da fé.",
    link: "/pastorais/ejc" },

  { nome: "Força Jovem Católica",
    descricao: "Grupo que busca aproximar os jovens da Igreja através da música, oração e evangelização.",
    link: "/pastorais/forca-jovem-catolica" },

  { nome: "Guarda de Nazaré Mirim",
    descricao: "Formação de crianças e adolescentes na devoção a Nossa Senhora de Nazaré, com disciplina e amor.",
    link: "/pastorais/guarda-de-nazare-mirim" },

  { nome: "Legião de Maria",
    descricao: "Grupo mariano que promove a oração do terço e visitas missionárias às famílias e enfermos.",
    link: "/pastorais/legiao-de-maria" },

  { nome: "Legião de Maria Juvenil",
    descricao: "Versão juvenil da Legião de Maria, incentivando o amor e o serviço mariano entre os jovens.",
    link: "/pastorais/legiao-de-maria-juvenil" },

  { nome: "Liturgia Mirim",
    descricao: "Pastoral que forma crianças para servir nas celebrações, ensinando o valor da liturgia e da oração.",
    link: "/pastorais/liturgia-mirim" },

  { nome: "Mães que oram pelos filhos",
    descricao: "Grupo de intercessão formado por mães que se reúnem para rezar pelos filhos e famílias.",
    link: "/pastorais/maes-que-oram" },

  { nome: "Mãos que evangelizam",
    descricao: "Pastoral de apoio às ações missionárias e sociais, com dedicação e espírito de serviço.",
    link: "/pastorais/maos-que-evangelizam" },

  { nome: "Ministério da Acolhida Mirim",
    descricao: "Formação de crianças para acolher com alegria os fiéis e visitantes nas celebrações e eventos.",
    link: "/pastorais/ministerio-da-acolhida-mirim" },

  { nome: "Ministros da Eucaristia",
    descricao: "Servem o Corpo de Cristo nas missas e levam a comunhão aos enfermos com zelo e respeito.",
    link: "/pastorais/ministros-da-eucaristia" },

  { nome: "Ministros da Palavra",
    descricao: "Proclamam a Palavra de Deus nas celebrações e auxiliam nas liturgias da comunidade.",
    link: "/pastorais/ministros-da-palavra" },

  { nome: "Missionários da Palavra",
    descricao: "Anunciam o Evangelho através de visitas e ações missionárias nas comunidades.",
    link: "/pastorais/missionarios-da-palavra" },

  { nome: "OFS (Ordem Franciscana Secular)",
    descricao: "Leigos que vivem o carisma franciscano no mundo, seguindo os passos de São Francisco de Assis.",
    link: "/pastorais/ofs" },

  { nome: "Pastoral do Batismo",
    descricao: "Acompanha pais e padrinhos na preparação para o Sacramento do Batismo.",
    link: "/pastorais/pastoral-do-batismo" },

  { nome: "Pastoral da Caridade",
    descricao: "Promove ações de solidariedade e visita aos enfermos, levando consolo e esperança cristã.",
    link: "/pastorais/pastoral-da-caridade" },

  { nome: "Pastoral da Catequese",
    descricao: "Forma crianças, jovens e adultos na fé cristã e na preparação para os sacramentos.",
    link: "/pastorais/pastoral-da-catequese" },

  { nome: "Pastoral da Comunicação",
    descricao: "Evangeliza através dos meios de comunicação, conectando a Igreja à comunidade.",
    link: "/pastorais/pascom" },

  { nome: "Pastoral do Dízimo",
    descricao: "Estimula a vivência do dízimo como gesto de fé, gratidão e partilha cristã.",
    link: "/pastorais/pastoral-do-dizimo" },

  { nome: "Pastoral Familiar",
    descricao: "Acompanha e fortalece famílias em todas as fases da vida cristã.",
    link: "/pastorais/pastoral-familiar" },

  { nome: "Pastoral Litúrgica",
    descricao: "Organiza e anima as celebrações litúrgicas com dedicação e espírito de fé.",
    link: "/pastorais/pastoral-liturgica" },

  { nome: "Pastoral Música Litúrgica Infanto Juvenil",
    descricao: "Grupo de música formado por crianças e jovens que animam as missas com canto e alegria.",
    link: "/pastorais/musica-liturgica-infantil" },

  { nome: "Pastoral da Sobriedade",
    descricao: "Acolhe e orienta pessoas que buscam libertação de vícios, através da fé e convivência cristã.",
    link: "/pastorais/pastoral-da-sobriedade" },

  { nome: "Pastoral da Terceira Idade",
    descricao: "Promove a valorização e integração dos idosos, fortalecendo o espírito de fé e convivência.",
    link: "/pastorais/pastoral-da-terceira-idade" },

  { nome: "RCC",
    descricao: "Renovação Carismática Católica — movimento de oração e avivamento espiritual.",
    link: "/pastorais/rcc" },

  { nome: "Sementinha de Jesus",
    descricao: "Grupo infantil de iniciação à fé, ensinando os valores cristãos desde a primeira infância.",
    link: "/pastorais/sementinha-de-jesus" },

  { nome: "Socorristas",
    descricao: "Equipe de apoio em primeiros socorros durante eventos e celebrações do Santuário.",
    link: "/pastorais/socorristas" },

  { nome: "Terço dos Homens",
    descricao: "Grupo de oração formado por homens que se reúnem semanalmente para rezar o terço.",
    link: "/pastorais/terco-dos-homens" },

  { nome: "USEC",
    descricao: "União dos Servidores de Cristo — promove encontros de espiritualidade e serviço à Igreja.",
    link: "/pastorais/usec" },

  { nome: "Vicentinos",
    descricao: "Inspirados em São Vicente de Paulo, visitam famílias em necessidade e promovem a caridade.",
    link: "/pastorais/vicentinos" }
];


(function initCarousel(){
  const track = document.getElementById("pastoraisTrack");
  if (!track) return;

  // === estrutura dos cards ===
  track.innerHTML = PASTORAIS.map(p => `
    <li class="car-item">
      <h3>${p.nome}</h3>
      <p class="car-desc">${p.descricao}</p>
      <a href="${p.link}" class="car-link">Ver mais →</a>
    </li>
  `).join("");

  const viewport = track.parentElement;
  const prev = document.querySelector(".car-prev");
  const next = document.querySelector(".car-next");

  let index = 0;
  let perView = getPerView();

  function getPerView(){
    const w = viewport.clientWidth;
    if (w < 560) return 1;
    if (w < 900) return 2;
    return 3;
  }

  function update(){
    const item = track.querySelector(".car-item");
    if (!item) return;
    const itemWidth = item.getBoundingClientRect().width + 12;
    track.style.transform = `translateX(${-index * itemWidth}px)`;
  }

  function clamp(){
    const maxIndex = Math.max(0, PASTORAIS.length - perView);
    if (index > maxIndex) index = 0;
    if (index < 0) index = maxIndex;
  }

  prev?.addEventListener("click", ()=>{ index--; clamp(); update(); });
  next?.addEventListener("click", ()=>{ index++; clamp(); update(); });

  let timer = setInterval(()=>{ index++; clamp(); update(); }, 5000);
  viewport.addEventListener("mouseenter", ()=>clearInterval(timer));
  viewport.addEventListener("mouseleave", ()=> timer = setInterval(()=>{ index++; clamp(); update(); }, 5000));

  addEventListener("resize", ()=>{ perView = getPerView(); clamp(); update(); });

  track.style.transition = "transform .6s ease";
  update();
})();



// PIX: único botão com ícone + feedback
(function(){
  const btn = document.getElementById("copyPixBtn");
  const toast = document.getElementById("pixToast");
  if(!btn) return;
  const code = btn.dataset.pix;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.textContent = "Código PIX copiado!";
      btn.style.background = "#2BA84A";
      setTimeout(() => {
        toast.textContent = "";
        btn.style.background = "#3478FF";
      }, 2000);
    } catch {
      toast.textContent = "Não foi possível copiar.";
    }
  });
})();

// ===== Carrossel de Banners (autoplay 5s, pausa no hover, setas e dots) =====
(function bannerCarousel(){
  const track = document.getElementById('bannerTrack');
  const dotsWrap = document.getElementById('bannerDots');
  const prev = document.querySelector('.ban-prev');
  const next = document.querySelector('.ban-next');
  if(!track || !dotsWrap) return;

  const slides = [...track.children];
  let index = 0;
  let timer = null;
  const interval = 5000; // 5s

  // dots
  dotsWrap.innerHTML = slides.map((_,i)=>`<button aria-label="Ir para slide ${i+1}"></button>`).join('');
  const dots = [...dotsWrap.children];
  function update(){
    track.style.transform = `translateX(${index * -100}%)`;
    dots.forEach((d,i)=>d.classList.toggle('active', i===index));
  }
  function go(i){
    index = (i+slides.length)%slides.length;
    update();
  }
  function nextSlide(){ go(index+1); }
  function prevSlide(){ go(index-1); }

  // autoplay
  function start(){ timer = setInterval(nextSlide, interval); }
  function stop(){ clearInterval(timer); timer=null; }

  // eventos
  next.addEventListener('click', ()=>{ stop(); nextSlide(); start(); });
  prev.addEventListener('click', ()=>{ stop(); prevSlide(); start(); });
  dots.forEach((d,i)=>d.addEventListener('click', ()=>{ stop(); go(i); start(); }));

  // pausa no hover
  const viewport = track.closest('.banner-viewport');
  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);

  // swipe (mobile)
  let sx=0, dx=0;
  viewport.addEventListener('touchstart', e=>{ sx=e.touches[0].clientX; stop(); }, {passive:true});
  viewport.addEventListener('touchmove', e=>{ dx=e.touches[0].clientX - sx; }, {passive:true});
  viewport.addEventListener('touchend', ()=>{ if (Math.abs(dx)>40) (dx<0?nextSlide:prevSlide)(); dx=0; start(); });

  // init
  update(); start();
})();
