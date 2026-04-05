import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, Image } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onChange, required }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onChange(file);
    } else {
      setFileName(null);
      onChange(null);
    }
  };

  const isPdf = accept.includes('pdf');

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer">
          <input 
            type="file" 
            accept={accept} 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <div className={`border-2 border-dashed rounded-md p-3 flex items-center justify-center gap-2 transition-colors ${fileName ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
            {fileName ? (
              <CheckCircle className="text-green-600 w-5 h-5" />
            ) : (
               isPdf ? <FileText className="text-gray-400 w-5 h-5" /> : <Image className="text-gray-400 w-5 h-5" />
            )}
            <span className={`text-sm ${fileName ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
              {fileName || `Click to upload ${isPdf ? 'PDF' : 'Image'}`}
            </span>
          </div>
        </label>
      </div>
      <p className="text-xs text-gray-400 mt-1">Accepted: {accept}</p>
    </div>
  );
};

export default FileUpload;
