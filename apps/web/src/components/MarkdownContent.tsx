import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Link } from "react-router-dom";
import { useKnowledge } from "../lib/knowledge";

function enrichWikiLinks(content: string, lookup: Record<string, { href: string }>) {
  return content.replace(/\[\[([^[\]]+)\]\]/g, (_match, rawTitle: string) => {
    const title = rawTitle.trim();
    const item = lookup[title];

    if (!item) {
      return `**${title}**`;
    }

    return `[${title}](${item.href})`;
  });
}

export function MarkdownContent({ content }: { content: string }) {
  const { lookup } = useKnowledge();
  const transformed = enrichWikiLinks(content, lookup);

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a({ href = "", children }) {
            if (href.startsWith("/")) {
              return <Link to={href}>{children}</Link>;
            }

            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {transformed}
      </ReactMarkdown>
    </div>
  );
}
