import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TurndownService from "turndown";
import { useRef } from "react";
import { SuperButton } from "./SuperButton";

interface MarkdownerProps {
  markdown: string;
  allowEdit?: boolean;
  className?: string;
  onSave?: (newSentence: string) => Promise<void>;
  onCancel?: () => void;
}

export const Markdowner = ({
  markdown,
  allowEdit = false,
  className = "",
  onSave = async () => {},
  onCancel = () => {},
}: MarkdownerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFinish = async () => {
    if (containerRef.current) {
      const html = containerRef.current.innerHTML;
      const turndownService = new TurndownService();
      const markdown = turndownService.turndown(html);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await onSave(markdown);
    }
  };

  return (
    <div className={className}>
      {/* Editor */}
      <div ref={containerRef} className="markdown-container">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p contentEditable={allowEdit} {...props} />
            ),
            h1: ({ node, ...props }) => (
              <h1 contentEditable={allowEdit} {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 contentEditable={allowEdit} {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 contentEditable={allowEdit} {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 contentEditable={allowEdit} {...props} />
            ),
            h5: ({ node, ...props }) => (
              <h5 contentEditable={allowEdit} {...props} />
            ),
            h6: ({ node, ...props }) => (
              <h6 contentEditable={allowEdit} {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul contentEditable={allowEdit} {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol contentEditable={allowEdit} {...props} />
            ),
            li: ({ node, ...props }) => (
              <li contentEditable={allowEdit} {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote contentEditable={allowEdit} {...props} />
            ),
            code: ({ node, ...props }) => (
              <code contentEditable={allowEdit} {...props} />
            ),
          }}
        >
          {markdown}
        </Markdown>
      </div>

      {allowEdit && (
        <div className="flex gap-2 items-center justify-center">
          <SuperButton className="button-pj mt-2" onClick={handleFinish}>
            Finalizar edición
          </SuperButton>
          <SuperButton
            className="bg-gray-200 text-black mt-2 px-4 py-2 rounded border border-gray-300 cursor-pointer"
            onClick={onCancel}
          >
            Cancelar
          </SuperButton>
        </div>
      )}
    </div>
  );
};
