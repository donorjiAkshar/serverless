import React, { useState } from 'react';
import { uploadAPI } from '../api/upload.api';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadUrl('');
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await uploadAPI.uploadFile(file);
      setUploadUrl(response.url);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="section">
      <h3>File Upload to S3</h3>
      <div className="file-upload">
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label htmlFor="file-input">
          {file ? file.name : 'Choose File'}
        </label>
      </div>
      <button
        className="btn"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
      {error && <div className="error">{error}</div>}
      {uploadUrl && (
        <div className="success">
          File uploaded successfully! URL: <a href={uploadUrl} target="_blank" rel="noopener noreferrer">{uploadUrl}</a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
