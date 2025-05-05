import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

interface MarkdownContentProps {
  content: string
  isCompact?: boolean
}

export function MarkdownContent({ content, isCompact = false }: MarkdownContentProps) {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        p: ({node, ...props}) => <p className={isCompact ? "mb-2" : "mb-4"} {...props} />,
        a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        h1: ({node, ...props}) => <h1 className={`font-bold ${isCompact ? "text-lg mb-2" : "text-2xl mb-4"}`} {...props} />,
        h2: ({node, ...props}) => <h2 className={`font-bold ${isCompact ? "text-base mb-2" : "text-xl mb-3"}`} {...props} />,
        h3: ({node, ...props}) => <h3 className={`font-bold ${isCompact ? "text-sm mb-1" : "text-lg mb-2"}`} {...props} />,
        ul: ({node, ...props}) => <ul className={`list-disc ${isCompact ? "pl-4 mb-2" : "pl-5 mb-4"}`} {...props} />,
        ol: ({node, ...props}) => <ol className={`list-decimal ${isCompact ? "pl-4 mb-2" : "pl-5 mb-4"}`} {...props} />,
        li: ({node, ...props}) => <li className="mb-1" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className={`italic ${isCompact ? "border-l-2 border-gray-300 pl-2 my-2" : "border-l-4 border-gray-200 pl-4 my-4"}`} {...props} />,
        code: ({inline, className, children, ...props}: any) => {
          return inline 
            ? <code className={`${isCompact ? "bg-gray-200 px-1 py-0.5 rounded text-xs" : "bg-gray-100 px-1 py-0.5 rounded"}`} {...props}>{children}</code>
            : <pre className={`overflow-x-auto ${isCompact ? "bg-gray-200 p-2 rounded text-xs" : "bg-gray-100 p-4 rounded"}`}><code {...props}>{children}</code></pre>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
} 