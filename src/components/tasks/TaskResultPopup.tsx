import React, { useState } from 'react';
import { ExternalLink, PlayCircle, Image as ImageIcon, FileText, X, Download } from 'lucide-react';
import { TaskResult } from './TasksPanel';

interface TaskResultPopupProps {
  result: TaskResult;
  onClose: () => void;
}

const TaskResultPopup: React.FC<TaskResultPopupProps> = ({ result, onClose }) => {
  const [activeMediaType, setActiveMediaType] = useState<'videos' | 'images' | 'documents'>('videos');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const mediaTypes = [
    { type: 'videos', urls: result.videos_url, icon: <PlayCircle size={16} />, label: 'Videos' },
    { type: 'images', urls: result.images_url, icon: <ImageIcon size={16} />, label: 'Images' },
    { type: 'documents', urls: result.documents_url, icon: <FileText size={16} />, label: 'Documents' }
  ] as const;

  // Close if clicking outside the popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl w-[70%] max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div className="flex-1 mr-8">
            <h2 className="text-2xl font-semibold mb-2">{result.title}</h2>
            <p className="text-gray-300">{result.body}</p>
          </div>
          <div className="flex gap-4 items-center">
            {result.cta && (
              <a 
                href={result.cta}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <ExternalLink size={20} />
                <span>Open</span>
              </a>
            )}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Media Tabs */}
          <div className="flex gap-8 mb-8 border-b border-gray-700">
            {mediaTypes.map(({ type, icon, label, urls }) => urls.length > 0 && (
              <button
                key={type}
                onClick={() => {
                  setActiveMediaType(type);
                  setCurrentMediaIndex(0);
                }}
                className={`flex items-center gap-2 pb-4 px-2 text-base transition-colors ${
                  activeMediaType === type 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {React.cloneElement(icon, { size: 20 })}
                <span>{label}</span>
                <span className="text-sm text-gray-500">({urls.length})</span>
              </button>
            ))}
          </div>

          {/* Media Gallery Grid */}
          {mediaTypes.map(({ type, urls }) => type === activeMediaType && urls.length > 0 && (
            <div key={type} className="grid grid-cols-2 gap-6">
              {urls.map((url, index) => (
                <div key={url} className="relative group">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                  >
                    {type === 'videos' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <PlayCircle size={48} className="text-gray-400" />
                      </div>
                    ) : (
                      <img 
                        src={url} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </a>
                  <a
                    href={url}
                    download
                    className="absolute top-2 right-2 p-2 rounded-lg bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={20} />
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskResultPopup; 