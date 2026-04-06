class ModuleRouter extends HTMLElement {
  constructor() {
    super();
    this.routes = [];
    this.layout = null;
  }

  connectedCallback() {
    this.prepareLayout();
    this.injectStyles();
    this.scanRoutes();

    window.addEventListener('popstate', () => this.route());

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href.startsWith(window.location.origin)) {
        if (link.target && link.target !== '_self') return;
        e.preventDefault();
        window.history.pushState({}, '', link.href);
        this.route();
      }
    });

    this.route();
  }

  prepareLayout() {
    const template = this.querySelector('template');
    if (template) {
      this.layout = template.innerHTML;
      this.innerHTML = ''; 
    }
  }

  injectStyles() {
    if (document.getElementById('mr-styles')) return;
    const style = document.createElement('style');
    style.id = 'mr-styles';
    style.innerHTML = `
      module-router { display: block; transition: opacity 0.2s ease-in-out; opacity: 1; }
      module-router.mr-fade-out { opacity: 0; }
      .mr-spinner-container { display: flex; justify-content: center; align-items: center; min-height: 200px; opacity: 0; animation: mrFadeIn 0.2s forwards; }
      .mr-spinner { width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-top: 4px solid currentColor; border-radius: 50%; animation: mrSpin 0.8s linear infinite; }
      @keyframes mrSpin { to { transform: rotate(360deg); } }
      @keyframes mrFadeIn { to { opacity: 1; } }
    `;
    document.head.appendChild(style);
  }

  scanRoutes() {
    const scriptTags = document.querySelectorAll('script[type="module"][path]');
    scriptTags.forEach(script => {
      const path = script.getAttribute('path');
      const src = script.getAttribute('src');
      let fbtitle = src.replace(/\.[^/.]+$/, "").replace(/^\/|\/$/g, "");
      fbtitle = fbtitle.charAt(0).toUpperCase() + fbtitle.slice(1);
      const title = script.getAttribute('title') || fbtitle;

      this.routes.push({
        path, src, title,
        regex: new RegExp(`^${path.replace(/:[^\s/]+/g, '([^\\/]+)')}$`)
      });
    });
    
    this.routes.sort((a, b) => {
      const aSeg = a.path.split('/').length;
      const bSeg = b.path.split('/').length;
      if (aSeg !== bSeg) return bSeg - aSeg;
      return a.path.includes(':') ? 1 : -1;
    });
  }

  renderView(content, title = 'Untitled') {
    if (!this.layout) {
      this.innerHTML = '';
      if (content instanceof HTMLElement) {
        this.appendChild(content);
      } else {
        this.innerHTML = content;
      }
      return;
    }

    this.innerHTML = this.layout.replace('{title}', title);

    const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
    let node;
    while(node = walker.nextNode()) {
      if (node.nodeValue.includes('{content}')) {
        const parent = node.parentNode;
        if (content instanceof HTMLElement) {
          parent.replaceChild(content, node);
        } else {
          const temp = document.createElement('div');
          temp.innerHTML = content;
          parent.replaceChild(temp.firstElementChild, node);
        }
        break;
      }
    }
  }

  async route() {
    const currentPath = window.location.pathname;
    const match = this.routes.find(r => r.regex.test(currentPath));

    this.dispatchEvent(new CustomEvent('router:navigation-start', { detail: { path: currentPath }, bubbles: true }));
    this.updateActiveLinks(currentPath);

    this.classList.add('mr-fade-out');
    await new Promise(r => setTimeout(r, 200));

    if (!match) {
      this.renderView('<h2>404 - Page Not Found</h2>', 'Not Found');
      this.classList.remove('mr-fade-out');
      this.dispatchEvent(new CustomEvent('router:navigation-end', { detail: { path: currentPath, status: 404 }, bubbles: true }));
      return;
    }

    this.renderView('<div class="mr-spinner-container"><div class="mr-spinner"></div></div>', match.title);
    this.classList.remove('mr-fade-out');

    const values = currentPath.match(match.regex).slice(1);
    const keys = (match.path.match(/:[^\s/]+/g) || []).map(k => k.substring(1));
    const params = Object.fromEntries(keys.map((key, i) => [key, values[i]]));

    let resolvedTitle = match.title;
    for (const key in params) {
      resolvedTitle = resolvedTitle.replace(`:${key}`, params[key]);
    }

    try {
      const module = await import(match.src);
      const content = typeof module.default === 'function' ? module.default(params) : '';

      this.classList.add('mr-fade-out');
      await new Promise(r => setTimeout(r, 200));

      this.renderView(content, resolvedTitle);

      document.title = resolvedTitle;

      this.classList.remove('mr-fade-out');

      this.dispatchEvent(new CustomEvent('router:navigation-end', { detail: { path: currentPath, status: 200, module: match.src }, bubbles: true }));
    } catch (error) {
      console.log("Error:", error);
      this.renderView('<h2>Failed to load page.</h2> ', 'Error');
      this.classList.remove('mr-fade-out');
      this.dispatchEvent(new CustomEvent('router:navigation-end', { detail: { path: currentPath, status: 500, error }, bubbles: true }));
    }
  }

  updateActiveLinks(path) {
    document.querySelectorAll('a').forEach(link => {
      try {
        const isMatch = new URL(link.href).pathname === path;
        link.classList.toggle('active', isMatch);
        isMatch ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
      } catch (e) {}
    });
  }
}

customElements.define('module-router', ModuleRouter);
