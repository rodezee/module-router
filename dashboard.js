export default function(params) {
  const username = params.user || 'User';
  const container = document.createElement('div');
  
  container.innerHTML = `
    <style>
      .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .counter-display { font-size: 2rem; display: block; margin: 10px; }
    </style>
    <article>
      <h2>Welcome, ${username}</h2>
      <div class="dash-grid">
        <article>
          <header>Counter</header>
          <span class="counter-display" id="count">0</span>
          <footer>
            <button id="add">Plus</button>
          </footer>
        </article>
        <article>
          <header>Status</header>
          <div id="status">Connecting...</div>
        </article>
      </div>
    </article>
  `;

  // Attach logic to the LIVE nodes
  const btn = container.querySelector('#add');
  const display = container.querySelector('#count');
  const status = container.querySelector('#status');
  let val = 0;

  btn.onclick = () => {
    val++;
    display.innerText = val;
  };

  setTimeout(() => {
    if(status) status.innerHTML = "✅ Online";
  }, 1500);

  return container;
}
