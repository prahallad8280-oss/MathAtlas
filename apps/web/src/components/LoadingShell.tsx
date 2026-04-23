export function HomeSectionShell() {
  return (
    <div className="page-stack shell-loading-home" aria-hidden="true">
      <section className="shell-loading-hero">
        <span className="shell-loading-badge" />
        <span className="shell-loading-title" />
        <span className="shell-loading-line wide" />
        <span className="shell-loading-line medium" />
        <div className="shell-loading-actions">
          <span className="shell-loading-button" />
          <span className="shell-loading-button ghost" />
        </div>
      </section>

      <section className="shell-loading-stats">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="shell-loading-stat-card" key={index}>
            <span className="shell-loading-icon" />
            <div className="shell-loading-copy">
              <span className="shell-loading-line short" />
              <span className="shell-loading-line tiny" />
            </div>
          </div>
        ))}
      </section>

      <section className="shell-loading-columns">
        {Array.from({ length: 3 }, (_, index) => (
          <article className="shell-loading-panel" key={index}>
            <span className="shell-loading-line short" />
            <span className="shell-loading-line wide" />
            <span className="shell-loading-line medium" />
            <span className="shell-loading-line medium" />
          </article>
        ))}
      </section>
    </div>
  );
}

export function ListPageShell() {
  return (
    <div className="page-stack shell-page-shell" aria-hidden="true">
      <section className="page-heading">
        <div className="shell-heading-block">
          <span className="shell-loading-badge" />
          <span className="shell-heading-title" />
        </div>
      </section>

      <section className="shell-filter-bar">
        {Array.from({ length: 4 }, (_, index) => (
          <span className="shell-filter-chip" key={index} />
        ))}
      </section>

      <section className="stack-list">
        {Array.from({ length: 4 }, (_, index) => (
          <article className="shell-list-card" key={index}>
            <div className="shell-list-meta">
              <span className="shell-loading-line short" />
              <span className="shell-loading-line tiny" />
            </div>
            <span className="shell-loading-line wide" />
            <span className="shell-loading-line medium" />
            <span className="shell-loading-line medium" />
          </article>
        ))}
      </section>
    </div>
  );
}

export function DetailPageShell() {
  return (
    <div className="page-stack shell-page-shell" aria-hidden="true">
      <div className="button-row">
        <span className="shell-loading-button ghost" />
        <span className="shell-loading-button ghost" />
      </div>

      <article className="detail-card shell-detail-card">
        <div className="content-meta-row">
          <span className="shell-loading-chip" />
          <span className="shell-loading-chip" />
        </div>
        <span className="shell-detail-title" />
        <div className="shell-rich-copy">
          <span className="shell-loading-line wide" />
          <span className="shell-loading-line wide" />
          <span className="shell-loading-line medium" />
          <span className="shell-loading-line medium" />
        </div>
        <div className="metadata shell-metadata-row">
          <span className="shell-loading-line short" />
          <span className="shell-loading-line short" />
          <span className="shell-loading-line short" />
        </div>
      </article>
    </div>
  );
}

export function AdminPageShell() {
  return (
    <div className="page-stack shell-page-shell" aria-hidden="true">
      <section className="admin-hero-card shell-admin-card">
        <div className="shell-heading-block">
          <span className="shell-loading-badge" />
          <span className="shell-heading-title wide" />
          <span className="shell-loading-line wide" />
          <span className="shell-loading-line medium" />
        </div>
        <div className="shell-loading-actions">
          <span className="shell-loading-button" />
          <span className="shell-loading-button ghost" />
        </div>
      </section>

      <section className="stats-grid">
        {Array.from({ length: 3 }, (_, index) => (
          <article className="stat-card shell-stat-block" key={index}>
            <span className="shell-loading-line short" />
            <span className="shell-stat-value" />
          </article>
        ))}
      </section>

      <section className="card-grid">
        {Array.from({ length: 3 }, (_, index) => (
          <article className="shell-list-card" key={index}>
            <span className="shell-loading-line short" />
            <span className="shell-loading-line medium" />
            <span className="shell-loading-line medium" />
          </article>
        ))}
      </section>
    </div>
  );
}

export function AdminStudioShell() {
  return (
    <div className="page-stack shell-page-shell" aria-hidden="true">
      <section className="page-heading">
        <div className="shell-heading-block">
          <span className="shell-loading-badge" />
          <span className="shell-heading-title wide" />
        </div>
      </section>

      <div className="tab-row">
        {Array.from({ length: 3 }, (_, index) => (
          <span className="shell-loading-button ghost" key={index} />
        ))}
      </div>

      <section className="studio-grid">
        <article className="detail-card shell-detail-card">
          <span className="shell-loading-line short" />
          <span className="shell-loading-line wide" />
          <span className="shell-loading-line wide" />
          <span className="shell-loading-line medium" />
          <span className="shell-loading-line medium" />
          <div className="button-row">
            <span className="shell-loading-button" />
            <span className="shell-loading-button ghost" />
          </div>
        </article>

        <article className="detail-card shell-detail-card">
          <span className="shell-loading-line short" />
          <div className="stack-list">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="shell-list-card" key={index}>
                <span className="shell-loading-line wide" />
                <span className="shell-loading-line medium" />
                <span className="shell-loading-line short" />
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export function AdminWorkspaceShell() {
  return (
    <div className="admin-shell" aria-hidden="true">
      <aside className="admin-sidebar">
        <div className="admin-brand-card shell-admin-sidebar-card">
          <span className="shell-loading-badge" />
          <span className="shell-heading-title" />
          <span className="shell-loading-line medium" />
          <span className="shell-loading-line short" />
        </div>

        <nav className="admin-nav">
          {Array.from({ length: 2 }, (_, index) => (
            <span className="admin-nav-link shell-admin-nav-link" key={index}>
              <span className="shell-loading-line short" />
            </span>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card shell-admin-sidebar-card">
            <span className="shell-loading-line short" />
            <span className="shell-loading-line tiny" />
            <span className="shell-loading-line medium" />
          </div>

          <span className="shell-loading-button ghost full-width" />
          <span className="shell-loading-line short" />
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="shell-heading-block">
            <span className="shell-loading-badge" />
            <span className="shell-heading-title wide" />
            <span className="shell-loading-line medium" />
          </div>

          <div className="shell-loading-actions">
            <span className="shell-loading-button ghost" />
            <span className="shell-loading-button" />
          </div>
        </header>

        <main className="admin-main-content">
          <AdminPageShell />
        </main>

        <footer className="admin-footer">
          <span className="shell-loading-line short" />
          <span className="shell-loading-line short" />
        </footer>
      </div>
    </div>
  );
}

export function InlineContentShell() {
  return (
    <div className="shell-inline-copy" aria-hidden="true">
      <span className="shell-loading-line wide" />
      <span className="shell-loading-line wide" />
      <span className="shell-loading-line medium" />
    </div>
  );
}

export function AuthGuardShell() {
  return (
    <div className="shell-auth-guard" aria-hidden="true">
      <div className="shell-auth-card">
        <span className="shell-loading-badge" />
        <span className="shell-heading-title" />
        <span className="shell-loading-line medium" />
      </div>
    </div>
  );
}
