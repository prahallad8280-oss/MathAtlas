const stripLatex = (value: string) =>
  value
    .replace(/\$+/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}^_]/g, " ");

export const slugify = (value: string) =>
  stripLatex(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
