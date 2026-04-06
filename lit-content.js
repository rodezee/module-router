// lit-content.js
import { html, render } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

let count = 0;

export default function(params) {

  const container = document.createElement('div');

  // A function to handle state updates
  const update = () => {
    render(template(), container);
  };

  const increment = () => {
    count++;
    update(); // Re-renders only the changed number!
  };

  // The declarative Lit template
  const template = () => html`
    <article>
      <h3>Hello from Lit-HTML!</h3>
      <p>This UI is powered by tagged template literals.</p>
      
      <div style="text-align: center; margin: 2rem 0;">
        <p>Current count:</p>
        <h1 style="font-size: 4rem; margin: 0.5rem;">${count}</h1>
        <button @click=${increment}>Press to Increment</button>
      </div>
    </article>
  `;

  // Do the initial render!
  update();
  
  return container;
}
