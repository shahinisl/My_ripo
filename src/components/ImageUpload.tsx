'use client';

import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: { type: 'file' | 'url', data: string }) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange, 
  className = '',
  size = 'medium' 
}: ImageUploadProps) {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert to base64 for local storage
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageChange({ type: 'file', data: result });
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setIsLoading(false);
      alert('Error processing file');
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setIsLoading(true);
    
    try {
      // Validate URL format
      const url = new URL(urlInput.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }

      // Test if the URL is accessible and is an image
      const img = new Image();
      img.onload = () => {
        setPreview(urlInput.trim());
        onImageChange({ type: 'url', data: urlInput.trim() });
        setIsLoading(false);
      };
      img.onerror = () => {
        alert('Unable to load image from URL. Please check the URL and try again.');
        setIsLoading(false);
      };
      img.src = urlInput.trim();
    } catch (error) {
      console.error('Invalid URL:', error);
      alert('Please enter a valid URL');
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageChange({ type: 'file', data: '' });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Preview */}
      <div className="flex items-center gap-4">
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300`}>
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                setPreview('');
                alert('Failed to load image');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setUploadType('file')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                uploadType === 'file' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadType('url')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                uploadType === 'url' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Use URL
            </button>
          </div>
          
          {preview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-red-500 text-sm hover:text-red-700 transition-colors"
            >
              Remove Image
            </button>
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="space-y-3">
        {uploadType === 'file' ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:cursor-pointer"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter image URL (https://...)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {isLoading ? 'Loading...' : 'Load'}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">Processing...</span>
        </div>
      )}

      {uploadType === 'url' && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Make sure the URL points directly to an image file</p>
          <p>• The image should be publicly accessible</p>
          <p>• Use https:// URLs for better security</p>
        </div>
      )}
    </div>
  );
}
