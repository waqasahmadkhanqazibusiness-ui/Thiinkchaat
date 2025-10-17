import React, { useState, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { AttachmentIcon } from './icons/AttachmentIcon';
import FilePreview from './FilePreview';

interface ChatInputProps {
  onSendMessage: (message: string, files: File[]) => void;
  isLoading: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  mode: 'chat' | 'image' | 'summarize';
}

const MAX_FILES = 5;

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, files, onFilesChange, mode }) => {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholderText = {
      chat: 'Ask any question or add files',
      image: 'Describe the image you want to create...',
      summarize: 'Paste text or upload a document to summarize',
  }[mode];

  const areFilesAllowed = mode !== 'image';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      onFilesChange([...files, ...newFiles].slice(0, MAX_FILES));
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || files.length > 0) {
      onSendMessage(inputValue, files);
      setInputValue('');
      onFilesChange([]); // Clear files after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#2a3441] rounded-[18px] p-1.5 pr-2">
      {files.length > 0 && areFilesAllowed && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-gray-600">
            {files.map((file, index) => (
                <FilePreview key={`${file.name}-${index}`} file={file} onRemove={() => handleRemoveFile(index)} />
            ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full flex items-center space-x-2 h-10">
        <button
            type="button"
            onClick={triggerFileSelect}
            disabled={isLoading || files.length >= MAX_FILES || !areFilesAllowed}
            className="w-[30px] h-[30px] flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Add files"
        >
            <AttachmentIcon className="w-5 h-5" />
        </button>
        <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,.txt,.csv,.doc,.docx"
            disabled={!areFilesAllowed}
        />
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          rows={1}
          className="flex-1 bg-transparent text-gray-200 resize-none focus:outline-none placeholder-gray-400 disabled:opacity-50 text-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || (!inputValue.trim() && (files.length === 0 || !areFilesAllowed))}
          className="w-[30px] h-[30px] flex-shrink-0 flex items-center justify-center bg-cyan-600 text-white rounded-full hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#2a3441]"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;