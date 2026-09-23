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
  Info
} from 'lucide-react';
import { LESSONS_DATA } from '../data/curriculum';
import { api } from '../services/api';
import { CollectionVideo } from '../types';

function formatYouTubeEmbed(url: string): string {
  if (!url) return '';
  if (url.includes('youtube-nocookie.com/embed/') || url.includes('youtube.com/embed/')) {
    return url;
  }
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
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
  const [isUploadingMp4, setIsUploadingMp4] = useState(false);
  const [newPracticumTitle, setNewPracticumTitle] = useState('');
  const [newPracticumTopic, setNewPracticumTopic] = useState(1);
  const [newPracticumDuration, setNewPracticumDuration] = useState('12:00');
  const [newPracticumInstructor, setNewPracticumInstructor] = useState('CSSENTIAL Faculty Lead');
  const [newPracticumDesc, setNewPracticumDesc] = useState('');
  const [selectedMp4File, setSelectedMp4File] = useState<File | null>(null);
  const [selectedMp4Base64, setSelectedMp4Base64] = useState<string | null>(null);

  // Curriculum Topic Overrides State
  const [customVideos, setCustomVideos] = useState<Record<string, { url: string; title?: string; type: 'video' | 'embed' }>>({});
  const [selectedTopicId, setSelectedTopicId] = useState<string>(LESSONS_DATA[0].id);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');

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

  const handleUploadPracticumVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMp4File || !selectedMp4Base64) {
      setStatusNotice({ text: 'Please choose an MP4 video file to upload.', isError: true });
      return;
    }
    if (!newPracticumTitle.trim()) {
      setStatusNotice({ text: 'Please provide a video demonstration title.', isError: true });
      return;
    }

    setIsUploadingMp4(true);
    try {
      const saved = await api.uploadCollectionVideo({
        title: newPracticumTitle.trim(),
        description: newPracticumDesc.trim() || 'Laboratory practicum demonstration recording.',
        fileName: selectedMp4File.name,
        fileData: selectedMp4Base64,
        topicNumber: Number(newPracticumTopic),
        duration: newPracticumDuration.trim() || '10:00',
        instructor: newPracticumInstructor.trim() || 'Faculty Lead'
      });

      setCollectionVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
      setSelectedMp4File(null);
      setSelectedMp4Base64(null);
      setNewPracticumTitle('');
      setNewPracticumDesc('');
      setStatusNotice({ text: `Successfully uploaded MP4 practicum: "${saved.title}"` });
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err) {
      console.error('Error uploading practicum MP4:', err);
      setStatusNotice({ text: 'Failed to upload MP4 video file. Please check file size and try again.', isError: true });
    } finally {
      setIsUploadingMp4(false);
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

  // Topic Override Handlers
  const handleSaveTopicUrl = (topicId: string) => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setStatusNotice({ text: 'Please provide a valid YouTube, Vimeo, or direct MP4 URL.', isError: true });
      return;
    }

    const isDirect = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm');
    const embed = isDirect ? cleanUrl : formatYouTubeEmbed(cleanUrl);
    const lesson = LESSONS_DATA.find(l => l.id === topicId);
    const title = titleInput.trim() || `${lesson?.title || 'Topic'} (Custom Video)`;

    api.saveCustomVideo(topicId, {
      url: embed,
      title,
      type: isDirect ? 'video' : 'embed'
    });

    refreshCustomVideos();
    setUrlInput('');
    setTitleInput('');
    setStatusNotice({ text: `Custom video link saved for Topic ${lesson?.topicNumber}: "${title}"` });
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
                  RESTRICTED ACCESS
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Centralized hub to upload, curate, preview, and manage authentic laboratory demonstration MP4s and student watchable materials.
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
              <span>Practicum MP4 Collection ({collectionVideos.length})</span>
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
              <span>Topic Overrides</span>
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

      {/* TAB 1: LABORATORY PRACTICUM MP4 VIDEO COLLECTION */}
      {activeTab === 'practicum_collection' && (
        <div className="space-y-6">
          
          {/* Quick Metrics & Upload Section */}
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

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-gray-600 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
                All uploaded MP4 practicum files are securely persisted in the application storage and immediately synchronized to students' Collection View.
              </div>
            </div>

            {/* Upload MP4 Practicum Form */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-black text-gray-900">
                    Upload Laboratory Practicum MP4 Demonstration
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-gray-500 font-bold">
                  MP4 / WebM Direct
                </span>
              </div>

              <form onSubmit={handleUploadPracticumVideo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Video Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Clean OS Booting & Partitioning Practicum"
                      value={newPracticumTitle}
                      onChange={(e) => setNewPracticumTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Aligned Competency Topic</label>
                    <select
                      value={newPracticumTopic}
                      onChange={(e) => setNewPracticumTopic(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border rounded-xl font-semibold"
                    >
                      <option value={1}>Topic 1: Planning & Prep (OHS/ESD)</option>
                      <option value={2}>Topic 2: Hardware Assembly</option>
                      <option value={3}>Topic 3: OS Installation & Setup</option>
                      <option value={4}>Topic 4: Device Drivers & Apps</option>
                      <option value={5}>Topic 5: System Testing & Burn-in</option>
                      <option value={6}>Topic 6: Diagnostics & Troubleshooting</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Instructor / Demonstrator</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Course Instructor"
                      value={newPracticumInstructor}
                      onChange={(e) => setNewPracticumInstructor(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl"
                    />
                  </div>
                </div>

                {/* File Dropzone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                    <span>Choose MP4 File *</span>
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
                        Supports MP4 and WebM video formats from lab bench cameras or screencasts
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

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUploadingMp4}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploadingMp4 ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading MP4 to Server...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Practicum MP4</span>
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
                  Showing {filteredCollection.length} video materials visible to students and faculty.
                </p>
              </div>

              {/* Topic Filter Pills */}
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
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setSelectedTopicFilter(num)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedTopicFilter === num
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Topic 0{num}
                  </button>
                ))}
              </div>
            </div>

            {filteredCollection.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <Film className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">No videos found for this filter</p>
                <p className="text-xs text-gray-500 mt-1">Upload an MP4 practicum recording above to populate this section.</p>
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
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase">
                                Topic 0{vid.topicNumber}
                              </span>
                              {isMp4 && (
                                <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold flex items-center gap-1">
                                  <FileVideo className="w-3 h-3" />
                                  MP4
                                </span>
                              )}
                            </div>
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

      {/* TAB 2: 6 CORE CURRICULUM TOPIC DEMONSTRATION VIDEOS */}
      {activeTab === 'curriculum_topics' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Override or update the main demonstration video assigned to each of the 6 core lessons. Changes here instantly update the interactive lesson viewer.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LESSONS_DATA.map((lesson) => {
              const custom = customVideos[lesson.id];
              const hasCustom = !!custom?.url;
              const isSelected = selectedTopicId === lesson.id;

              return (
                <div
                  key={lesson.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    hasCustom
                      ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                        Topic 0{lesson.topicNumber}
                      </span>
                      {hasCustom ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Custom Video
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600">
                          Standard Curated
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-gray-900 line-clamp-1">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {hasCustom ? custom.title || 'Instructor Demonstration Video' : lesson.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const url = hasCustom ? custom.url : lesson.videoUrl;
                          const title = hasCustom ? (custom.title || lesson.title) : lesson.title;
                          setPreviewUrl(formatYouTubeEmbed(url));
                          setPreviewTitle(title);
                        }}
                        className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Preview Video</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Paste YouTube or MP4 link..."
                          value={isSelected ? urlInput : ''}
                          onFocus={() => setSelectedTopicId(lesson.id)}
                          onChange={(e) => {
                            setSelectedTopicId(lesson.id);
                            setUrlInput(e.target.value);
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-blue-600 font-normal"
                        />
                        <button
                          onClick={() => handleSaveTopicUrl(lesson.id)}
                          className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {hasCustom && (
                      <button
                        onClick={() => handleResetTopicDefault(lesson.id)}
                        className="w-full py-1 text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Default Curriculum Video</span>
                      </button>
                    )}
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
