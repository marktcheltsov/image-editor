import React from "react";

interface FileUploaderProps {
  accept?: string;
  onFileChange: (file: File) => void;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = "image/*",
  onFileChange,
  className = "",
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <input
      type="file"
      accept={accept}
      onChange={handleInputChange}
      className={`p-2 border border-gray-300 rounded ${className}`}
    />
  );
};

export default FileUploader;
