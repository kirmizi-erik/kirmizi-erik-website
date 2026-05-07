import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MarkdownProps = {
  children: string;
  className?: string;
};

/**
 * Lightweight prose-style markdown renderer.
 * Tailwind v4'te `prose` plugin yok — kendi tipografimizi yazıyoruz.
 */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("space-y-4 leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h2 className="font-heading mt-8 text-2xl font-bold tracking-tight" {...props} />
          ),
          h2: (props) => (
            <h2 className="font-heading mt-8 text-2xl font-bold tracking-tight" {...props} />
          ),
          h3: (props) => (
            <h3 className="font-heading mt-6 text-xl font-bold tracking-tight" {...props} />
          ),
          p: (props) => <p className="text-foreground/90 text-base leading-relaxed" {...props} />,
          a: (props) => (
            <a
              className="text-brand underline underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          ul: (props) => <ul className="ml-6 list-disc space-y-2" {...props} />,
          ol: (props) => <ol className="ml-6 list-decimal space-y-2" {...props} />,
          li: (props) => <li className="text-foreground/90" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-brand/60 text-muted-foreground border-l-2 pl-4 italic"
              {...props}
            />
          ),
          strong: (props) => <strong className="text-foreground font-semibold" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          code: (props) => (
            <code
              className="bg-muted/60 rounded px-1.5 py-0.5 font-mono text-[0.9em]"
              {...props}
            />
          ),
          pre: (props) => (
            <pre className="bg-muted/40 overflow-auto rounded-md p-4 text-sm" {...props} />
          ),
          hr: () => <hr className="border-border my-8" />,
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt ?? ""}
              className="rounded-lg"
              loading="lazy"
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
