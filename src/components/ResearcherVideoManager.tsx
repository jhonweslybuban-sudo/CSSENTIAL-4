import React, { useState, useEffect } from 'react';
import {
  Film,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  FileVideo,
  ExternalLink,
  Sparkles,
  Trash2,
  FolderDown,
  Plus,
  Layers,
  HardDrive,
  Info,
  Check,
  Video,
  FileUp,
  Globe
} from 'lucide-react';
import { LESSONS_DATA } from '../data/curriculum';
import { api } from '../services/api';
import { CollectionVideo } from '../types';

function formatYouTubeEmbed(url: string): string {
  if (!url) return '';
  if (url.includes('youtube-nocookie.com/embed/') || url.includes('youtube.com/embed/')) {
    return url;
  }
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
}

export const ResearcherVideoManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'practicum_collection' | 'curriculum_topics'>('practicum_collection');

  // Practicum Collection Videos State
  const [collectionVideos, setCollectionVideos] = useState<CollectionVideo[]>([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<number | 'ALL'>('ALL');
  
  // Practicum Add Mode: 'upload_mp4' vs 'paste_link'
  const [practicumMode, setPracticumMode] = useState<'upload_mp4' | 'paste_link'>('upload_mp4');
  const [isSubmittingPracticum, setIsSubmittingPracticum] = useState(false);
  const [newPracticumTitle, setNewPracticumTitle] = useState('');
  const [newPracticumTopic, setNewPracticumTopic] = useState<number>(1);
  const [newPracticumDuration, setNewPracticumDuration] = useState('10:00');
  const [newPracticumInstructor, setNewPracticumInstructor] = useState('CSSENTIAL Faculty Lead');
  const [newPracticumDesc, setNewPracticumDesc] = useState('');
  const [newPracticumUrl, setNewPracticumUrl] = useState('');
  const [selectedMp4File, setSelectedMp4File] = useState<File | null>(null);
  const [selectedMp4Base64, setSelectedMp4Base64] = useState<string | null>(null);

  // Curriculum Topic Overrides State
  const [customVideos, setCustomVideos] = useState<Record<string, { url: string; title?: string; type: 'video' | 'embed'; fileName?: string; isUploadedMp4?: boolean }>>({});
  const [topicInputModes, setTopicInputModes] = useState<Record<string, 'upload_mp4' | 'paste_link'>>({});
  const [topicSelectedFiles, setTopicSelectedFiles] = useState<Record<string, { file: File; base64: string }>>({});
  const [topicUploadingId, setTopicUploadingId] = useState<string | null>(null);
  const [topicUrlInputs, setTopicUrlInputs] = useState<Record<string, string>>({});
  const [topicTitleInputs, setTopicTitleInputs] = useState<Record<string, string>>({});

  // Modals & Notifications
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadCollectionVideos = async () => {
    try {
      const vids = await api.getCollectionVideos();
      setCollectionVideos(vids || []);
    } catch (err) {
      console.error('Failed to load collection videos:', err);
    }
  };

  const refreshCustomVideos = () => {
    const v = api.getCustomVideos();
    setCustomVideos(v);
  };

  useEffect(() => {
    loadCollectionVideos();
    refreshCustomVideos();
  }, []);

  // Practicum file selection handler
  const handleMp4FileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
      setStatusNotice({ text: 'Please select a valid MP4 or WebM video file.', isError: true });
      return;
    }

    setSelectedMp4File(file);
    if (!newPracticumTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewPracticumTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setSelectedMp4Base64(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Practicum Video (Supports BOTH Upload MP4 and Paste Link)
  const handleSubmitPracticumVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPracticumTitle.trim()) {
      setStatusNotice({ text: 'Please provide a video demonstration title.', isError: true });
      return;
    }

    if (practicumMode === 'upload_mp4') {
      if (!selectedMp4File || !selectedMp4Base64) {
        setStatusNotice({ text: 'Please choose an MP4 video file to upload.', isError: true });
        return;
      }

      setIsSubmittingPracticum(true);
      try {
        const saved = await api.uploadCollectionVideo({
          title: newPracticumTitle.trim(),
          description: newPracticumDesc.trim() || 'Laboratory practicum demonstration recording.',
          fileName: selectedMp4File.name,
          fileData: selectedMp4Base64,
          topicNumber: Number(newPracticumTopic),
          duration: newPracticumDuration.trim() || '10:00',
          instructor: newPracticumInstructor.trim() || 'CSSENTIAL Faculty Lead'
        });

        setCollectionVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
        setSelectedMp4File(null);
        setSelectedMp4Base64(null);
        setNewPracticumTitle('');
        setNewPracticumDesc('');
        setStatusNotice({ text: `Successfully uploaded MP4 practicum: "${saved.title}" (Topic ${saved.topicNumber})` });
        setTimeout(() => setStatusNotice(null), 4000);
      } catch (err) {
        console.error('Error uploading practicum MP4:', err);
        setStatusNotice({ text: 'Failed to upload MP4 video file. Please check file size and try again.', isError: true });
      } finally {
        setIsSubmittingPracticum(false);
      }

    } else {
      // Paste Link Mode
      if (!newPracticumUrl.trim()) {
        setStatusNotice({ text: 'Please enter a valid video link or streaming URL.', isError: true });
        return;
      }

      setIsSubmittingPracticum(true);
      try {
        const cleanUrl = newPracticumUrl.trim();
        const isDirect = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm');
        const formattedUrl = isDirect ? cleanUrl : formatYouTubeEmbed(cleanUrl);

        const saved = await api.saveCollectionVideo({
          title: newPracticumTitle.trim(),
          topicNumber: Number(newPracticumTopic),
          url: formattedUrl,
          duration: newPracticumDuration.trim() || '10:00',
          instructor: newPracticumInstructor.trim() || 'CSSENTIAL Faculty Lead',
          description: newPracticumDesc.trim() || 'Laboratory practicum video demonstration.',
          thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
          isUploadedMp4: isDirect
        });

        setCollectionVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
        setNewPracticumUrl('');
        setNewPracticumTitle('');
        setNewPracticumDesc('');
        setStatusNotice({ text: `Successfully linked video demonstration: "${saved.title}" (Topic ${saved.topicNumber})` });
        setTimeout(() => setStatusNotice(null), 4000);
      } catch (err) {
        console.error('Error saving video link:', err);
        setStatusNotice({ text: 'Failed to save video link. Please verify URL and try again.', isError: true });
      } finally {
        setIsSubmittingPracticum(false);
      }
    }
  };

  const handleDeleteCollectionVideo = async (vidId: string) => {
    if (!confirm('Are you sure you want to delete this practicum video from the collection?')) return;
    try {
      await api.deleteCollectionVideo(vidId);
      setCollectionVideos(prev => prev.filter(v => v.id !== vidId));
      setStatusNotice({ text: 'Practicum video removed from collection.' });
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err) {
      setStatusNotice({ text: 'Failed to delete video.', isError: true });
    }
  };

  // ----------------------------------------------------
  // TOPIC OVERRIDES: FILE UPLOAD & URL LINK HANDLERS
  // ----------------------------------------------------

  const handleTopicFileSelected = (topicId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
      setStatusNotice({ text: 'Please select a valid MP4 or WebM video file.', isError: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const base64 = loadEvt.target?.result as string;
      setTopicSelectedFiles(prev => ({
        ...prev,
        [topicId]: { file, base64 }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Upload MP4 directly as a Topic Override
  const handleUploadTopicMp4 = async (topicId: string) => {
    const fileData = topicSelectedFiles[topicId];
    const lesson = LESSONS_DATA.find(l => l.id === topicId);
    if (!fileData || !lesson) {
      setStatusNotice({ text: 'Please choose an MP4 video file first.', isError: true });
      return;
    }

    setTopicUploadingId(topicId);
    try {
      const customTitle = topicTitleInputs[topicId]?.trim() || `${lesson.title} (Faculty Demonstration)`;
      
      // Upload to backend storage
      const uploaded = await api.uploadCollectionVideo({
        title: customTitle,
        description: `Official laboratory practicum demonstration for Topic ${lesson.topicNumber}: ${lesson.title}.`,
        fileName: fileData.file.name,
        fileData: fileData.base64,
        topicNumber: lesson.topicNumber,
        duration: '12:00',
        instructor: 'CSSENTIAL Faculty Lead'
      });

      // Save as active custom video override for this topic
      api.saveCustomVideo(topicId, {
        url: uploaded.url,
        title: customTitle,
        type: 'video',
        fileName: fileData.file.name,
        isUploadedMp4: true
      });

      // Clear local file selection
      setTopicSelectedFiles(prev => {
        const updated = { ...prev };
        delete updated[topicId];
        return updated;
      });

      refreshCustomVideos();
      loadCollectionVideos();
      setStatusNotice({ text: `Uploaded and activated MP4 video override for Topic ${lesson.topicNumber}!` });
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err) {
      console.error('Failed to upload topic MP4 override:', err);
      setStatusNotice({ text: 'Failed to upload MP4 file. Please try again.', isError: true });
    } finally {
      setTopicUploadingId(null);
    }
  };

  // Save Video URL as a Topic Override
  const handleSaveTopicUrl = (topicId: string) => {
    const rawUrl = topicUrlInputs[topicId]?.trim();
    if (!rawUrl) {
      setStatusNotice({ text: 'Please provide a valid YouTube, Vimeo, or direct MP4 URL.', isError: true });
      return;
    }

    const isDirect = rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm');
    const embed = isDirect ? rawUrl : formatYouTubeEmbed(rawUrl);
    const lesson = LESSONS_DATA.find(l => l.id === topicId);
    const title = topicTitleInputs[topicId]?.trim() || `${lesson?.title || 'Topic'} (Custom Video)`;

    api.saveCustomVideo(topicId, {
      url: embed,
      title,
      type: isDirect ? 'video' : 'embed',
      isUploadedMp4: isDirect
    });

    refreshCustomVideos();
    setTopicUrlInputs(prev => ({ ...prev, [topicId]: '' }));
    setStatusNotice({ text: `Custom video link activated for Topic ${lesson?.topicNumber}: "${title}"` });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleResetTopicDefault = (topicId: string) => {
    const lesson = LESSONS_DATA.find(l => l.id === topicId);
    api.deleteCustomVideo(topicId);
    refreshCustomVideos();
    setStatusNotice({ text: `Reset Topic ${lesson?.topicNumber} to default curriculum demonstration video.` });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const filteredCollection = selectedTopicFilter === 'ALL'
    ? collectionVideos
    : collectionVideos.filter(v => Number(v.topicNumber) === Number(selectedTopicFilter));

  const uploadedMp4Count = collectionVideos.filter(v => v.isUploadedMp4 || v.url?.endsWith('.mp4') || v.url?.startsWith('/uploads/')).length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <Film className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Instructor & Researcher Practicum Video Dashboard
                </h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-mono font-bold">
                  ALL 8 TOPICS SUPPORTED
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Centralized hub to upload MP4 files or paste video links across all 8 competency lessons and student practicum materials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('practicum_collection')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'practicum_collection'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileVideo className="w-3.5 h-3.5" />
              <span>Practicum Video Collection ({collectionVideos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('curriculum_topics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'curriculum_topics'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Topic Overrides ({LESSONS_DATA.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusNotice && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
          statusNotice.isError
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {statusNotice.isError ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{statusNotice.text}</span>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="px-5 py-3.5 bg-slate-900 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-xs font-bold truncate max-w-[80%]">{previewTitle}</span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-xs text-gray-400 hover:text-white px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {previewUrl.startsWith('blob:') || previewUrl.endsWith('.mp4') || previewUrl.startsWith('/uploads/') ? (
                <video src={previewUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <iframe
                  src={`${previewUrl}?autoplay=1`}
                  title={previewTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: LABORATORY PRACTICUM VIDEO COLLECTION */}
      {activeTab === 'practicum_collection' && (
        <div className="space-y-6">
          
          {/* Metrics & Add Video Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Metrics Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Practicum Video Repository Stats
                </h4>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {collectionVideos.length} Total Videos
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                  <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                    <FileVideo className="w-3.5 h-3.5" />
                    MP4 Uploads
                  </span>
                  <p className="text-lg font-black text-purple-900 mt-0.5">{uploadedMp4Count}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Web Streams
                  </span>
                  <p className="text-lg font-black text-blue-900 mt-0.5">
                    {collectionVideos.length - uploadedMp4Count}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-gray-600 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Dual Support: MP4 Uploads &amp; Web Links</span>
                </div>
                <p>
                  You can either upload local MP4 recordings directly from your device OR paste web links (YouTube, Vimeo, web video). All entries are synchronized across all 8 competency units.
                </p>
              </div>
            </div>

            {/* Add Practicum Video Form */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 mb-4 gap-3">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-black text-gray-900">
                    Add Practicum Demonstration Video
                  </h4>
                </div>

                {/* Mode Switcher: Upload MP4 vs Paste Video Link */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPracticumMode('upload_mp4')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      practicumMode === 'upload_mp4'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload MP4 File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticumMode('paste_link')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      practicumMode === 'paste_link'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Paste Video Link</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitPracticumVideo} className="space-y-4">
                
                {/* Title & Topic selection (Topics 1 to 8) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Video Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ethernet RJ-45 Crimping & T568B Standards"
                      value={newPracticumTitle}
                      onChange={(e) => setNewPracticumTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Aligned Competency Topic (All 8 Topics)
                    </label>
                    <select
                      value={newPracticumTopic}
                      onChange={(e) => setNewPracticumTopic(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border rounded-xl font-semibold bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {LESSONS_DATA.map((lesson) => (
                        <option key={lesson.topicNumber} value={lesson.topicNumber}>
                          Topic {lesson.topicNumber}: {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration & Instructor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Instructor / Demonstrator</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Laboratory Instructor"
                      value={newPracticumInstructor}
                      onChange={(e) => setNewPracticumInstructor(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Duration (MM:SS)</label>
                    <input
                      type="text"
                      placeholder="e.g. 12:45"
                      value={newPracticumDuration}
                      onChange={(e) => setNewPracticumDuration(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl"
                    />
                  </div>
                </div>

                {/* Conditional Input: MP4 File Upload vs Video Link */}
                {practicumMode === 'upload_mp4' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>Choose MP4 Video File *</span>
                      {selectedMp4File && (
                        <span className="text-[11px] font-mono text-purple-700 font-bold">
                          {(selectedMp4File.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      )}
                    </label>
                    <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                      <FileVideo className="w-6 h-6 text-blue-600 shrink-0" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-gray-800 block">
                          {selectedMp4File ? selectedMp4File.name : 'Select or drop MP4 video recording'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Supports MP4 and WebM formats from laboratory bench cameras or screencasts
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleMp4FileSelected}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>Video Demonstration URL or Embed Link *</span>
                      <span className="text-[10px] text-blue-600 font-medium">YouTube, Vimeo, Web MP4</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="url"
                        required={practicumMode === 'paste_link'}
                        placeholder="https://www.youtube.com/watch?v=... or https://example.com/demo.mp4"
                        value={newPracticumUrl}
                        onChange={(e) => setNewPracticumUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Practicum Description / Lab Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe key steps, tools, and testing procedures demonstrated in this recording."
                    value={newPracticumDesc}
                    onChange={(e) => setNewPracticumDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingPracticum}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingPracticum ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Video to System...</span>
                      </>
                    ) : (
                      <>
                        {practicumMode === 'upload_mp4' ? (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Practicum MP4</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Add Video Link</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Collection Filter & Video Grid */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-black text-gray-900">
                  Practicum Videos in Live Collection
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing {filteredCollection.length} materials across all 8 competency topics.
                </p>
              </div>

              {/* Topic Filter Pills (All 8 Topics!) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedTopicFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedTopicFilter === 'ALL'
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Topics
                </button>
                {LESSONS_DATA.map(lesson => (
                  <button
                    key={lesson.topicNumber}
                    onClick={() => setSelectedTopicFilter(lesson.topicNumber)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedTopicFilter === lesson.topicNumber
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Topic 0{lesson.topicNumber}
                  </button>
                ))}
              </div>
            </div>

            {filteredCollection.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <Film className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">No videos found for this filter</p>
                <p className="text-xs text-gray-500 mt-1">Upload an MP4 practicum recording or paste a video link above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCollection.map((vid) => {
                  const isMp4 = vid.isUploadedMp4 || vid.url?.endsWith('.mp4') || vid.url?.startsWith('/uploads/');
                  return (
                    <div
                      key={vid.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header preview / thumbnail */}
                        <div className="relative aspect-video bg-slate-950 overflow-hidden">
                          <img
                            src={vid.thumbnail || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'}
                            alt={vid.title}
                            className="w-full h-full object-cover opacity-75"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase">
                                Topic 0{vid.topicNumber}
                              </span>
                              {isMp4 ? (
                                <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold flex items-center gap-1">
                                  <FileVideo className="w-3 h-3" />
                                  MP4
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-sky-600 text-white rounded text-[10px] font-bold flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  Link
                                </span>
                              )}
                            </div>
                            {vid.duration && (
                              <span className="px-1.5 py-0.5 bg-black/60 text-white rounded text-[10px] font-mono">
                                {vid.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Video Details */}
                        <div className="p-4 space-y-2">
                          <h5 className="font-bold text-sm text-gray-900 line-clamp-2">
                            {vid.title}
                          </h5>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {vid.description}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                            <span>{vid.instructor || 'Faculty Lead'}</span>
                            {vid.fileSize && (
                              <span className="font-mono text-purple-700 font-semibold">{vid.fileSize}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setPreviewUrl(vid.url);
                              setPreviewTitle(vid.title);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Preview</span>
                          </button>

                          {isMp4 && vid.url && (
                            <a
                              href={vid.url}
                              download={vid.fileName || `${vid.title}.mp4`}
                              className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              title="Download MP4 file"
                            >
                              <FolderDown className="w-3.5 h-3.5" />
                              <span>MP4</span>
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteCollectionVideo(vid.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete from collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: ALL 8 CORE CURRICULUM TOPIC DEMONSTRATION VIDEOS */}
      {activeTab === 'curriculum_topics' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                All 8 Core Curriculum Demonstration Lessons
              </p>
              <p className="text-amber-800 mt-0.5">
                Override or update the main demonstration video assigned to each of the 8 core lessons. Instructors can now <strong>upload local MP4 video recordings directly</strong> or <strong>paste video streaming links</strong>. Changes instantly synchronize to the interactive student lesson viewer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LESSONS_DATA.map((lesson) => {
              const custom = customVideos[lesson.id];
              const hasCustom = !!custom?.url;
              const isCustomMp4 = custom?.isUploadedMp4 || custom?.type === 'video' || custom?.url?.startsWith('/uploads/') || custom?.url?.endsWith('.mp4');
              const currentInputMode = topicInputModes[lesson.id] || 'upload_mp4';
              const selectedFileForTopic = topicSelectedFiles[lesson.id];
              const isUploadingThisTopic = topicUploadingId === lesson.id;

              return (
                <div
                  key={lesson.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    hasCustom
                      ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div>
                    {/* Topic Header & Status Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                        Topic 0{lesson.topicNumber}
                      </span>
                      
                      {hasCustom ? (
                        isCustomMp4 ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                            <FileVideo className="w-3 h-3 text-purple-600" />
                            Uploaded MP4 Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3 text-amber-600" />
                            Custom Video Link Active
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600">
                          Standard Curated Video
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-gray-900">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {hasCustom ? (custom.title || 'Instructor Demonstration Video') : lesson.shortDesc}
                    </p>
                  </div>

                  {/* Override Controls Box */}
                  <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                    
                    {/* Method Toggle: Upload MP4 vs Paste Link */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700">Override Method:</span>
                      <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setTopicInputModes(prev => ({ ...prev, [lesson.id]: 'upload_mp4' }))}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                            currentInputMode === 'upload_mp4'
                              ? 'bg-purple-700 text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload MP4</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopicInputModes(prev => ({ ...prev, [lesson.id]: 'paste_link' }))}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                            currentInputMode === 'paste_link'
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Paste Link</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode A: Upload MP4 File for this Topic */}
                    {currentInputMode === 'upload_mp4' ? (
                      <div className="space-y-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-purple-900 flex items-center justify-between">
                            <span>Select MP4 Video File</span>
                            {selectedFileForTopic && (
                              <span className="font-mono text-purple-700">
                                {(selectedFileForTopic.file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            )}
                          </label>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={(e) => handleTopicFileSelected(lesson.id, e)}
                            className="w-full text-xs text-gray-700 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-700 file:text-white hover:file:bg-purple-800 cursor-pointer"
                          />
                        </div>

                        {selectedFileForTopic && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-gray-600 truncate max-w-[180px]">
                              {selectedFileForTopic.file.name}
                            </span>
                            <button
                              type="button"
                              disabled={isUploadingThisTopic}
                              onClick={() => handleUploadTopicMp4(lesson.id)}
                              className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                            >
                              {isUploadingThisTopic ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3 h-3" />
                                  <span>Apply MP4 Override</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Mode B: Paste Video Link for this Topic */
                      <div className="space-y-1.5 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="YouTube, Vimeo, or MP4 link..."
                            value={topicUrlInputs[lesson.id] || ''}
                            onChange={(e) => setTopicUrlInputs(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-blue-600 font-normal"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTopicUrl(lesson.id)}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Save Link
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview & Reset Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          const url = hasCustom ? custom.url : lesson.videoUrl;
                          const title = hasCustom ? (custom.title || lesson.title) : lesson.title;
                          setPreviewUrl(formatYouTubeEmbed(url));
                          setPreviewTitle(title);
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Preview Active Video</span>
                      </button>

                      {hasCustom && (
                        <button
                          onClick={() => handleResetTopicDefault(lesson.id)}
                          className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Restore original standard curriculum video"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
