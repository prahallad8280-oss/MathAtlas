import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import type { SearchResult } from "../types";
import { fallbackSearchResults } from "../lib/fallbackData";

function getFallbackSearchPreview(q: string) {
  return q
    ? fallbackSearchResults.filter((result) =>
        `${result.title} ${result.type} ${result.excerpt}`.toLowerCase().includes(q.toLowerCase()),
      )
    : [];
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<SearchResult[]>(() => getFallbackSearchPreview(q));
  const [isLoadingLiveContent, setIsLoadingLiveContent] = useState(Boolean(q));

  useEffect(() => {
    async function loadResults() {
      if (!q) {
        setResults([]);
        setIsLoadingLiveContent(false);
        return;
      }

      const fallbackPreview = getFallbackSearchPreview(q);

      try {
        setResults(fallbackPreview);
        setIsLoadingLiveContent(true);
        const payload = await apiRequest<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`);
        setResults(payload.results);
      } catch (loadError) {
        console.warn("Using fallback search results", loadError);
        setResults(fallbackPreview);
      } finally {
        setIsLoadingLiveContent(false);
      }
    }

    void loadResults();
  }, [q]);

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
