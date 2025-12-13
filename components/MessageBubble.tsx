
import { memo, useState, Fragment, FC } from 'react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

// Code Block Renderer
const CodeBlock: FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e] shadow-lg group">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 lowercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition opacity-60 group-hover:opacity-100"
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
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-200 leading-relaxed scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Multimedia / Text Renderer
const TextWithMedia: FC<{ text: string }> = ({ text }) => {
    // Regex to match Markdown Images: ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(text)) !== null) {
        // Text before the image
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        // The image
        parts.push({ type: 'image', alt: match[1], src: match[2] });
        lastIndex = imageRegex.lastIndex;
    }
    // Remaining text
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return (
        <>
            {parts.map((part, i) => {
                if (part.type === 'image') {
                    return (
                        <div key={i} className="my-3">
                            <img 
                                src={part.src} 
                                alt={part.alt} 
                                className="rounded-lg max-h-96 border border-gray-700 shadow-md object-contain bg-black/20"
                                loading="lazy"
                            />
                        </div>
                    );
                }
                
                return (
                    <span key={i} className="whitespace-pre-wrap break-words">
                        {part.content?.split('\n').map((line, j) => {
                           if (line.trim().startsWith('<audio') && line.includes('src=')) {
                               const srcMatch = line.match(/src="([^"]+)"/);
                               if (srcMatch) return <audio key={j} controls src={srcMatch[1]} className="my-2 w-full" />;
                           }
                           if (line.trim().startsWith('<video') && line.includes('src=')) {
                               const srcMatch = line.match(/src="([^"]+)"/);
                               if (srcMatch) return <video key={j} controls src={srcMatch[1]} className="my-2 w-full max-h-80 rounded" />;
                           }
                           return <Fragment key={j}>{line}{j < part.content!.split('\n').length - 1 && '\n'}</Fragment>;
                        })}
                    </span>
                );
            })}
        </>
    );
};


const ContentRenderer: FC<{ content: string }> = ({ content }) => {
  // 1. Split by Code Blocks
  const parts = content.split(/```(\w*)\n([\s\S]*?)```/g);

  return (
    <div className="prose prose-invert max-w-none text-base leading-7">
      {parts.map((part, index) => {
        if (index % 3 === 0) {
            // Normal Text (potentially containing media)
            if (!part.trim()) return null;
            return (
                <div key={index} className="mb-2">
                    <TextWithMedia text={part} />
                </div>
            )
        }
        
        if (index % 3 === 1) return null; // Language identifier, skipped

        // Code block
        const language = parts[index - 1];
        return <CodeBlock key={index} language={language} code={part} />;
      })}
    </div>
  );
};

const MessageBubble: FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.User;
  const hasAttachments = message.attachments && message.attachments.length > 0;
  
  // Filter for images to display in bubble
  const images = message.attachments?.filter(a => a.type === 'image') || [];
  const files = message.attachments?.filter(a => a.type === 'file') || [];

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-4xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          {isUser ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`text-xs text-gray-500 mb-1`}>
                {isUser ? 'You' : message.role === Role.System ? 'System' : 'Assistant'}
            </div>
            
            <div className="flex flex-col gap-2">
                {/* User Attachments (Images) */}
                {hasAttachments && images.length > 0 && (
                     <div className={`flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                         {images.map((img, i) => (
                             <img 
                                key={i} 
                                src={img.content} 
                                alt={img.name}
                                className="h-32 rounded-lg border border-gray-700 object-cover hover:opacity-90 transition cursor-pointer"
                                onClick={() => window.open(img.content, '_blank')}
                             />
                         ))}
                     </div>
                )}
                 {/* User Attachments (Files indicator) */}
                {hasAttachments && files.length > 0 && (
                     <div className={`flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                         {files.map((f, i) => (
                             <div key={i} className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs text-gray-300">
                                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                 {f.name}
                             </div>
                         ))}
                     </div>
                )}

                {/* Main Text Content */}
                {message.content && (
                    <div className={`inline-block w-full text-left rounded-2xl p-4 ${
                        isUser 
                        ? 'bg-indigo-600/20 border border-indigo-500/30 rounded-tr-none' 
                        : 'bg-gray-800 border border-gray-700 rounded-tl-none'
                    }`}>
                        <ContentRenderer content={message.content} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);

