import React from 'react';
import { FileIcon } from './icons/FileIcon';
import { CloseIcon } from './icons/CloseIcon';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="relative flex items-center bg-gray-700 p-2 rounded-lg max-w-[180px]">
      {isImage ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-8 h-8 rounded object-cover mr-2"
          onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
        />
      ) : (
        <FileIcon className="w-8 h-8 text-gray-400 mr-2 flex-shrink-0" />
      )}
      <div className="flex-1 truncate text-sm text-gray-300" title={file.name}>
        {file.name}
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gray-600 text-white rounded-full hover:bg-red-500 transition-colors"
        aria-label="Remove file"
      >
        <CloseIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

export default FilePreview;
