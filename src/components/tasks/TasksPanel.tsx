import React, { useState } from 'react';
import { ExternalLink, PlayCircle, Image as ImageIcon, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import TaskResultPopup from './TaskResultPopup';

interface TaskResult {
  id: string;
  title: string;
  body: string;
  images_url: string[];
  videos_url: string[];
  documents_url: string[];
  cta: string;
}

interface Task {
  id: string;
  type: string;
  status: 'completed' | 'processing';
  args: Record<string, any>;
  results?: TaskResult[];
}

interface TasksPanelProps {
  tasks: Record<string, Task>;
}

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [expandedArgs, setExpandedArgs] = useState(false);
  const [showCompletedArgs, setShowCompletedArgs] = useState(false);

  const formatArgs = (args: Record<string, any>) => {
    const formatValue = (value: any) => {
      if (typeof value === 'string') {
        return value;
      }
      return JSON.stringify(value);
    };

    const formattedArgs = Object.entries(args).map(([key, value]) => (
      <div key={key} className="text-sm bg-gray-800 p-3 rounded-lg">
        <span className="text-blue-400 font-medium">{key}:</span>{' '}
        <span className={`text-gray-200 ${task.status === 'processing' && !expandedArgs ? "line-clamp-2" : ""}`}>
          {formatValue(value)}
        </span>
      </div>
    ));

    return (
      <div>
        {task.status === 'processing' && <h4 className="text-gray-400 font-medium mb-3">Inputs:</h4>}
        <div className="space-y-2">
          {formattedArgs}
        </div>
        {task.status === 'processing' && Object.keys(args).length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedArgs(!expandedArgs);
            }}
            className="text-sm text-blue-400 hover:text-blue-300 mt-2"
          >
            {expandedArgs ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    );
  };

  const ResultTile: React.FC<{ result: TaskResult }> = ({ result }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [activeMediaType, setActiveMediaType] = useState<'videos' | 'images' | 'documents'>('videos');
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const mediaTypes = [
      { type: 'videos', urls: result.videos_url, icon: <PlayCircle size={16} />, label: 'Videos' },
      { type: 'images', urls: result.images_url, icon: <ImageIcon size={16} />, label: 'Images' },
      { type: 'documents', urls: result.documents_url, icon: <FileText size={16} />, label: 'Documents' }
    ] as const;

    const handleNext = (e: React.MouseEvent, urls: string[]) => {
      e.stopPropagation();
      setCurrentMediaIndex(prev => (prev + 1) % urls.length);
    };

    const handlePrev = (e: React.MouseEvent, urls: string[]) => {
      e.stopPropagation();
      setCurrentMediaIndex(prev => (prev - 1 + urls.length) % urls.length);
    };

    return (
      <>
        {/* Original Result Tile */}
        <div 
          className="bg-gray-800 rounded-lg p-4 cursor-pointer"
          onClick={() => setShowPopup(true)}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-lg line-clamp-2 flex-1 mr-4">{result.title}</h4>
            {result.cta && (
              <a 
                href={result.cta}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 flex-shrink-0"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={16} />
                <span>Open</span>
              </a>
            )}
          </div>
          
          <p className="text-gray-300 mb-4 line-clamp-3">{result.body}</p>

          {/* Media Tabs */}
          <div className="flex gap-4 mb-4 border-b border-gray-700">
            {mediaTypes.map(({ type, icon, label, urls }) => urls.length > 0 && (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaType(type);
                  setCurrentMediaIndex(0);
                }}
                className={`flex items-center gap-2 pb-2 px-1 text-sm transition-colors ${
                  activeMediaType === type 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Media Carousel */}
          {mediaTypes.map(({ type, urls }) => type === activeMediaType && urls.length > 0 && (
            <div key={type} className="relative group">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <a
                  href={urls[currentMediaIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="block w-full h-full"
                >
                  {type === 'videos' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <PlayCircle size={40} className="text-gray-400" />
                    </div>
                  ) : (
                    <img 
                      src={urls[currentMediaIndex]} 
                      alt="" 
                      className="w-full h-full object-contain" 
                    />
                  )}
                </a>

                {/* Download Button */}
                <a
                  href={urls[currentMediaIndex]}
                  download
                  className="absolute top-2 right-2 p-2 rounded-lg bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={20} />
                </a>

                {/* Navigation Arrows */}
                {urls.length > 1 && (
                  <>
                    <button
                      onClick={(e) => handlePrev(e, urls)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleNext(e, urls)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Progress Indicator */}
              {urls.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {urls.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMediaIndex(index);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        index === currentMediaIndex 
                          ? 'bg-blue-400 w-3' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Popup View */}
        {showPopup && (
          <TaskResultPopup 
            result={result} 
            onClose={() => setShowPopup(false)} 
          />
        )}
      </>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        {task.status === 'processing' ? (
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-medium text-lg">Processing</h3>
              <p className="text-sm text-gray-400">{task.type}</p>
              <p className="text-xs text-gray-500">ID: {task.id}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle size={24} />
            <div>
              <h3 className="font-medium text-lg">Completed</h3>
              <p className="text-sm text-gray-400">{task.type}</p>
              <p className="text-xs text-gray-500">ID: {task.id}</p>
            </div>
          </div>
        )}
      </div>

      {task.status === 'completed' ? (
        <>
          {!showCompletedArgs ? (
            <button
              onClick={() => setShowCompletedArgs(true)}
              className="text-sm text-blue-400 hover:text-blue-300 mb-4"
            >
              Show inputs
            </button>
          ) : (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-gray-400 font-medium">Inputs:</h4>
                <button
                  onClick={() => setShowCompletedArgs(false)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Hide inputs
                </button>
              </div>
              {formatArgs(task.args)}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2 mb-4">
          {formatArgs(task.args)}
        </div>
      )}

      {task.results && (
        <div className="space-y-4">
          {task.results.map(result => (
            <ResultTile key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
};

const TasksPanel = ({ tasks }: TasksPanelProps) => {
  return (
    <div className="w-[32rem] border-l border-gray-800 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold">Tasks</h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800/20 [&::-webkit-scrollbar-thumb]:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
        {Object.entries(tasks).map(([id, task]) => (
          <TaskCard key={id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TasksPanel; 