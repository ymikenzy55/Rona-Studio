import { useState, useRef } from 'react';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImagePickerProps {
  value?: string;
  onChange: (file: File | null, preview: string | null) => void;
  label?: string;
  aspectRatio?: string;
  maxSizeMB?: number;
  allowCamera?: boolean;
}

export const ImagePicker = ({
  value,
  onChange,
  label = 'Upload Image',
  aspectRatio = '16/9',
  maxSizeMB = 10,
  allowCamera = true,
}: ImagePickerProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onChange(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-bold text-primary-dark">
          {label}
        </label>
      )}

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div
              className="relative w-full rounded-lg overflow-hidden border-2 border-gray-200"
              style={{ aspectRatio }}
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                            transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  title="Change image"
                >
                  <Upload size={20} className="text-primary-dark" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-3 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            {/* Upload from files */}
            <label
              className="flex flex-col items-center justify-center w-full border-2 
                       border-dashed border-gray-300 rounded-lg cursor-pointer 
                       hover:border-primary-yellow hover:bg-gray-50 transition-all group"
              style={{ aspectRatio }}
            >
              <div className="flex flex-col items-center justify-center py-6">
                <Upload size={40} className="text-gray-400 group-hover:text-primary-yellow 
                                           transition-colors mb-3" />
                <span className="text-sm font-semibold text-gray-600 group-hover:text-primary-dark 
                               transition-colors mb-1">
                  Click to upload from files
                </span>
                <span className="text-xs text-gray-400">
                  PNG, JPG, WEBP up to {maxSizeMB}MB
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Camera capture (mobile) */}
            {allowCamera && (
              <label
                className="flex items-center justify-center gap-3 w-full p-4 border-2 
                         border-gray-300 rounded-lg cursor-pointer hover:border-primary-yellow 
                         hover:bg-gray-50 transition-all group"
              >
                <Camera size={24} className="text-gray-400 group-hover:text-primary-yellow 
                                           transition-colors" />
                <span className="text-sm font-semibold text-gray-600 group-hover:text-primary-dark 
                               transition-colors">
                  Take a photo
                </span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm flex items-center gap-2"
        >
          <AlertTriangle size={16} />
          {error}
        </motion.p>
      )}

      {/* Helper text */}
      {!error && !preview && (
        <p className="text-xs text-gray-500">
          💡 Tip: For best results, use high-resolution images with {aspectRatio} aspect ratio
        </p>
      )}
    </div>
  );
};

// Import AlertTriangle
import { AlertTriangle } from 'lucide-react';
