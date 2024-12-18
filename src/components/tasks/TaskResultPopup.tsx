import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, PlayCircle, Image as ImageIcon, FileText, X, Download, Save, Upload } from 'lucide-react';
import { TaskResult } from './TasksPanel';
import { uploadFileToS3 } from '../../services/s3Service';

interface TaskResultPopupProps {
  result: TaskResult;
  onClose: () => void;
  editable?: boolean;
  onSave?: (updatedResult: TaskResult) => void;
}

const TaskResultPopup: React.FC<TaskResultPopupProps> = ({ result, onClose, editable = false, onSave }) => {
  const [activeMediaType, setActiveMediaType] = useState<'videos' | 'images' | 'documents'>('videos');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [editedResult, setEditedResult] = useState<TaskResult>(result);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaTypes = [
    { type: 'videos', urls: editedResult.videos_url, icon: <PlayCircle size={16} />, label: 'Videos', accept: 'video/*' },
    { type: 'images', urls: editedResult.images_url, icon: <ImageIcon size={16} />, label: 'Images', accept: 'image/*' },
    { type: 'documents', urls: editedResult.documents_url, icon: <FileText size={16} />, label: 'Documents', accept: '.pdf,.doc,.docx,.txt' }
  ] as const;

  // Set initial active media type to first non-empty type
  useEffect(() => {
    if (!editable) {
      const firstNonEmptyType = mediaTypes.find(({ urls }) => urls.length > 0);
      if (firstNonEmptyType) {
        setActiveMediaType(firstNonEmptyType.type);
      }
    }
  }, [editable, result]);

  // Close if clicking outside the popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveChanges = () => {
    onSave?.(editedResult);
  };

  const handleUrlChange = (type: 'videos' | 'images' | 'documents', index: number, newUrl: string) => {
    setEditedResult(prev => {
      const urls = [...prev[`${type}_url`]];
      urls[index] = newUrl;
      return {
        ...prev,
        [`${type}_url`]: urls
      };
    });
  };

  const handleAddUrl = (type: 'videos' | 'images' | 'documents') => {
    setEditedResult(prev => ({
      ...prev,
      [`${type}_url`]: [...prev[`${type}_url`], '']
    }));
  };

  const handleRemoveUrl = (type: 'videos' | 'images' | 'documents', index: number) => {
    setEditedResult(prev => ({
      ...prev,
      [`${type}_url`]: prev[`${type}_url`].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadFileToS3(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setEditedResult(prev => ({
        ...prev,
        [`${activeMediaType}_url`]: [...prev[`${activeMediaType}_url`], ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
      // You might want to add a toast notification here
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl w-[70%] max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div className="flex-1 mr-8">
            {editable ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedResult.title}
                  onChange={(e) => setEditedResult(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-2xl font-semibold bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  value={editedResult.body}
                  onChange={(e) => setEditedResult(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full h-24 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
                <div>
                  <label className="block text-sm text-gray-400 mb-1">CTA URL</label>
                  <input
                    type="text"
                    value={editedResult.cta}
                    onChange={(e) => setEditedResult(prev => ({ ...prev, cta: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-2">{result.title}</h2>
                <p className="text-gray-300">{result.body}</p>
              </>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {editable && (
              <button 
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Save size={20} />
                <span>Save</span>
              </button>
            )}
            {result.cta && !editable && (
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
            {mediaTypes
              .filter(({ urls }) => editable || urls.length > 0)
              .map(({ type, icon, label, urls }) => (
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
          {mediaTypes.map(({ type, urls, accept }) => type === activeMediaType && (
            <div key={type} className="space-y-4">
              {editable && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAddUrl(type)}
                    className="flex-1 px-4 py-2 rounded-lg border border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    Add {type.slice(0, -1)} URL
                  </button>
                  <button
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={20} />
                    <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                {urls.map((url, index) => (
                  <div key={index} className="relative group">
                    {editable ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => handleUrlChange(type, index, e.target.value)}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleRemoveUrl(type, index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskResultPopup; 