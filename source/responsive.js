/* Keep the authored desktop artboards; reflow the same widgets on small screens. */
(() => {
  const pages = __RESPONSIVE_PAGES__;
  const linkStyles = __PORTFOLIO_LINK_STYLES__;
  const mobile = matchMedia('(max-width: 800px)');
  const script = document.currentScript;
  const base = new URL('.', script.src).pathname.replace(/\/$/, '');
  const url = route => `${base}/${route}/`;
  const create = (tag, cls) => { const el = document.createElement(tag); el.className = cls; return el; };
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  function color(value) {
    const hex = value.replace(/^#/, '');
    const channels = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
    const alpha = hex.length === 8 ? Math.min(1, parseInt(hex.slice(6), 16) / 100) : 1;
    return `rgba(${channels.join(',')},${alpha})`;
  }
  function linkAppearance(element, name = 'link-1') {
    const style = linkStyles[name] || linkStyles['link-1'];
    element.classList.add('portfolio-link'); element.dataset.linkStyle = name;
    const label = create('span', 'portfolio-link-label'); label.textContent = element.textContent;
    element.replaceChildren(label);
    [['link', 'rest'], ['hover', 'hover']].forEach(([state, variable]) => {
      element.style.setProperty(`--${variable}-color`, color(style[state].textColor));
      const line = style[state].type === 'Solid' ? color(style[state].color) : 'transparent';
      element.style.setProperty(`--${variable}-line`, `linear-gradient(${line},${line})`);
    });
  }
  function authoredLinkStyle(data, label, footer = false) {
    return data.widgets.find(w => w.type === 'text' &&
      (footer ? w.y > data.footer - 8 : w.y < 120) &&
      w.text.trim().toLowerCase() === label.toLowerCase())?.links[0]?.linkStyle || 'link-1';
  }

  function navigation(data) {
    const route = data.route;
    const header = create('header', 'portfolio-header');
    const nav = create('nav', 'portfolio-nav'); nav.setAttribute('aria-label', 'Main navigation');
    [['Projects', 'projects'], ['About Me', 'aboutme'], ['Jiya Udenia', 'home'], ['Experience', 'work'], ['Contact', 'contact']].forEach(([label, destination]) => {
      const link = create('a', destination === 'home' ? 'portfolio-brand' : 'portfolio-nav-link');
      link.href = url(destination); link.textContent = label;
      linkAppearance(link, authoredLinkStyle(data, label));
      if (destination === route || destination === 'work' && ['travel', 'volunteering'].includes(route)) link.setAttribute('aria-current', 'page');
      nav.append(link);
    });
    header.append(nav);
    if (['work', 'travel', 'volunteering'].includes(route)) {
      const subnav = create('nav', 'portfolio-subnav'); subnav.setAttribute('aria-label', 'Experience navigation');
      [['Work', 'work'], ['Living Experience', 'travel'], ['Volunteering', 'volunteering']].forEach(([label, destination]) => {
        const link = create('a', ''); link.href = url(destination); link.textContent = label;
        linkAppearance(link, authoredLinkStyle(data, label));
        if (route === destination) link.setAttribute('aria-current', 'page'); subnav.append(link);
      }); header.append(subnav);
    }
    return header;
  }

  function enhance(page, data) {
    if (page.classList.contains('portfolio-page')) return;
    if (data.route === 'work' && !page.classList.contains('experience-page')) return;
    const widgets = data.widgets.filter(w => w.type !== 'background' && !w.hidden);
    if (!widgets.every(w => page.querySelector(`[data-id="${w.id}"]`))) return;
    const nodes = new Map(widgets.map(w => {
      const widget = page.querySelector(`[data-id="${w.id}"]`);
      return [w.id, widget.closest('.animation-container') || widget];
    }));
    page.classList.add('portfolio-page'); page.dataset.route = data.route;
    page.closest('.content-bounds').classList.add('portfolio-bounds');
    const header = navigation(data);
    const footer = create('footer', 'portfolio-footer');
    const signature = create('a', 'portfolio-signature'); signature.href = url('home'); signature.textContent = 'Jiya Udenia';
    const copyright = create('p', ''); copyright.textContent = widgets.find(w => w.text.startsWith('Copyright'))?.text || 'Copyright © 2025 All rights Reserved. Jiya Udenia';
    const contact = create('a', ''); contact.href = url('contact'); contact.textContent = 'Contact';
    const top = create('button', ''); top.type = 'button'; top.textContent = 'Back to top';
    linkAppearance(signature, authoredLinkStyle(data, 'Jiya Udenia'));
    linkAppearance(contact, authoredLinkStyle(data, 'Contact', true));
    linkAppearance(top, authoredLinkStyle(data, 'Back to top', true));
    top.addEventListener('click', () => page.closest('.content-scroll-wrapper').scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
    footer.append(signature, copyright, contact, top);
    // These links use normal document navigation, including repository subpaths.
    [header, footer].forEach(region => region.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); event.stopPropagation();
      if (new URL(link.href).pathname === new URL(url(data.route), location.href).pathname) {
        page.closest('.content-scroll-wrapper').scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      } else location.assign(link.href);
    }, true));
    const isChrome = w => w.y < 90 && w.type === 'text' || w.text.startsWith('Copyright') || w.y > data.footer - 8 ||
      ['work', 'travel', 'volunteering'].includes(data.route) && w.type === 'text' && w.y < 120 && w.w < 150;
    widgets.filter(isChrome).forEach(w => nodes.get(w.id).classList.add('portfolio-original-hidden'));
    if (data.route === 'work') {
      page.querySelector('.experience-header').replaceWith(header);
      page.querySelector('.experience-footer').replaceWith(footer);
      return;
    }
    const main = create('main', 'portfolio-main'); main.setAttribute('aria-label', data.title);
    main.style.setProperty('--desktop-height', `${data.footer - 32}px`);
    const content = widgets.filter(w => !isChrome(w));
    const used = new Set();
    function section(items, copy = false, label = '') {
      items = items.filter(w => !used.has(w.id)); if (!items.length) return;
      items.forEach(w => used.add(w.id));
      const frame = create('section', copy ? 'portfolio-copy' : 'portfolio-frame');
      if (label) frame.setAttribute('aria-label', label);
      const canvas = copy ? frame : create('div', 'portfolio-artboard');
      if (!copy) {
        const x = Math.min(...items.map(w => w.x)); const y = Math.min(...items.map(w => w.y));
        const width = Math.max(...items.map(w => w.x + w.w)) - x;
        const height = Math.max(...items.map(w => w.y + w.h)) - y;
        frame.style.setProperty('--art-width', width); frame.style.setProperty('--art-height', height);
        canvas.style.setProperty('--art-width', width); canvas.style.setProperty('--art-height', height);
        items.forEach(w => {
          const node = nodes.get(w.id);
          // Several animated widgets can share one wrapper; position the
          // wrapper from its own box, preserving its children's offsets.
          node.style.setProperty('--mobile-left', `${parseFloat(node.style.left) - x}px`);
          node.style.setProperty('--mobile-top', `${parseFloat(node.style.top) - y}px`);
        });
        frame.append(canvas);
      }
      items.sort((a, b) => a.y - b.y || a.x - b.x).forEach(w => {
        const node = nodes.get(w.id);
        if (copy) {
          node.classList.add(w.type === 'form' ? 'portfolio-form' : w.text.length > 100 ? 'portfolio-paragraph' : 'portfolio-heading');
        }
        canvas.append(node);
      }); main.append(frame);
      if (['travel', 'volunteering'].includes(data.route)) {
        items.filter(w => w.type === 'hotspot' && w.details.length).forEach(w => {
          const disclosure = create('details', 'portfolio-mobile-details');
          const summary = create('summary', ''); summary.textContent = w.details[0].text; disclosure.append(summary);
          w.details.slice(1).filter(block => block.text).forEach(block => {
            const paragraph = create('p', ''); let offset = 0;
            block.links.filter(link => /^https?:\/\//.test(link.url || '')).sort((a, b) => a.offset - b.offset).forEach(link => {
              paragraph.append(document.createTextNode(block.text.slice(offset, link.offset)));
              const anchor = create('a', ''); anchor.href = link.url; anchor.target = link.target || '_self'; anchor.rel = 'noopener';
              anchor.textContent = block.text.slice(link.offset, link.offset + link.length); paragraph.append(anchor); offset = link.offset + link.length;
              linkAppearance(anchor, link.linkStyle);
            });
            paragraph.append(document.createTextNode(block.text.slice(offset))); disclosure.append(paragraph);
          });
          disclosure.addEventListener('click', event => { if (event.target.closest('a')) event.stopPropagation(); }, true);
          main.append(disclosure);
          if (data.route === 'travel') {
            const marker = create('button', 'portfolio-map-marker'); marker.type = 'button'; marker.setAttribute('aria-label', w.details[0].text);
            marker.setAttribute('aria-controls', `location-${w.id}`); disclosure.id = `location-${w.id}`;
            marker.style.left = `${parseFloat(nodes.get(w.id).style.getPropertyValue('--mobile-left')) + 10}px`;
            marker.style.top = `${parseFloat(nodes.get(w.id).style.getPropertyValue('--mobile-top')) + 10}px`;
            if (w.pin) { const icon = create('img', ''); icon.src = w.pin; icon.alt = ''; marker.append(icon); }
            marker.addEventListener('click', () => { disclosure.open = true; disclosure.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'}); });
            canvas.append(marker);
          }
        });
      }
    }
    const between = (a, b, x1 = -Infinity, x2 = Infinity) => content.filter(w => w.y >= a && w.y < b && w.x >= x1 && w.x < x2);
    const row = (a, b) => {
      const items = between(a, b);
      section(items.filter(w => w.type === 'text'), true);
      section(items.filter(w => w.type !== 'text'));
    };
    switch (data.route) {
      case 'home':
        section(between(90, 530));
        [90, 300, 512, 723].forEach((x, i, xs) => section(between(530, 920, x, xs[i + 1] || 1000)));
        row(920, 1380);
        section(between(1380, 1740, 0, 510)); section(between(1380, 1740, 510)); break;
      case 'projects':
        section(content.filter(w => w.x < 0), true);
        [[90, 370, 0, 565], [90, 370, 565, 1024], [370, 650, 0, 565], [370, 650, 565, 1024]].forEach(args => section(between(...args))); break;
      case 'aboutme': section(between(90, 420)); section(between(420, data.footer), true); break;
      case 'contact': section(between(90, data.footer), true); break;
      case 'travel':
        section(content.filter(w => w.text.toLowerCase() === 'experience'), true);
        section(content.filter(w => w.type !== 'text')); break;
      case 'volunteering':
        section(content.filter(w => w.text.toLowerCase() === 'experience'), true);
        section(between(120, 360)); section(between(360, 610)); break;
      case 'loewe':
        section(between(80, 630)); row(630, 810); row(810, 1100); row(1100, 1650); row(1650, 2030);
        section(between(2030, 2440).filter(w => w.type === 'text'), true);
        section(between(2030, 2440).filter(w => w.type !== 'text' && w.h < 500)); row(2440, data.footer); break;
      case 'sabyasachi':
        section(between(80, 580)); row(580, 900); row(900, 1080); row(1080, 1500); row(1500, 1970); row(1970, 2260); row(2260, data.footer); break;
      case 'jacquemus':
        section(between(80, 580)); row(580, 875); row(875, 1210); row(1210, 1350); row(1350, 1690); row(1690, 2030); section(between(2030, data.footer)); break;
      case 'avavav':
        section(between(90, 600)); row(600, 850); row(850, 1090); row(1090, 1540); row(1540, 1930); row(1930, 2220); row(2220, 2670); row(2670, 3120); row(3120, 3300); section(between(3300, data.footer)); break;
    }
    // Retain decorative widgets in the desktop composition.
    content.filter(w => !used.has(w.id)).forEach(w => { const node = nodes.get(w.id); node.classList.add('portfolio-desktop-only'); main.append(node); });
    page.append(header, main, footer);
    // Reparented artboards use the original opacity targets and timings.
    // Touch users keep card labels visible and can tap product covers to reveal them.
    const animated = new Set();
    content.forEach(w => {
      const animation = w.animation.find(a => a.type === 'hover' && a.steps[0]?.use_opacity);
      if (!animation) return;
      const node = nodes.get(w.id); if (animated.has(node)) return; animated.add(node);
      const step = animation.steps[0];
      node.classList.add('portfolio-hover-animation');
      node.style.setProperty('--hover-rest-opacity', step.from_opacity / 100);
      node.style.setProperty('--hover-target-opacity', step.opacity / 100);
      node.style.setProperty('--hover-duration', `${step.duration}s`);
      node.style.setProperty('--hover-easing', step.acceleration === 'ease-out' ? 'ease-out' : 'ease-in-out');
      if (step.opacity === 0) {
        node.classList.add('portfolio-product-cover'); node.tabIndex = 0; node.setAttribute('role', 'button');
        node.setAttribute('aria-label', 'Reveal product preview'); node.setAttribute('aria-pressed', 'false');
        const toggle = () => { const open = node.classList.toggle('is-revealed'); node.setAttribute('aria-pressed', String(open)); };
        node.addEventListener('click', () => { if (!finePointer.matches) toggle(); });
        node.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
          if (event.key === 'Escape') { node.classList.remove('is-revealed'); node.setAttribute('aria-pressed', 'false'); }
        });
      }
    });
    // On flowing layouts, scroll fades follow the elements' actual positions.
    const scroller = page.closest('.content-scroll-wrapper');
    const scrollNodes = [...new Set(content.filter(w => w.animation.some(a => a.type === 'scroll')).map(w => nodes.get(w.id)))];
    let scrollPending = false;
    const scrollEffects = () => {
      scrollPending = false;
      if (!mobile.matches) return;
      const edge = scroller.getBoundingClientRect().bottom;
      scrollNodes.forEach(node => {
        node.classList.add('portfolio-scroll-animation');
        const progress = Math.max(0, Math.min(1, (edge - node.getBoundingClientRect().top) / (scroller.clientHeight / 4)));
        node.style.setProperty('--scroll-opacity', matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : progress);
      });
    };
    if (scrollNodes.length) scroller.addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(scrollEffects); } }, {passive: true});
    const resize = () => {
      main.style.setProperty('--desktop-scale', Math.min(1, page.clientWidth / 1024));
      main.querySelectorAll('.portfolio-frame').forEach(frame => {
        const width = Number(frame.style.getPropertyValue('--art-width'));
        frame.style.setProperty('--art-scale', Math.min(1, frame.clientWidth / width));
      });
      scrollEffects();
    };
    new ResizeObserver(resize).observe(page); mobile.addEventListener('change', resize); resize();
  }

  let pending = false;
  const update = () => {
    pending = false;
    document.querySelectorAll('.page-content-container:not(.portfolio-page)').forEach(page => {
      const data = pages.find(p => p.widgets.some(w => w.type !== 'background' && page.querySelector(`[data-id="${w.id}"]`)));
      if (data) enhance(page, data);
    });
  };
  new MutationObserver(() => { if (!pending) { pending = true; requestAnimationFrame(update); } }).observe(document.documentElement, {childList: true, subtree: true});
  update();
})();
