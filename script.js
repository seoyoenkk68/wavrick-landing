import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
(() => {
  'use strict';
  const hero = document.getElementById('heroScroll');
  const stage = hero.querySelector('.hero-sticky');
  const header = document.getElementById('siteHeader');
  const menu = document.getElementById('menuToggle');
  const nav = document.getElementById('mobileNav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lenis = null;
  function setupSmoothScroll() {
    lenis?.destroy(); lenis = null;
    if (!reduced.matches) {
      lenis = new Lenis({autoRaf:true, lerp:.085, smoothWheel:true, syncTouch:false, anchors:true, wheelMultiplier:.85});
      lenis.on('scroll', schedule);
    }
    document.documentElement.dataset.scrollEngine = lenis ? 'lenis' : 'native';
  }
  reduced.addEventListener('change', setupSmoothScroll);
  addEventListener('pagehide', () => lenis?.destroy(), {once:true});
  const about = document.getElementById('about');
  const panels = [...about.querySelectorAll('.about-panel')];
  const smooth = n => { n = Math.max(0, Math.min(1, n)); return n*n*(3-2*n); };
  function updateAbout() {
    const aboutTop = about.getBoundingClientRect().top;
    const entrance = smooth((innerHeight * .35 - aboutTop) / (innerHeight * .43));
    const p = Math.max(0, Math.min(1, -aboutTop / Math.max(1, about.offsetHeight - innerHeight)));
    panels.forEach((panel, i) => {
      const relative = p * (panels.length - 1) - i;
      const opacity = smooth((.52 - Math.abs(relative)) / .24) * (i === 0 ? entrance : 1);
      if (reduced.matches) {
        panel.style.opacity = ''; panel.style.transform = ''; panel.style.visibility = '';
      } else {
        panel.style.opacity = opacity;
        panel.style.transform = `translateY(calc(-50% + ${-relative * 40 + (i === 0 ? (1 - entrance) * 28 : 0)}px))`;
        panel.style.visibility = opacity > .001 ? 'visible' : 'hidden';
      }
    });
  }
  const build = document.getElementById('how-we-build');
  const introParts = [...build.querySelector('.build-intro').children];
  const buildSteps = [...build.querySelectorAll('.build-step')];
  const stepMarkers = [...build.querySelectorAll('.build-step-index span')];
  function updateBuildCopy() {
    const depth = -build.getBoundingClientRect().top / innerHeight;
    const businessReturn = smooth((innerHeight - document.getElementById('our-business').getBoundingClientRect().top) / (innerHeight * .65));
    const blackout = smooth((depth + .45) / .5) * (1 - businessReturn);
    document.body.style.backgroundColor = 'rgb(' + [9, 13, 20].map(channel => Math.round(channel * (1 - blackout))).join(',') + ')';
    introParts.forEach((part,i) => {
      const enter = reduced.matches ? 1 : smooth((depth-.05-i*.08)/.35);
      part.style.opacity=enter;
      part.style.transform=`translateY(${(1-enter)*32}px)`;
    });
    const entrance=reduced.matches?1:smooth((depth-.75)/.3);
    build.style.setProperty('--process-opacity',entrance);
    const p=Math.max(0,Math.min(1,(depth-.95)/3.6));
    const active=Math.round(p*3);
    buildSteps.forEach((step,i) => {
      const relative=p*3-i;
      const opacity=reduced.matches?1:smooth((.54-Math.abs(relative))/.24);
      step.style.opacity=opacity;
      step.style.visibility=opacity>.001?'visible':'hidden';
      step.style.transform=`translateY(${-relative*90}px)`;
      stepMarkers[i].classList.toggle('is-current',i===active);
    });
    build.dataset.activeStep=String(active+1);
  }
  let previousScrollY = Math.max(0, scrollY);
  let scrollIntent = 0;
  function updateHeader() {
    const current = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = current - previousScrollY;
    previousScrollY = current;
    header.classList.toggle('is-scrolled', current > 24);
    if (current <= 24 || menu.getAttribute('aria-expanded') === 'true') {
      header.classList.remove('is-hidden');
      scrollIntent = 0;
      return;
    }
    if (delta) {
      scrollIntent = Math.sign(delta) === Math.sign(scrollIntent) ? scrollIntent + delta : delta;
      // Ignore tiny trackpad changes, while responding promptly to direction changes.
      if (Math.abs(scrollIntent) >= 8) {
        header.classList.toggle('is-hidden', scrollIntent > 0);
        scrollIntent = 0;
      }
    }
  }
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  let ticking = false;
  function update() {
    const distance = Math.max(1, hero.offsetHeight - innerHeight);
    const p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance));
    const motion = reduced.matches ? 0 : p;
    const range = Math.min(innerWidth * .03, 58);
    stage.style.setProperty('--first-x', `${-motion * range}px`);
    stage.style.setProperty('--second-x', `${motion * range}px`);
    stage.style.setProperty('--copy-y', `${-motion * 28}px`);
    stage.style.setProperty('--progress', String(p));
    updateHeader();
    updateAbout();
    updateBuildCopy();
    updateBusinessGrid();
    updateVision();
    ticking = false;
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  function setMenu(open) { if (open) header.classList.remove('is-hidden'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기'); nav.hidden = !open; }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); } });
  // 04: one-time viewport entrances, independent of scroll speed.
  const businessSection = document.getElementById('our-business');
  const grid = document.createElement('div');
  grid.className = 'business-grid';
  grid.setAttribute('aria-hidden', 'true');
  businessSection.prepend(grid);
  let businessGridProgress = 0;
  function updateBusinessGrid() {
    const top = businessSection.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, (innerHeight * .7 - top) / Math.min(160, innerHeight * .18)));
    // Keep the completed grid when scrolling back up.
    businessGridProgress = Math.max(businessGridProgress, reduced.matches ? (progress > 0 ? 1 : 0) : progress);
    const gridWidth = businessSection.querySelector(".business-inner").getBoundingClientRect().width;
    const cell = gridWidth / (innerWidth < 768 ? 2 : 4);
    businessSection.style.setProperty('--business-grid-cell', `${cell}px`);
    businessSection.style.setProperty('--business-grid-x', `${businessGridProgress * 75}%`);
    businessSection.style.setProperty('--business-grid-y', `${businessGridProgress * 120}%`);
    businessSection.style.setProperty('--business-grid-light', String(businessGridProgress));
  }
  const revealItems = [...businessSection.querySelectorAll('.business-heading > *, .platform-browser, .platform-copy > *, .business-beyond')];
  revealItems.forEach(item => {
    item.classList.add('business-reveal');
    if (item.classList.contains('business-beyond')) item.style.setProperty('--reveal-delay', '500ms');
    if (item.parentElement.classList.contains('business-heading')) item.style.setProperty('--reveal-delay', item.tagName === 'P' ? '100ms' : '0ms');
    if (item.parentElement.classList.contains('platform-copy')) item.style.setProperty('--reveal-delay', `${Math.min([...item.parentElement.children].indexOf(item), 3) * 65}ms`);
  });
  // Observe a smaller viewport so the movement starts where it can be seen.
  // Reset only below the viewport, allowing another entrance after scrolling up.
  const businessObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === businessSection) {
        if (entry.isIntersecting) entry.target.classList.add('has-entered');
        return;
      }
      if (entry.isIntersecting) entry.target.classList.add('is-revealed');
      else if (entry.boundingClientRect.top > 0) entry.target.classList.remove('is-revealed');
    });
  }, {threshold: 0, rootMargin: '0px 0px -18% 0px'});
  businessObserver.observe(businessSection);
  revealItems.forEach(item => businessObserver.observe(item));
  businessSection.classList.add('business-motion-ready');
  const visionSection=document.getElementById('vision');
  const visionHeading=visionSection?visionSection.querySelector('.vision-heading'):null;
  const visionEyebrow=visionHeading?visionHeading.querySelector('.build-eyebrow'):null;
  const visionTitle=visionHeading?visionHeading.querySelector('h2'):null;
  const visionGroup=visionSection?visionSection.querySelector('.vision-group'):null;
  const visionBottom=visionSection?visionSection.querySelector('.vision-bottom'):null;
  const visionCards=[...visionSection.querySelectorAll('.vision-card')];
  const visionCopies=[...visionSection.querySelectorAll('.vision-copy')];

  const visionRevealItems=[visionEyebrow,visionTitle,visionGroup,visionBottom].filter(Boolean);
  if(visionEyebrow){
    visionEyebrow.classList.add('vision-reveal');
    visionEyebrow.style.setProperty('--vision-delay','0ms');
  }
  if(visionTitle){
    visionTitle.classList.add('vision-reveal');
    visionTitle.style.setProperty('--vision-delay','80ms');
  }
  if(visionGroup){
    visionGroup.classList.add('vision-reveal');
    visionGroup.style.setProperty('--vision-delay','260ms');
  }
  if(visionBottom){
    visionBottom.classList.add('vision-reveal');
    visionBottom.style.setProperty('--vision-delay','380ms');
  }

  const visionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        visionRevealItems.forEach(item=>item.classList.add('is-revealed'));
      }else if(entry.boundingClientRect.top>0){
        visionRevealItems.forEach(item=>item.classList.remove('is-revealed'));
      }
    });
  },{threshold:0,rootMargin:'0px 0px -20% 0px'});
  if(visionSection) visionObserver.observe(visionSection);

  function updateVision(){
    const rect=visionSection.getBoundingClientRect();
    const depth=-rect.top/innerHeight;
    if(rect.top<=innerHeight*0.75){
      visionRevealItems.forEach(item=>item.classList.add('is-revealed'));
    }else if(rect.top>innerHeight*0.9){
      visionRevealItems.forEach(item=>item.classList.remove('is-revealed'));
    }
    const sequence=Math.max(0,Math.min(2,(depth-.3)/1.3));
    const active=Math.round(sequence);
    if(visionHeading){
      if(reduced.matches){
        visionHeading.style.transform='none';
        visionHeading.style.opacity='1';
        visionHeading.style.filter='none';
        visionHeading.style.visibility='visible';
      }else{
        const headingProgress=Math.max(0,Math.min(1,sequence/0.95));
        const ease=smooth(headingProgress);
        const moveY=(window.innerWidth<768?60:100)*ease;
        const blur=ease*16;
        const opacity=Math.max(0,1-ease);
        visionHeading.style.transform=`translate3d(0, ${moveY.toFixed(1)}px, 0)`;
        visionHeading.style.opacity=opacity.toFixed(3);
        visionHeading.style.filter=blur>0.1?`blur(${blur.toFixed(1)}px)`:'none';
        visionHeading.style.visibility=opacity>0.005?'visible':'hidden';
      }
    }
    visionCards.forEach((card,i)=>{
      const relative=i-sequence;
      const distance=Math.abs(relative);
      card.style.transform=reduced.matches?'none':`translate(-50%, -50%) translateY(${relative*innerHeight*.55}px) perspective(1200px) rotateX(${-relative*17}deg) rotateZ(${relative*2.5}deg) scale(${1-Math.min(distance,1)*.1})`;
      card.style.opacity=reduced.matches?'1':String(1-Math.min(distance,1)*.68);
      card.style.zIndex=String(5-Math.round(distance*2));
      card.setAttribute('aria-hidden',String(!reduced.matches&&i!==active));
      const opacity=reduced.matches?1:smooth((.52-distance)/.22);
      const copy=visionCopies[i];copy.style.opacity=String(opacity);
      copy.style.visibility=opacity>.001?'visible':'hidden';
      copy.style.transform=reduced.matches?'none':`translateY(calc(-50% + ${relative*30}px))`;
    });
    visionSection.querySelector('.vision-count').textContent=`0${active+1} / 03`;
    visionSection.dataset.activeVision=String(active+1);
  }
  // Contact: character wave reveal inspired by the supplied motion reference.
  const contactContent = document.querySelector('.contact-content');
  const contactTitle = document.getElementById('contact-title');
  const titleLines = contactTitle.innerText.split(/\n+/).map(line=>line.trim()).filter(Boolean);
  contactTitle.setAttribute('aria-label', titleLines.join(' '));
  contactTitle.textContent = '';
  titleLines.forEach((text,lineIndex) => {
    const line=document.createElement(lineIndex ? 'em' : 'span');
    line.className='contact-title-line';line.setAttribute('aria-hidden','true');
    [...text].forEach((character,index) => {
      const letter=document.createElement('span');letter.className='contact-letter';
      letter.textContent=character;letter.style.setProperty('--letter-delay', `${300+lineIndex*460+index*24}ms`);
      line.appendChild(letter);
    });
    contactTitle.appendChild(line);
  });
  [contactContent.querySelector('.contact-eyebrow'),contactContent.querySelector('.contact-description')].forEach((element,blockIndex)=>{
    const lines=element.innerHTML.split(/<br\s*\/?\s*>/i).map(html=>{
      const temp=document.createElement('span');temp.innerHTML=html;return temp.textContent.trim();
    });
    element.setAttribute('aria-label',lines.join(' '));element.textContent='';
    lines.forEach((text,lineIndex)=>{
      const line=document.createElement('span');line.className='contact-support-line';line.setAttribute('aria-hidden','true');
      [...text].forEach((character,index)=>{
        const letter=document.createElement('span');letter.className='contact-letter';letter.textContent=character;
        letter.style.setProperty('--letter-delay',`${(blockIndex?1150:0)+lineIndex*330+index*(blockIndex?20:16)}ms`);
        line.appendChild(letter);
      });
      element.appendChild(line);
    });
  });
  contactContent.classList.add('contact-motion-ready');
  const contactObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting) contactContent.classList.add('contact-is-visible');
    else if(entry.boundingClientRect.top>0) contactContent.classList.remove('contact-is-visible');
  }),{rootMargin:'0px 0px -20% 0px',threshold:0});
  contactObserver.observe(contactContent);

  // Contact Layer Modal handlers
  const contactModal = document.getElementById('contactModal');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalOkBtn = document.getElementById('modalOkBtn');
  const contactForm = document.getElementById('contactForm');
  const modalFields = document.getElementById('modalFields');
  const modalSuccessBox = document.getElementById('modalSuccessBox');

  function openContactModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }
    if (!contactModal) return;
    contactModal.classList.add('is-open');
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setMenu(false);
    setTimeout(() => {
      document.getElementById('modalName')?.focus();
    }, 100);
  }

  function closeContactModal() {
    if (!contactModal) return;
    contactModal.classList.remove('is-open');
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      contactForm?.reset();
      if (modalFields) modalFields.hidden = false;
      if (modalSuccessBox) modalSuccessBox.hidden = true;
    }, 350);
  }

  document.querySelectorAll('.nav-contact, .mobile-nav-contact, .contact-project').forEach(btn => {
    btn.addEventListener('click', openContactModal);
  });

  modalClose?.addEventListener('click', closeContactModal);
  modalBackdrop?.addEventListener('click', closeContactModal);
  modalOkBtn?.addEventListener('click', closeContactModal);

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && contactModal?.classList.contains('is-open')) {
      closeContactModal();
    }
  });

  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (modalFields) modalFields.hidden = true;
    if (modalSuccessBox) modalSuccessBox.hidden = false;
  });

  setupSmoothScroll();
  update();
})();

