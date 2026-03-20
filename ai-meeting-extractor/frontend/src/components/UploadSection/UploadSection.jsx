import React, { useState, useRef, useCallback } from 'react'
import './UploadSection.css'

const SUPPORTED_FORMATS = [
  { ext: '.txt', label: 'Plain Text', icon: '📄' },
  { ext: '.docx', label: 'Word Doc', icon: '📝' },
  { ext: '.pdf', label: 'PDF', icon: '📕' },
  { ext: '.srt', label: 'SubRip', icon: '🎬' },
  { ext: '.vtt', label: 'WebVTT', icon: '🎥' },
]

const ACCEPTED = '.txt,.docx,.pdf,.srt,.vtt'

const UploadSection = ({ onExtract, loading }) => {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    const allowed = ['.txt', '.docx', '.pdf', '.srt', '.vtt']
    if (!allowed.includes(ext)) {
      return `Unsupported file type: ${ext}. Supported: ${allowed.join(', ')}`
    }
    if (f.size > 10 * 1024 * 1024) {
      return 'File too large. Max size is 10MB.'
    }
    return null
  }

  const handleFileChange = (f) => {
    setError('')
    const err = validateFile(f)
    if (err) { setError(err); setFile(null); return }
    setFile(f)
  }

  const handleInputChange = (e) => {
    if (e.target.files[0]) handleFileChange(e.target.files[0])
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileChange(f)
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const handleSubmit = () => {
    if (!file) { setError('Please select a file first.'); return }
    onExtract(file)
  }

  const handleRemove = () => { setFile(null); setError(''); inputRef.current.value = '' }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="upload-section animate-fade-up">
      <div className="upload-section__header">
        <h2 className="upload-section__title">Upload Meeting Transcript</h2>
        <p className="upload-section__desc">Drop your file below or click to browse</p>
      </div>

      <div
        className={`dropzone ${dragging ? 'dropzone--active' : ''} ${file ? 'dropzone--has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {!file ? (
          <div className="dropzone__idle">
            <div className="dropzone__icon">📂</div>
            <p className="dropzone__text">Drop file here or <span className="dropzone__link">browse</span></p>
            <p className="dropzone__hint">Max 10MB</p>
          </div>
        ) : (
          <div className="dropzone__file">
            <div className="dropzone__file-icon">{getFileIcon(file.name)}</div>
            <div className="dropzone__file-info">
              <span className="dropzone__file-name">{file.name}</span>
              <span className="dropzone__file-size">{formatSize(file.size)}</span>
            </div>
            <button
              className="dropzone__remove"
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              title="Remove file"
            >✕</button>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-section__error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="upload-section__formats">
        {SUPPORTED_FORMATS.map(f => (
          <div key={f.ext} className="format-badge">
            <span>{f.icon}</span>
            <span>{f.ext}</span>
          </div>
        ))}
      </div>

      <button
        className={`extract-btn ${loading ? 'extract-btn--loading' : ''}`}
        onClick={handleSubmit}
        disabled={!file || loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            <span>Extracting with AI...</span>
          </>
        ) : (
          <>
            <span>⚡</span>
            <span>Extract Tasks</span>
          </>
        )}
      </button>
    </div>
  )
}

const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase()
  const icons = { txt: '📄', docx: '📝', pdf: '📕', srt: '🎬', vtt: '🎥' }
  return icons[ext] || '📄'
}

export default UploadSection
