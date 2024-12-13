import React from 'react';
import { Brain } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 p-4 border-b border-gray-800">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
        <Brain className="w-6 h-6 text-white" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
        Hanu.ai
      </span>
    </div>
  );
};

export default Logo;