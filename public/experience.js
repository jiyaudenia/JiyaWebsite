/* Reuse the authored Readymag pictures/titles in a flowing, accessible card stack. */
(() => {
  const cards = [{"title": "portfolio-dimohe-title", "hotspot": "portfolio-dimohe-hotspot", "images": [{"id": "portfolio-dimohe-image-0", "left": 0.0, "width": 25.0}, {"id": "portfolio-dimohe-image-1", "left": 25.0, "width": 25.0}, {"id": "portfolio-dimohe-image-2", "left": 50.0, "width": 25.0}, {"id": "portfolio-dimohe-image-3", "left": 75.0, "width": 25.0}], "heading": "Dimohe, New York", "body": "As E-commerce & Branding Intern at Dimohe, I support digital initiatives across e-commerce, marketing, and strategy while developing product content and conducting market research to strengthen brand positioning and the online customer experience."}, {"title": "68d06bff78828861430cfece", "hotspot": "68d66086b074e8e08e7a9e8f", "images": [{"id": "68d077991f7248eef2acab02", "left": 69.44065484311051, "width": 30.42291950886767}, {"id": "68d077bfb26d5c8182275b25", "left": 0.1364256480218281, "width": 20.463847203274216}, {"id": "68d077f4c1356bbcee948a38", "left": 45.56616643929058, "width": 24.283765347885403}, {"id": "68d078e3c3d1f2e4f456bfcf", "left": 20.600272851296044, "width": 25.102319236016374}], "heading": "SCAD FASH Museum of Fashion + Film, Atlanta", "body": "As lead docent for exhibitions including Jeanne Lanvin and Campbell Addy, I conducted tours, supported high-profile events, and managed administrative responsibilities. Engaged with luxury heritage, art, and influential guests in a professional museum environment."}, {"title": "68d06ef85b58ac022595dedc", "hotspot": "68d66086a97e9e69e47e2e69", "images": [{"id": "68d06d642bd962d3dddfc7d4", "left": 0.1364256480218281, "width": 26.46657571623465}, {"id": "68d0756a6e53e6c43ce7de6e", "left": 54.570259208731244, "width": 22.237380627557982}, {"id": "68d0791fb9ee09c3e4671b30", "left": 76.67121418826738, "width": 23.328785811732605}, {"id": "68d079b06e53e6c43ce8a7cd", "left": 26.603001364256478, "width": 27.83083219645293}, {"id": "68d07bd6df71c8b00eba4b43", "left": 54.384720327421554, "width": 22.28649386084584}], "heading": "VERSACE ROSENTHAL", "body": "At Versace Rosenthal in New Delhi, in December' 24, I immersed myself in the luxury home and lifestyle sector, like Daum, Lalique, Roberto Cavalli, all under Versace Rosenthal. Assisting with buying and planning cycles, elevating visual merchandising displays, and shaping in-store storytelling that reflected the brand\u2019s refined aesthetic."}, {"title": "68d07d965b58ac022598aad0", "hotspot": "68d66086f8d8a981ae348887", "images": [{"id": "68d076546e53e6c43ce80f80", "left": 0.1364256480218281, "width": 24.01091405184175}, {"id": "68d076b078828861430ea78c", "left": 47.88540245566166, "width": 24.965893587994543}, {"id": "68d07732ed50aa610a1af100", "left": 24.147339699863572, "width": 23.73806275579809}, {"id": "68d0776002a307ffcc4ae778", "left": 72.71487039563438, "width": 27.285129604365622}], "heading": "LUSCENTRA", "body": "At Luscentra, a wellness and home care brand, from September to November 2023, I contributed to brand growth through digital storytelling and content creation, designing and managing social media campaigns that showcased Vitamin C aromatherapy showerheads and their wellness benefits while cultivating an engaging online presence that aligned with the brand\u2019s mission of transforming everyday routines into spa-like experiences."}, {"title": "68d0833f69e092316bda9107", "hotspot": "68d660ad9ccf13a326b19fa9", "images": [{"id": "68d07ea2a9739503d53cd0d0", "left": 36.01637107776262, "width": 28.6493860845839}, {"id": "68d07fac5b58ac022598f7c6", "left": 0.10368349249658812, "width": 35.91268758526603}, {"id": "68d0806aae0efd0b5ae84af6", "left": 64.39290586630287, "width": 35.541609822646656}], "heading": "PAYONEER", "body": "At Payoneer in Israel, from February' 23 to June' 24, I specialized in fraud and anti\u2013money laundering prevention, analyzing data patterns and refining compliance workflows while cultivating adaptability and problem-solving skills within a dynamic global fintech environment."}];
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
