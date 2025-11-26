import React, { memo } from 'react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

// Simple helper to parse code blocks manually to avoid heavy dependencies
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 lowercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
        >
          {copied ? (
            <span className="text-green-400">Copied!</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Custom renderer that splits text by code blocks
const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/```(\w*)\n([\s\S]*?)```/g);

  return (
    <div className="prose prose-invert max-w-none text-base leading-7">
      {parts.map((part, index) => {
        // If index % 3 === 0, it's normal text
        // If index % 3 === 1, it's the language (captured group 1)
        // If index % 3 === 2, it's the code (captured group 2)
        
        if (index % 3 === 0) {
            // Render text with basic paragraph handling
            if (!part.trim()) return null;
            return (
                <div key={index} className="whitespace-pre-wrap mb-2">
                    {part}
                </div>
            )
        }
        
        // This is the language part, we skip rendering it directly, 
        // it will be used by the next iteration (the code part) theoretically, 
        // but our split logic structure means:
        // [text, lang, code, text, lang, code...]
        if (index % 3 === 1) return null;

        // Code block
        const language = parts[index - 1];
        return <CodeBlock key={index} language={language} code={part} />;
      })}
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.User;

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-4xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          {isUser ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`text-xs text-gray-500 mb-1`}>
                {isUser ? 'You' : 'Assistant'}
            </div>
            <div className={`inline-block w-full text-left rounded-2xl p-4 ${
                isUser 
                ? 'bg-blue-600/20 border border-blue-500/30 rounded-tr-none' 
                : 'bg-gray-800 border border-gray-700 rounded-tl-none'
            }`}>
                 <ContentRenderer content={message.content} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);
