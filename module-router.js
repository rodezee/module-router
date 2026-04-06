// module-router.js

class ModuleRouter extends HTMLElement {
  constructor() {
    super();
    this.routes = [];
  }

  connectedCallback() {
    this.injectStyles();
    this.scanRoutes();
    
    window.addEventListener('popstate', () => this.route());

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href.startsWith(window.location.origin)) {
        // Ignore links with a target like target="_blank"
        if (link.target && link.target !== '_self') return;
        
        e.preventDefault();
        window.history.pushState({}, '', link.href);
        this.route();
      }
    });

    this.route();
  }

  // 1. Injects pure CSS for transitions and framework-agnostic spinner
  injectStyles() {
    if (document.getElementById('mr-styles')) return;

    const style = document.createElement('style');
    style.id = 'mr-styles';
    style.innerHTML = `
      module-router {
        display: block;
        transition: opacity 0.2s ease-in-out;
        opacity: 1;
      }
      
      module-router.mr-fade-out {
        opacity: 0;
      }
      
      .mr-spinner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        opacity: 0;
        animation: mrFadeIn 0.2s forwards;
      }
      
      .mr-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top: 4px solid currentColor;
        border-radius: 50%;
        animation: mrSpin 0.8s linear infinite;
      }
      
      @keyframes mrSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes mrFadeIn {
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  scanRoutes() {
    const scriptTags = document.querySelectorAll('script[type="module"][path]');
    
    scriptTags.forEach(script => {
      const path = script.getAttribute('path');
      const src = script.getAttribute('src');
      
      this.routes.push({
        path: path,
        src: src,
        regex: new RegExp(`^${path.replace(/:[^\s/]+/g, '([^\\/]+)')}$`)
      });
    });

    this.routes.sort((a, b) => {
      const aSegments = a.path.split('/').length;
      const bSegments = b.path.split('/').length;
      if (aSegments !== bSegments) return bSegments - aSegments; 
      const aHasVar = a.path.includes(':');
      const bHasVar = b.path.includes(':');
      if (aHasVar !== bHasVar) return aHasVar ? 1 : -1;
      return 0;
    });
  }

  async route() {
    const currentPath = window.location.pathname;
    const match = this.routes.find(r => r.regex.test(currentPath));

    // Emit event that navigation has started
    this.dispatchEvent(new CustomEvent('router:navigation-start', {
      detail: { path: currentPath },
      bubbles: true
    }));

    // Handle active link highlights
    this.updateActiveLinks(currentPath);

    // 1. Fade Out
    this.classList.add('mr-fade-out');
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!match) {
      this.innerHTML = '<h2>404 - Page Not Found</h2>';
      this.classList.remove('mr-fade-out');
      
      this.dispatchEvent(new CustomEvent('router:navigation-end', {
        detail: { path: currentPath, status: 404 },
        bubbles: true
      }));
      return;
    }

    // 2. Show Loading Spinner
    this.innerHTML = `
      <div class="mr-spinner-container">
        <div class="mr-spinner"></div>
      </div>
    `;
    this.classList.remove('mr-fade-out');

    const values = currentPath.match(match.regex).slice(1);
    const keys = (match.path.match(/:[^\s/]+/g) || []).map(k => k.substring(1));
    const params = Object.fromEntries(keys.map((key, i) => [key, values[i]]));

    try {
      //await new Promise(resolve => setTimeout(resolve, 200)); // Smooth visual delay

      const module = await import(match.src);
      
      let content = '';
      if (typeof module.default === 'function') {
        content = module.default(params);
      }

      // 3. Fade Out Spinner
      this.classList.add('mr-fade-out');
      await new Promise(resolve => setTimeout(resolve, 200));

      // 4. Swap content & Fade In
      if (content instanceof HTMLElement) {
        this.innerHTML = '';
        this.appendChild(content);
      } else {
        this.innerHTML = content;
      }
      
      this.classList.remove('mr-fade-out');

      // Emit event that navigation has successfully completed
      this.dispatchEvent(new CustomEvent('router:navigation-end', {
        detail: { path: currentPath, status: 200, module: match.src },
        bubbles: true
      }));
      
    } catch (error) {
      console.error(`Failed to load module: ${match.src}`, error);
      this.innerHTML = '<h2>Failed to load page.</h2>';
      this.classList.remove('mr-fade-out');
      
      this.dispatchEvent(new CustomEvent('router:navigation-end', {
        detail: { path: currentPath, status: 500, error },
        bubbles: true
      }));
    }
  }

  // Helper to highlight active menu anchors
  updateActiveLinks(currentPath) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      try {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      } catch (e) {
        // Ignore invalid URLs or non-standard anchors
      }
    });
  }
}

customElements.define('module-router', ModuleRouter);
