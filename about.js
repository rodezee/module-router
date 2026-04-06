export default function() {
  return `
    <article>
      <h1>About This Project</h1>
      <p>It's a zero-build client-side router powered by Web Components.</p>

      <dialog open="true">
        <article>
          <header>
            <button onClick="document.querySelector('dialog').setAttribute('open', false)" aria-label="Close" class="outline contrast" style="float: right; border: none; padding: 0;">&times;</button>
            <h3>Confirm Action</h3>
          </header>
          <p>This is a modal with native HTML dialog tag!</p>
          <footer>
            <button class="secondary" onClick="document.querySelector('dialog').setAttribute('open', false)">Cancel</button>
            <button onClick="document.querySelector('dialog').setAttribute('open', false)">Confirm</button>
          </footer>
        </article>
      </dialog>
    
      <a href="/world">Go back Home</a>
    </article>
  `;
}
