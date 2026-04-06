// The router passes the matched params (like :name) to this default function
export default function(params) {
  const firstname = params.firstname || 'Stranger';
  const lastname = params.lastname || 'Nowhere';
  return `
    <article>
      <h1>You are, ${firstname} ${lastname}!</h1>
      <br>
      <a href="/world">Hello World</a>
      <br>
      <a href="/about">Go to About</a>
    </article>
  `;
}
