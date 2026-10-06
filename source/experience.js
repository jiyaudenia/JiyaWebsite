/* Reuse the authored Readymag pictures/titles in a flowing, accessible card stack. */
(() => {
  const cards = __EXPERIENCE_CARDS__;
  function enhance() {
    const page = document.querySelector('[data-id="portfolio-dimohe-title"]')?.parentElement;
    if (!page || page.classList.contains('experience-page')) return;
    const essentials=['68d04f0856c658ca6c144618','68d9c6dd5ed6828707f9d165','68d9c6dd57b93610dcb23fbb','68d9c6deab182a7dd5e5d493','68d9c6de0ed9da232c8adab5'];
    if (!essentials.every(id=>page.querySelector(`[data-id="${id}"]`))) return;
    if (!cards.every(c => page.querySelector(`[data-id="${c.title}"]`) && c.images.every(i => page.querySelector(`[data-id="${i.id}"]`)))) return;
    page.classList.add('experience-page');
    page.closest('.content-bounds').classList.add('experience-bounds');
    const header = document.createElement('header'); header.className='experience-header';
    const headerCanvas = document.createElement('div'); headerCanvas.className='experience-header-canvas';header.append(headerCanvas);
    const footer=document.createElement('footer');footer.className='experience-footer';
    const originalNodes=Array.from(page.children);
    originalNodes.forEach(el => {
      const y=parseFloat(el.style.top);
      if(y<120 && el.dataset.id!=='68bca0cd54434bf0d4127e2c') headerCanvas.append(el);
      if(y>1450){el.style.top=(y-1469.69)+'px';footer.append(el);}
    });
    const section=document.createElement('section');section.className='experience-section';section.setAttribute('aria-labelledby','experience-label');
    const rail=document.createElement('aside');rail.className='experience-rail';
    const label=document.createElement('h1');label.id='experience-label';label.textContent='EXPERIENCE';rail.append(label);
    const stack=document.createElement('div');stack.className='experience-stack';section.append(rail,stack);
    cards.forEach((data,index)=>{
      const card=document.createElement('article');card.className='experience-card';
      data.images.forEach(i=>{const el=page.querySelector(`[data-id="${i.id}"]`);el.style.setProperty('--image-left',i.left+'%');el.style.setProperty('--image-width',i.width+'%');card.append(el);const img=el.querySelector('img');if(img)img.alt=index===0?'Dimohe brand and product imagery':'';});
      const shade=document.createElement('div');shade.className='experience-shade';card.append(shade);
      const title=page.querySelector(`[data-id="${data.title}"]`);title.classList.add('experience-title');card.append(title);
      const toggle=document.createElement('button');toggle.className='experience-toggle';toggle.type='button';toggle.setAttribute('aria-label','Details about '+data.heading);toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','experience-panel-'+index);
      const panel=document.createElement('div');panel.className='experience-panel';panel.id='experience-panel-'+index;panel.setAttribute('aria-hidden','true');
      const heading=document.createElement('h2');heading.textContent=data.heading;const body=document.createElement('p');body.textContent=data.body;panel.append(heading,body);card.append(toggle,panel);
      function setOpen(open){card.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));panel.setAttribute('aria-hidden',String(!open));}
      toggle.addEventListener('click',()=>setOpen(matchMedia('(hover: hover) and (pointer: fine) and (min-width: 601px)').matches ? true : !card.classList.contains('is-open')));
      card.addEventListener('mouseenter',()=>{if(matchMedia('(hover: hover) and (pointer: fine) and (min-width: 601px)').matches)setOpen(true)});
      card.addEventListener('mouseleave',()=>{if(matchMedia('(hover: hover) and (pointer: fine) and (min-width: 601px)').matches)setOpen(false)});
      card.addEventListener('keydown',e=>{if(e.key==='Escape'){setOpen(false);toggle.focus()}});
      card.addEventListener('focusout',e=>{if(!card.contains(e.relatedTarget))setOpen(false)});
      stack.append(card);
    });
    originalNodes.forEach(el=>{if(el.parentElement===page)el.classList.add('experience-original-hidden')});
    page.append(header,section,footer);
    // Preserve local navigation when authored widgets are placed in new wrappers.
    [header,footer].forEach(region=>region.addEventListener('click',e=>{
      const link=e.target.closest('a');if(!link)return;
      const href=link.getAttribute('href');
      if(href && href.startsWith('/')){e.preventDefault();e.stopPropagation();location.assign(href);}
      else if(link.textContent.toLowerCase().includes('back to top')){e.preventDefault();e.stopPropagation();page.closest('.content-scroll-wrapper').scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    },true));
    function sizeHeader(){footer.style.setProperty('--footer-scale',Math.min(1,page.clientWidth/1024));header.style.height=(126*Math.min(1,page.clientWidth/1024))+'px';headerCanvas.style.transform=`scale(${Math.min(1,page.clientWidth/1024)})`;}
    new ResizeObserver(sizeHeader).observe(page);sizeHeader();
    // Size every card to accommodate the longest panel as its text reflows.
    const fitPanels=()=>stack.style.setProperty('--panel-min-height', Math.max(...Array.from(stack.querySelectorAll('.experience-panel'), p=>p.offsetHeight))+32+'px');
    const panelsObserver=new ResizeObserver(fitPanels);stack.querySelectorAll('.experience-panel').forEach(p=>panelsObserver.observe(p));fitPanels();
  }
  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
  enhance();
})();
