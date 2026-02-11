import React, { useEffect, useState } from 'react';
import { Upload, FileText, Video, Image as ImageIcon, Download, Trash2, Eye, Search, Filter, User } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'image' | 'other';
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  category: string;
  stage?: string; // Which stage uploaded this: reception, opd, doctor
}

function Uploader({ patientRegistrationId, onUploaded }: { patientRegistrationId: string; onUploaded?: (saved: any[]) => void }) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Hidden mobile capture input (invokes native camera on mobile)
  const mobileCaptureRef = React.useRef<HTMLInputElement | null>(null);

  async function handleFiles(files: FileList | null) {
    setSelectedFiles(files);
    setMessage(null);
    if (!files || files.length === 0) return;

    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append('files', files[i]);
    }
    form.append('uploaded_by', 'receptionist');

    try {
      setUploading(true);
      const resp = await fetch(API_ENDPOINTS.PATIENT_DOCUMENTS(patientRegistrationId), {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) {
        const txt = await resp.text();
        setMessage(`Upload failed: ${resp.status} ${txt}`);
      } else {
        const body = await resp.json();
        setMessage(`Uploaded ${body.saved?.length || 0} files`);
        setSelectedFiles(null);
        if (onUploaded && body.saved) onUploaded(body.saved);
      }
    } catch (err: any) {
      setMessage(`Upload error: ${err?.message || String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  // Start device camera and show modal
  const openCamera = async () => {
    setMessage(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      // Show modal first, attach stream when video element is ready via effect
      setStream(s);
      setShowCamera(true);
    } catch (err: any) {
      setMessage(`Cannot access camera: ${err?.message || String(err)}`);
    }
  };

  const closeCamera = () => {
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // When modal is shown and stream is available, attach stream to video element and play
  React.useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = true; // mute so autoplay works in browsers
      vid.srcObject = stream;

      const tryPlay = () => {
        vid.play().catch(() => {
          // play may be blocked; ignore
        });
      };

      // If metadata is already available, try play immediately, otherwise wait
      if (vid.readyState >= 1) {
        tryPlay();
      } else {
        vid.onloadedmetadata = () => tryPlay();
      }

      return () => {
        try { vid.onloadedmetadata = null; } catch {}
      };
    }
  }, [showCamera, stream]);

  // Capture current video frame, convert to File, and upload
  const capturePhotoAndUpload = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMessage('Failed to capture image');
        return;
      }
      const timestamp = Date.now();
      const fileName = `camera-${timestamp}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      // Upload via existing flow
      const form = new FormData();
      form.append('files', file);
      form.append('uploaded_by', 'camera');

      try {
        setUploading(true);
        const resp = await fetch(API_ENDPOINTS.PATIENT_DOCUMENTS(patientRegistrationId), {
          method: 'POST',
          body: form,
        });
        if (!resp.ok) {
          const txt = await resp.text();
          setMessage(`Upload failed: ${resp.status} ${txt}`);
        } else {
          const body = await resp.json();
          setMessage(`Uploaded ${body.saved?.length || 0} files`);
          if (onUploaded && body.saved) onUploaded(body.saved);
          closeCamera();
        }
      } catch (err: any) {
        setMessage(`Upload error: ${err?.message || String(err)}`);
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.92);
  };

  // Handle mobile native camera capture via hidden input
  const handleMobileCapture = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await handleFiles(files);
  };

  return (
    <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-8 text-center hover:border-[#D4A574] transition-colors cursor-pointer">
      <Upload className="w-12 h-12 text-[#D4A574] mx-auto mb-4" />
      <h3 className="text-white mb-2">Upload Documents</h3>
      <p className="text-[#8B8B8B] mb-4">Drag and drop files here or click to browse</p>

      {/* Desktop/Mobile file input */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-3">
        <input
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="mx-auto mb-4"
        />

        {/* Hidden mobile capture input - triggers native camera on mobile */}
        <input
          ref={mobileCaptureRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => handleMobileCapture(e.target.files)}
        />

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-[#D4A574] text-[#0a0a0a] rounded-lg hover:bg-[#C9955E] transition-colors font-semibold"
            onClick={async () => await handleFiles(selectedFiles)}
            disabled={uploading || !selectedFiles}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>

          <button
            className="px-4 py-2 bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors font-semibold"
            onClick={() => mobileCaptureRef.current?.click()}
            title="Use mobile camera"
          >
            Use Camera
          </button>

          <button
            className="px-4 py-2 bg-[#111827] text-white border border-[#2a2a2a] rounded-lg hover:bg-[#222] transition-colors font-semibold"
            onClick={openCamera}
            title="Open camera (desktop)"
          >
            Open Camera
          </button>
        </div>
      </div>

      {message && <p className="text-[#8B8B8B] text-sm mt-3">{message}</p>}
      <p className="text-[#8B8B8B] text-xs mt-4">Supported: PDF, JPG, PNG, MP4, AVI (Max 500MB)</p>

      {/* Camera modal for desktop */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 w-[90%] max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white">Camera Capture</h4>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-red-600 rounded" onClick={closeCamera}>Close</button>
                <button className="px-3 py-1 bg-green-600 rounded" onClick={capturePhotoAndUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Capture & Upload'}</button>
              </div>
            </div>
            <div className="w-full h-[60vh] bg-black flex items-center justify-center rounded">
              <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DocumentsView({ patientRegistrationId }: { patientRegistrationId?: string | null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'video' | 'image'>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [patientName, setPatientName] = useState<string>('');

  useEffect(() => {
    // Fetch documents for the current patient when patientRegistrationId changes
    async function fetchDocs() {
      if (!patientRegistrationId || patientRegistrationId === 'Not Assigned') {
        setDocuments([]);
        setPatientName('');
        return;
      }
      setLoadingDocs(true);
      try {
        // Fetch patient info
        const patientResp = await fetch(API_ENDPOINTS.PATIENT(patientRegistrationId));
        if (patientResp.ok) {
          const patientData = await patientResp.json();
          setPatientName(patientData.name || '');
        }
        
        // Fetch documents
        const resp = await fetch(`http://localhost:8008/patients/${encodeURIComponent(patientRegistrationId)}/documents`);
        if (resp.ok) {
          const json = await resp.json();
          const docs = (json.documents || []).map((d: any) => ({
            id: d.id || d._id || `${d.name}-${Math.random()}`,
            name: d.name || 'unnamed',
            type: (d.type === 'mp4' || d.type === 'avi' || d.type === 'mov') ? 'video' : (d.type === 'pdf' ? 'pdf' : (d.type === 'png' || d.type === 'jpg' || d.type === 'jpeg' ? 'image' : 'other')),
            size: d.size ? `${(d.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown',
            uploadedDate: d.uploadedDate ? d.uploadedDate.split('T')[0] : '',
            uploadedBy: d.uploadedBy || '',
            category: d.category || '',
            stage: d.stage || d.uploadedBy || ''
          }));
          setDocuments(docs);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        setDocuments([]);
      } finally {
        setLoadingDocs(false);
      }
    }

    fetchDocs();
  }, [patientRegistrationId]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-green-400" />;
      default:
        return <FileText className="w-5 h-5 text-[#8B8B8B]" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getDownloadUrl = (doc: Document, inline = false) => {
    if (!patientRegistrationId) return '#';
    return API_ENDPOINTS.PATIENT_DOCUMENT_DOWNLOAD(patientRegistrationId, doc.id, inline);
  };

  const handlePreview = (doc: Document) => {
    if (!patientRegistrationId) return;
    const url = getDownloadUrl(doc, true);
    window.open(url, '_blank');
  };

  const handleDownload = async (doc: Document) => {
    if (!patientRegistrationId) return;
    try {
      const url = getDownloadUrl(doc, false);
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error('Download failed', resp.statusText);
        return;
      }
      const blob = await resp.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error', err);
    }
  };

  const stats = {
    total: documents.length,
    pdfs: documents.filter(d => d.type === 'pdf').length,
    videos: documents.filter(d => d.type === 'video').length,
    images: documents.filter(d => d.type === 'image').length
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-3xl mb-2">Document Manager</h1>
        <p className="text-[#B8B8B8]">Upload and manage patient documents, images, and videos</p>
        
        {/* Current Patient Info */}
        {patientRegistrationId && patientRegistrationId !== 'Not Assigned' ? (
          <div className="mt-4 flex items-center gap-3 bg-[#1a1a1a] border border-[#D4A574]/30 rounded-lg p-3">
            <User className="w-5 h-5 text-[#D4A574]" />
            <div>
              <p className="text-white font-semibold">{patientName || 'Loading...'}</p>
              <p className="text-[#D4A574] text-sm font-mono">{patientRegistrationId}</p>
            </div>
            <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              Ready for Upload
            </span>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 bg-[#1a1a1a] border border-yellow-500/30 rounded-lg p-3">
            <User className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-semibold">No Patient Selected</p>
              <p className="text-[#8B8B8B] text-sm">Select a patient from any queue to enable document uploads</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 shadow-lg shadow-[#D4A574]/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8B8B8B] text-xs mb-1">Total Documents</p>
              <p className="text-white text-2xl">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#D4A574] bg-opacity-20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#D4A574]" />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8B8B8B] text-xs mb-1">PDF Files</p>
              <p className="text-white text-2xl">{stats.pdfs}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-400 bg-opacity-20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8B8B8B] text-xs mb-1">Videos</p>
              <p className="text-white text-2xl">{stats.videos}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-400 bg-opacity-20 flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 shadow-lg shadow-green-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#8B8B8B] text-xs mb-1">Images</p>
              <p className="text-white text-2xl">{stats.images}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-400 bg-opacity-20 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-6 mb-6 shadow-lg shadow-[#D4A574]/10">
        {patientRegistrationId && patientRegistrationId !== 'Not Assigned' ? (
          <Uploader patientRegistrationId={patientRegistrationId} onUploaded={(saved) => {
            // when upload completes, re-fetch documents to show new files
            (async () => {
              try {
                const resp = await fetch(API_ENDPOINTS.PATIENT_DOCUMENTS(patientRegistrationId));
                if (resp.ok) {
                  const json = await resp.json();
                  const docs = (json.documents || []).map((d: any) => ({
                    id: d.id || d._id || `${d.name}-${Math.random()}`,
                    name: d.name || 'unnamed',
                    type: (d.type === 'mp4' || d.type === 'avi' || d.type === 'mov') ? 'video' : (d.type === 'pdf' ? 'pdf' : (d.type === 'png' || d.type === 'jpg' || d.type === 'jpeg' ? 'image' : 'other')),
                    size: d.size ? `${(d.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown',
                    uploadedDate: d.uploadedDate ? d.uploadedDate.split('T')[0] : '',
                    uploadedBy: d.uploadedBy || '',
                    category: d.category || ''
                  }));
                  setDocuments(docs);
                }
              } catch (err) {
                // ignore
              }
            })();
          }} />
        ) : (
          <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-[#D4A574] mx-auto mb-4" />
            <h3 className="text-white mb-2">Upload Documents</h3>
            <p className="text-[#8B8B8B] mb-4">Save patient details first to enable uploads for that patient.</p>
            <p className="text-[#8B8B8B] text-xs mt-4">Supported: PDF, JPG, PNG, MP4, AVI (Max 500MB)</p>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg p-4 mb-6 shadow-lg shadow-[#D4A574]/10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B8B8B]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-xs focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8B8B8B]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-xs focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all"
            >
              <option value="all">All Files</option>
              <option value="pdf">PDFs Only</option>
              <option value="video">Videos Only</option>
              <option value="image">Images Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-lg shadow-[#D4A574]/10">
        <div className="p-4 border-b border-[#2a2a2a]">
          <h3 className="text-white">Documents ({filteredDocuments.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#D4A574] bg-opacity-20">
                <th className="text-left p-3 text-[#0a0a0a] border-r border-[#2a2a2a] font-semibold">Type</th>
                <th className="text-left p-3 text-[#0a0a0a] border-r border-[#2a2a2a] font-semibold">Name</th>
                <th className="text-left p-3 text-[#0a0a0a] border-r border-[#2a2a2a] font-semibold">Category</th>
                <th className="text-left p-3 text-[#0a0a0a] border-r border-[#2a2a2a] font-semibold">Size</th>
                <th className="text-left p-3 text-[#0a0a0a] border-r border-[#2a2a2a] font-semibold">Uploaded</th>
                <th className="text-left p-3 text-[#0a0a0a] border-r border-[#2a2a2a] font-semibold">Uploaded By</th>
                <th className="text-center p-3 text-[#0a0a0a] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, index) => (
                <tr 
                  key={doc.id}
                  className={`border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors ${
                    index % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#121212]'
                  }`}
                >
                  <td className="p-3 border-r border-[#2a2a2a]">
                    <div className="flex items-center justify-center">
                      {getFileIcon(doc.type)}
                    </div>
                  </td>
                  <td className="p-3 border-r border-[#2a2a2a]">
                    <span className="text-white">{doc.name}</span>
                  </td>
                  <td className="p-3 border-r border-[#2a2a2a]">
                    <span className="text-[#B8B8B8]">{doc.category}</span>
                  </td>
                  <td className="p-3 border-r border-[#2a2a2a]">
                    <span className="text-[#B8B8B8]">{doc.size}</span>
                  </td>
                  <td className="p-3 border-r border-[#2a2a2a]">
                    <span className="text-[#B8B8B8]">{doc.uploadedDate}</span>
                  </td>
                  <td className="p-3 border-r border-[#2a2a2a]">
                    <span className="text-[#B8B8B8]">{doc.uploadedBy}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handlePreview(doc)} className="p-1.5 rounded hover:bg-[#D4A574] hover:bg-opacity-20 transition-colors group">
                        <Eye className="w-4 h-4 text-[#8B8B8B] group-hover:text-[#D4A574]" />
                      </button>
                      <button onClick={() => handleDownload(doc)} className="p-1.5 rounded hover:bg-blue-500 hover:bg-opacity-20 transition-colors group">
                        <Download className="w-4 h-4 text-[#8B8B8B] group-hover:text-blue-400" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors group">
                        <Trash2 className="w-4 h-4 text-[#8B8B8B] group-hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
