import React from 'react';
import { Message, Role } from '../types';
import { ThinkChatIcon } from './icons/ThinkChatIcon';
import { UserIcon } from './icons/UserIcon';
import { StudentIcon } from './icons/StudentIcon';
import { SellerIcon } from './icons/SellerIcon';
import { DeveloperIcon } from './icons/DeveloperIcon';

interface ChatMessageProps {
  message: Message;
  profession: string | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, profession }) => {
  const isModel = message.role === Role.MODEL;

  const renderFormattedContent = (content: string) => {
    // Convert markdown-like lists and bold text to HTML
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(\r\n|\n|\r)/g, '<br />')
      .replace(/\* (.*?)(<br \/>)/g, '<li>$1</li>')
      .replace(/<\/li><li>/g, '</li><li>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
      .replace(/<\/ul><br \/><ul>/g, '');

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  const UserAvatar: React.FC = () => {
    const iconProps = { className: "w-10 h-10 p-2 bg-gray-700 rounded-full text-gray-400" };
    switch (profession) {
        case 'student': return <StudentIcon {...iconProps} />;
        case 'seller': return <SellerIcon {...iconProps} />;
        case 'developer': return <DeveloperIcon {...iconProps} />;
        default: return <UserIcon {...iconProps} />;
    }
  }

  return (
    <div className={`flex items-end space-x-3 ${!isModel ? 'justify-end' : 'justify-start'}`}>
      {isModel && (
        <div className="flex-shrink-0">
          <ThinkChatIcon className="w-10 h-10 p-2 bg-gray-700 rounded-full text-cyan-400" />
        </div>
      )}
      <div
        className={`p-3 rounded-lg max-w-lg ${
          isModel ? 'bg-gray-800 text-gray-200' : 'bg-cyan-700 text-white'
        }`}
      >
        <div className="prose prose-invert prose-sm leading-relaxed">
            {message.imageUrl ? (
                <div className="mt-2">
                    <p className="text-sm text-gray-400 italic mb-2">"{message.prompt}"</p>
                    <img src={message.imageUrl} alt={message.prompt} className="rounded-lg max-w-full h-auto" />
                    <a
                        href={message.imageUrl}
                        download="thinkchat-generated-image.png"
                        className="mt-2 inline-block bg-cyan-600 text-white text-xs px-3 py-1 rounded-md hover:bg-cyan-500 transition-colors"
                    >
                        Download Image
                    </a>
                </div>
            ) : (
                renderFormattedContent(message.content)
            )}
        </div>
      </div>
       {!isModel && (
        <div className="flex-shrink-0">
          <UserAvatar />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
