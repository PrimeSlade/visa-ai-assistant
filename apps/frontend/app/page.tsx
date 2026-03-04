const apiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Visa AI Assistant</p>
        <h1>Next.js frontend connected to an Express TypeScript backend.</h1>
        <p className="lede">
          This project is scaffolded as a small workspace so you can build the UI
          and API independently without changing the overall structure later.
        </p>

        <div className="actions">
          <a className="primary" href={apiUrl} target="_blank" rel="noreferrer">
            Open backend
          </a>
          <a className="secondary" href={`${apiUrl}/api/health`} target="_blank" rel="noreferrer">
            Health check
          </a>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <span className="label">Frontend</span>
          <h2>App Router</h2>
          <p>
            Files live in <code>apps/frontend/app</code>. Global styles are in{" "}
            <code>app/globals.css</code>.
          </p>
        </article>

        <article className="card">
          <span className="label">Backend</span>
          <h2>Express API</h2>
          <p>
            The backend exposes <code>/api/health</code> and uses CORS so the
            frontend can call it during development.
          </p>
        </article>

        <article className="card">
          <span className="label">Environment</span>
          <h2>Configurable API URL</h2>
          <p>
            Set <code>NEXT_PUBLIC_API_URL</code> in the frontend env file when
            your backend runs on a different host or port.
          </p>
        </article>
      </section>
    </main>
  );
}
