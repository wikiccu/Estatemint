import Link from 'next/link';

export function SiteFooter() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const docsUrl = apiUrl
    ? `${apiUrl.replace(/\/api\/v1\/?$/, '')}/docs`
    : undefined;
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark" aria-hidden="true">
              E
            </span>
            <span>EstateMint</span>
          </Link>
          <p>A clear, considered way to discover your next address.</p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/properties">Browse properties</Link>
          <Link href="/register">Create an account</Link>
        </div>
        <div>
          <h2>Project</h2>
          {docsUrl ? (
            <a href={docsUrl} aria-label="EstateMint API documentation">
              API docs
            </a>
          ) : (
            <span>API documentation</span>
          )}
          <span>Open-source portfolio project</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} EstateMint</span>
        <span>Built for confident moves.</span>
      </div>
    </footer>
  );
}
