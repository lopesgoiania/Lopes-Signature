import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

/** Legacy HTML and new Markdown share one sanitised, server-safe renderer. */
export function ArticleBody({ content }: { content: string }) {
  return (
    <Markdown
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1: ({ children }) => <h2>{children}</h2>,
        a: ({ href, children }) => (
          <a href={href} rel="noreferrer">
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img src={src} alt={alt || ""} loading="lazy" decoding="async" />
        ),
      }}
    >
      {content}
    </Markdown>
  );
}
