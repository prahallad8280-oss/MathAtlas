export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function stripWikiMarkup(value: string) {
  return value.replace(/\[\[([^[\]]+)\]\]/g, "$1").replace(/\s+/g, " ").trim();
}

export function excerpt(value: string, length = 180) {
  const normalized = stripWikiMarkup(value);
  return normalized.length > length ? `${normalized.slice(0, length)}...` : normalized;
}
