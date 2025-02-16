/* eslint-disable react/prop-types */
import ReactMarkDown from "react-markdown"
import remarkGfm from "remark-gfm"
export const Message = ({ m }) => {
    return (
        <div>
            <ReactMarkDown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: ({ node, inline, className, children, ...props }) => {
                        return inline ? (
                            <code {...props} className=" p-1 rounded bg-gray-800 text-white">
                                {children}
                            </code>
                        ) : (
                            <pre {...props} className=" p-2 rounded bg-gray-800 text-white">
                                <code>{children}</code>
                            </pre>
                        )
                    },
                    ul: ({ node, children, ...props }) => {
                        return (
                            <ul {...props} className="list-disc ml-4">
                                {children}
                            </ul>
                        )
                    },
                    ol: ({ node, children, ...props }) => {
                        return (
                            <ol {...props} className="list-decimal ml-4">
                                {children}
                            </ol>
                        )
                    },
                    li: ({ node, children, ...props }) => {
                        return (
                            <li {...props} className="mb-1">
                                {children}
                            </li>
                        )
                    },
                }}
            >
                {m.content}
            </ReactMarkDown>
        </div>
    )
}