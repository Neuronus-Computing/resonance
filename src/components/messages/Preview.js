import React from 'react';

const FilePreview = ({ preview, onRemove }) => {
  const { fileType, previewUrl, fileName } = preview;
  const handleRemove = () => {
    onRemove();
  };
  return (
    <div className="file-preview">
      {fileType === 'image' && <img src={previewUrl} alt={fileName} style={{ width: '60px', height: 'auto' }} />}
      {fileType === 'video' && (
        <video controls width="150">
          <source src={previewUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {fileType === 'document' && (
        <div>
          <i className="fa fa-file" /> {fileName}
        </div>
      )}
      {fileName && (
        <button onClick={handleRemove} style={{ color: 'red',    border: '0', marginLeft: '10px' }}>
          <i className="fa fa-trash" style={{ color: 'red', fontSize: '17px' }} />
        </button>
      )}
    </div>
  );
};

export default FilePreview;
