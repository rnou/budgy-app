import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-600 text-center">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;