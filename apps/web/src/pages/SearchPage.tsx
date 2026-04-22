import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { ListPageShell } from "../components/LoadingShell";
import type { SearchResult } from "../types";
import { fallbackSearchResults } from "../lib/fallbackData";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const q = searchParams.get("q") ?? "";

  useEffect(() => {
    async function loadResults() {
      if (!q) {
        setResults([]);
        setIsUsingFallback(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const payload = await apiRequest<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`);
        setResults(payload.results);
        setIsUsingFallback(false);
      } catch (loadError) {
        console.warn("Using fallback search results", loadError);
        setResults(
          fallbackSearchResults.filter((result) =>
            `${result.title} ${result.type} ${result.excerpt}`.toLowerCase().includes(q.toLowerCase()),
          ),
        );
        setIsUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    }

    void loadResults();
  }, [q]);

  if (q && isLoading && results.length === 0) {
    return <ListPageShell />;
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Search</div>
          <h2>Search across questions, theory pages, solutions, and counterexamples.</h2>
        </div>
      </section>

      <section className="filter-bar">
        <input
          value={q}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value) next.set("q", event.target.value);
            else next.delete("q");
            setSearchParams(next);
          }}
          placeholder="Enter a theorem name, subject, or keyword"
        />
      </section>

      {isUsingFallback ? (
        <div className="home-fallback-note">Live API search is temporarily unavailable. Showing preview results.</div>
      ) : null}
      {!q ? <div className="empty-state">Type into the search bar to begin exploring the atlas.</div> : null}

      <section className="stack-list">
        {results.map((result) => (
          <Link key={`${result.type}-${result.href}`} className="content-card link-card" to={result.href}>
            <div className="content-meta-row">
              <span className="pill">{result.type}</span>
            </div>
            <h3>{result.title}</h3>
            <p>{result.excerpt}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
