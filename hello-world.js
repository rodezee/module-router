// The router passes the matched params (like :name) to this default function
export default function(params) {
  const name = params.name || 'Stranger';
  return `
    <article>
      <h1>Hello, ${name}!</h1>
      <p>Welcome to the ModuleRouter.</p>
      <a href="/iam/module/router">Go to Iam</a>
      <a href="/about">Go to About</a>
    </article>
  `;
}
