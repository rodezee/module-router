# 🧭 module-router

A tiny, zero-build, filesystem-inspired client-side router powered by native Web Components. Declare your routes directly in your HTML <head> and dynamically load standard JS modules, vanilla DOM elements, or framework templates like Lit.
## ✨ Features

    📦 Zero Build Required - No Webpack, Vite, or Babel. Just raw, beautiful modern JS.

    🏷️ HTML-First Routing - Declare paths and view titles directly on <script> tags.

    🎭 Smooth Transitions - Built-in 0.2s fade-out, loading spinner, and fade-in sequence.

    🧩 Layout Support - Define a global layout using standard <template> tags.

    💡 Agnostic Rendering - Supports returning Strings, Live DOM Nodes, and Lit-HTML templates.

    💬 Custom Events - Hooks for router:navigation-start and router:navigation-end.

# 🚀 Quick Start
1. Setup your HTML

```html
<!doctype html>

<html lang="en">
<head>
<title>My App</title>
<script type="module" src="https://esm.sh/gh/rodezee/module-router/module-router.js"></script>

<script type="module" src="/home.js" path="/" title="Home"></script>
<script type="module" src="/about.js" path="/about" title="About Us"></script>
<script type="module" src="/user.js" path="/user/:name" title="Profile of :name"></script>

</head>
<body>

<module-router>
  <template>
    <header>
      <nav>
        <ul><li><strong>{title}</strong></li></ul>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </header>
    
    <main>{content}</main>

    <footer>
      <small>Built with module-router</small>
    </footer>
  </template>
</module-router>

</body>
</html>
```
2. Create a Page Module

You can return a string, a DOM element, or a piece of Lit-HTML.

Using pure DOM Nodes (Perfect for state and events):
```javascript
export default function(params) {
const container = document.createElement('div');
container.innerHTML = <h1>Hello, ${params.name}!</h1>;

// Logic here stays attached to the node!
container.onclick = () => console.log("Clicked!");

return container;
}
```

### Using Lit-HTML:
```javascript
import { html, render } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export default function(params) {
const container = document.createElement('div');

const template = () => html<article> <h3>Look Ma, no build steps!</h3> <p>Current user: ${params.name}</p> </article>;

render(template(), container);
return container;
}
```
# 🔌 Events

You can listen for navigation events globally to handle analytics or page-specific logic:

```javascript
window.addEventListener('router:navigation-end', (e) => {
console.log('Successfully navigated to:', e.detail.path);
console.log('Status code:', e.detail.status);
});
```
