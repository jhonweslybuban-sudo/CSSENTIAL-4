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
  Sparkles,
  Trash2,
  FolderDown,
  Layers,
  Info,
  Check,
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
  // Default to lesson materials watch button management
  const [activeTab, setActiveTab] = useState<'watch_button_materials' | 'practicum_collection'>('watch_button_materials');

  // Practicum Collection Videos State
  const [collectionVideos, setCollectionVideos] = useState<CollectionVideo[]>([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<number | 'ALL'>('ALL');

  // Quick Hero Form State (Upload & Assign to Watch Button)
  const [quickTopic, setQuickTopic] = useState<number>(1);
  const [quickMode, setQuickMode] = useState<'upload_mp4' | 'paste_link'>('upload_mp4');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickFile, setQuickFile] = useState<File | null>(null);
  const [quickBase64, setQuickBase64] = useState<string | null>(null);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickInstructor, setQuickInstructor] = useState('CSSENTIAL Faculty Lead');
  const [quickDuration, setQuickDuration] = useState('12:00');
  const [quickDesc, setQuickDesc] = useState('');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  // Practicum Add Mode State (Archive Tab)
  const [practicumMode, setPracticumMode] = useState<'upload_mp4' | 'paste_link'>('upload_mp4');
  const [isSubmittingPracticum, setIsSubmittingPracticum] = useState(false);
  const [newPracticumTitle, setNewPracticumTitle] = useState('');
  const [newPracticumTopic, setNewPracticumTopic] = useState<number>(1);
  const [newPracticumDuration, setNewPracticumDuration] = useState('10:00');
  const [newPracticumInstructor, setNewPracticumInstructor] = useState('CSSENTIAL Faculty Lead');
  const [newPracticumDesc, setNewPracticumDesc] = useState('');
  const [newPracticumUrl, setNewPracticumUrl] = useState('');
  const [syncToWatchButton, setSyncToWatchButton] = useState(true);
  const [selectedMp4File, setSelectedMp4File] = useState<File | null>(null);
  const [selectedMp4Base64, setSelectedMp4Base64] = useState<string | null>(null);

  // Curriculum Topic Overrides State (Watch Button Materials)
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

  // Quick file selection handler
  const handleQuickFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
      setStatusNotice({ text: 'Please select a valid MP4 or WebM video file.', isError: true });
      return;
    }

    setQuickFile(file);
    if (!quickTitle.trim()) {
      const lesson = LESSONS_DATA.find(l => l.topicNumber === quickTopic);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setQuickTitle(cleanName ? `${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}` : `${lesson?.title || 'Demonstration Video'}`);
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setQuickBase64(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Quick Form -> Immediately sets the [WATCH] button on Lesson Materials
  const handleSubmitQuickForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const lesson = LESSONS_DATA.find(l => l.topicNumber === quickTopic);
    const targetTopicId = lesson?.id || `lesson-${quickTopic}`;
    const defaultTitle = lesson ? `${lesson.title} (Faculty Demonstration)` : `Topic 0${quickTopic} Demonstration Video`;
    const finalTitle = quickTitle.trim() || defaultTitle;

    if (quickMode === 'upload_mp4') {
      if (!quickFile || !quickBase64) {
        setStatusNotice({ text: 'Please select an MP4 video file to upload.', isError: true });
        return;
      }

      setIsSubmittingQuick(true);
      try {
        // Upload to backend storage
        const uploaded = await api.uploadCollectionVideo({
          title: finalTitle,
          description: quickDesc.trim() || `Official laboratory demonstration for Topic ${quickTopic}: ${lesson?.title}.`,
          fileName: quickFile.name,
          fileData: quickBase64,
          topicNumber: quickTopic,
          duration: quickDuration.trim() || '12:00',
          instructor: quickInstructor.trim() || 'CSSENTIAL Faculty Lead'
        });

        // Set as active video for the Lesson Materials WATCH button
        api.saveCustomVideo(targetTopicId, {
          url: uploaded.url,
          title: finalTitle,
          type: 'video',
          fileName: quickFile.name,
          isUploadedMp4: true
        });

        refreshCustomVideos();
        await loadCollectionVideos();

        setQuickFile(null);
        setQuickBase64(null);
        setQuickTitle('');
        setQuickDesc('');

        setStatusNotice({
          text: `✅ Success! Video uploaded and live on the [WATCH] button for Topic ${quickTopic}: "${finalTitle}". Students clicking WATCH on Lesson Materials will now see this video.`
        });
        setTimeout(() => setStatusNotice(null), 5000);
      } catch (err) {
        console.error('Error uploading video to watch button:', err);
        setStatusNotice({ text: 'Failed to upload MP4 video file. Please check file size and try again.', isError: true });
      } finally {
        setIsSubmittingQuick(false);
      }
    } else {
      // Paste Link Mode
      if (!quickUrl.trim()) {
        setStatusNotice({ text: 'Please enter a valid video link or streaming URL.', isError: true });
        return;
      }

      setIsSubmittingQuick(true);
      try {
        const cleanUrl = quickUrl.trim();
        const isDirect = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm');
        const formattedUrl = isDirect ? cleanUrl : formatYouTubeEmbed(cleanUrl);

        // Save to collection archive
        await api.saveCollectionVideo({
          title: finalTitle,
          topicNumber: quickTopic,
          url: formattedUrl,
          duration: quickDuration.trim() || '12:00',
          instructor: quickInstructor.trim() || 'CSSENTIAL Faculty Lead',
          description: quickDesc.trim() || `Laboratory demonstration video for Topic ${quickTopic}.`,
          thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
          isUploadedMp4: isDirect
        });

        // Set as active video for the Lesson Materials WATCH button
        api.saveCustomVideo(targetTopicId, {
          url: formattedUrl,
          title: finalTitle,
          type: isDirect ? 'video' : 'embed',
          isUploadedMp4: isDirect
        });

        refreshCustomVideos();
        await loadCollectionVideos();

        setQuickUrl('');
        setQuickTitle('');
        setQuickDesc('');

        setStatusNotice({
          text: `✅ Success! Video link assigned and live on the [WATCH] button for Topic ${quickTopic}: "${finalTitle}".`
        });
        setTimeout(() => setStatusNotice(null), 5000);
      } catch (err) {
        console.error('Error saving video link to watch button:', err);
        setStatusNotice({ text: 'Failed to save video link. Please verify URL and try again.', isError: true });
      } finally {
        setIsSubmittingQuick(false);
      }
    }
  };

  // Practicum file selection handler (Archive tab)
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

  // Submit Practicum Video (Archive tab - with option to sync to watch button)
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

        // If syncToWatchButton is enabled, also set the WATCH button on the lesson material
        if (syncToWatchButton) {
          api.saveCustomVideo(`lesson-${newPracticumTopic}`, {
            url: saved.url,
            title: saved.title,
            type: 'video',
            fileName: selectedMp4File.name,
            isUploadedMp4: true
          });
          refreshCustomVideos();
        }

        setCollectionVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
        setSelectedMp4File(null);
        setSelectedMp4Base64(null);
        setNewPracticumTitle('');
        setNewPracticumDesc('');
        
        setStatusNotice({
          text: syncToWatchButton
            ? `✅ Uploaded MP4 and set as live [WATCH] button demonstration for Topic ${saved.topicNumber}: "${saved.title}"`
            : `Uploaded MP4 practicum to archive: "${saved.title}" (Topic ${saved.topicNumber})`
        });
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

        if (syncToWatchButton) {
          api.saveCustomVideo(`lesson-${newPracticumTopic}`, {
            url: formattedUrl,
            title: saved.title,
            type: isDirect ? 'video' : 'embed',
            isUploadedMp4: isDirect
          });
          refreshCustomVideos();
        }

        setCollectionVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
        setNewPracticumUrl('');
        setNewPracticumTitle('');
        setNewPracticumDesc('');
        
        setStatusNotice({
          text: syncToWatchButton
            ? `✅ Saved video link and set as live [WATCH] button demonstration for Topic ${saved.topicNumber}: "${saved.title}"`
            : `Added video demonstration to archive: "${saved.title}" (Topic ${saved.topicNumber})`
        });
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
    } catch {
      setStatusNotice({ text: 'Failed to delete video.', isError: true });
    }
  };

  // Directly apply any existing practicum video to the Lesson Material [WATCH] button
  const handleApplyToWatchButton = (vid: CollectionVideo) => {
    const lessonId = `lesson-${vid.topicNumber}`;
    const isDirect = vid.isUploadedMp4 || vid.url?.endsWith('.mp4') || vid.url?.startsWith('/uploads/');
    api.saveCustomVideo(lessonId, {
      url: vid.url,
      title: vid.title,
      type: isDirect ? 'video' : 'embed',
      fileName: vid.fileName,
      isUploadedMp4: isDirect
    });
    refreshCustomVideos();
    setStatusNotice({
      text: `✅ Set "${vid.title}" as the active [WATCH] button demonstration for Topic ${vid.topicNumber} in Lesson Materials!`
    });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // ----------------------------------------------------
  // TOPIC CARD DIRECT ACTIONS (Upload MP4 or Paste Link)
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

  // Upload MP4 directly as a Topic's [WATCH] Button Video
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
        description: `Official laboratory demonstration for Topic ${lesson.topicNumber}: ${lesson.title}.`,
        fileName: fileData.file.name,
        fileData: fileData.base64,
        topicNumber: lesson.topicNumber,
        duration: '12:00',
        instructor: 'CSSENTIAL Faculty Lead'
      });

      // Save as active custom video override for the WATCH button
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
      await loadCollectionVideos();
      setStatusNotice({
        text: `✅ Uploaded and applied MP4 to Topic ${lesson.topicNumber} [WATCH] button in Lesson Materials!`
      });
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err) {
      console.error('Failed to upload topic MP4 override:', err);
      setStatusNotice({ text: 'Failed to upload MP4 file. Please try again.', isError: true });
    } finally {
      setTopicUploadingId(null);
    }
  };

  // Save Video URL as a Topic's [WATCH] Button Video
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
    setStatusNotice({
      text: `✅ Custom video link set on Topic ${lesson?.topicNumber} [WATCH] button in Lesson Materials: "${title}"`
    });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleResetTopicDefault = (topicId: string) => {
    const lesson = LESSONS_DATA.find(l => l.id === topicId);
    api.deleteCustomVideo(topicId);
    refreshCustomVideos();
    setStatusNotice({
      text: `Reset Topic ${lesson?.topicNumber} [WATCH] button to standard curriculum demonstration video.`
    });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const filteredCollection = selectedTopicFilter === 'ALL'
    ? collectionVideos
    : collectionVideos.filter(v => Number(v.topicNumber) === Number(selectedTopicFilter));

  const uploadedMp4Count = collectionVideos.filter(v => v.isUploadedMp4 || v.url?.endsWith('.mp4') || v.url?.startsWith('/uploads/')).length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <Film className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white">
                  Lesson Materials Demonstration Videos &amp; [WATCH] Button Manager
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  SYNCED TO LESSON [WATCH] BUTTONS
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Upload MP4 videos or paste links for all 8 lesson topics. Every video set here plays directly when students or instructors click the <span className="text-white font-bold bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-500/30">▶ WATCH</span> button in the Lesson Materials table.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('watch_button_materials')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'watch_button_materials'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lesson [WATCH] Videos ({LESSONS_DATA.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('practicum_collection')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'practicum_collection'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Practicum Archive ({collectionVideos.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusNotice && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs ${
          statusNotice.isError
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
        }`}>
          {statusNotice.isError ? (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{statusNotice.text}</span>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="px-5 py-3.5 bg-slate-900 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-xs font-bold truncate max-w-[80%] flex items-center gap-2">
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>{previewTitle}</span>
              </span>
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

      {/* TAB 1: LESSON MATERIALS [WATCH] VIDEOS (PRIMARY DEFAULT VIEW) */}
      {activeTab === 'watch_button_materials' && (
        <div className="space-y-6">

          {/* Quick Hero Uploader: Upload & Set Directly to [WATCH] Button */}
          <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <Play className="w-4 h-4 fill-white" />
                  </span>
                  <h4 className="text-base font-black text-gray-900">
                    Upload &amp; Assign Video to Lesson Material [WATCH] Button
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select any of the 8 curriculum topics, then choose an MP4 file or paste a web link. When saved, it immediately powers the <strong>[WATCH]</strong> button on that topic in Lesson Materials!
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setQuickMode('upload_mp4')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    quickMode === 'upload_mp4'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload MP4 Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickMode('paste_link')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    quickMode === 'paste_link'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Paste Web Link</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitQuickForm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Target Topic Selector (All 8 Topics) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Curriculum Topic (1 to 8) *</span>
                  </label>
                  <select
                    value={quickTopic}
                    onChange={(e) => setQuickTopic(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-bold bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  >
                    {LESSONS_DATA.map((lesson) => {
                      const hasCustom = !!customVideos[lesson.id]?.url;
                      return (
                        <option key={lesson.topicNumber} value={lesson.topicNumber}>
                          Topic {lesson.topicNumber}: {lesson.title} {hasCustom ? '★ (Custom Active)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. Video Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">
                    Video Demonstration Title
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Topic ${quickTopic} Laboratory Demonstration`}
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                {/* 3. Demonstrator / Instructor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Instructor / Demonstrator</label>
                  <input
                    type="text"
                    placeholder="e.g. CSSENTIAL Faculty Lead"
                    value={quickInstructor}
                    onChange={(e) => setQuickInstructor(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Conditional Video Input: MP4 vs Link */}
              {quickMode === 'upload_mp4' ? (
                <div className="space-y-1.5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <label className="text-xs font-bold text-indigo-950 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileVideo className="w-4 h-4 text-indigo-600" />
                      <span>Choose Local MP4 File from Your Device *</span>
                    </span>
                    {quickFile && (
                      <span className="text-xs font-mono text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded">
                        {(quickFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </label>

                  <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer bg-white hover:bg-indigo-50/40 transition-colors">
                    <Upload className="w-6 h-6 text-indigo-600 shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-900 block truncate">
                        {quickFile ? quickFile.name : 'Click to select or drag and drop MP4 or WebM video file'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Supports MP4, WebM formats from screen recordings or camera captures.
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleQuickFileSelected}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-1.5 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-950 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Video Demonstration Web Link (YouTube, Vimeo, MP4 URL) *</span>
                    </span>
                    <span className="text-[11px] text-blue-700 font-medium">Standard or embed link</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      required={quickMode === 'paste_link'}
                      placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                      value={quickUrl}
                      onChange={(e) => setQuickUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Directly updates the [WATCH] button in the Student &amp; Instructor Lesson Materials table for Topic 0{quickTopic}.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingQuick}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 active:scale-95"
                >
                  {isSubmittingQuick ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving &amp; Updating Topic {quickTopic} [WATCH] Button...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Upload &amp; Set as [WATCH] Video for Topic 0{quickTopic}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ALL 8 TOPICS CARDS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Curriculum Topic Demonstration Videos</span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-bold font-mono">
                    All 8 Topics
                  </span>
                </h4>
                <p className="text-xs text-gray-500">
                  Review the current demonstration video assigned to each topic's [WATCH] button, or upload overrides below.
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
                        ? 'bg-indigo-50/30 border-indigo-200 shadow-xs'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div>
                      {/* Topic Header & Status Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 font-mono">
                          Topic 0{lesson.topicNumber}
                        </span>
                        
                        {hasCustom ? (
                          isCustomMp4 ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                              <FileVideo className="w-3 h-3 text-purple-600" />
                              Custom MP4 on [WATCH] Button
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-amber-600" />
                              Custom Link on [WATCH] Button
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600">
                            Default Curriculum Video on [WATCH]
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
                        <span className="text-[11px] font-bold text-gray-700">Change [WATCH] Video:</span>
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
                                ? 'bg-indigo-700 text-white shadow-xs'
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
                                    <span>Applying...</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 fill-white" />
                                    <span>Apply to [WATCH] Button</span>
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
                              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600 font-normal"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTopicUrl(lesson.id)}
                              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Apply to [WATCH]</span>
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
                          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Preview [WATCH] Video</span>
                        </button>

                        {hasCustom && (
                          <button
                            onClick={() => handleResetTopicDefault(lesson.id)}
                            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Restore original standard curriculum video"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset to Default</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PRACTICUM ARCHIVE & COLLECTION */}
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
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                  <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Dual Support: MP4 Uploads &amp; Web Links</span>
                </div>
                <p>
                  You can upload local MP4 recordings or paste web links. Every video in this archive can also be applied directly to the Lesson Materials [WATCH] button with a single click!
                </p>
              </div>
            </div>

            {/* Add Practicum Video Form */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 mb-4 gap-3">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-indigo-600" />
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
                        ? 'bg-indigo-700 text-white shadow-xs'
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
                        ? 'bg-indigo-700 text-white shadow-xs'
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
                      className="w-full px-3 py-2 text-xs border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Aligned Competency Topic (All 8 Topics)
                    </label>
                    <select
                      value={newPracticumTopic}
                      onChange={(e) => setNewPracticumTopic(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border rounded-xl font-semibold bg-white focus:ring-2 focus:ring-indigo-500"
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
                    <label className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                      <FileVideo className="w-6 h-6 text-indigo-600 shrink-0" />
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
                        className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Sync to Watch Button Checkbox */}
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="sync-watch-button-check"
                    checked={syncToWatchButton}
                    onChange={(e) => setSyncToWatchButton(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="sync-watch-button-check" className="text-xs font-bold text-indigo-950 cursor-pointer">
                    Also set as active video for Lesson Material's [WATCH] button (Topic {newPracticumTopic})
                  </label>
                </div>

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
                    className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
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

          {/* Video Repository Browser */}
          <div className="space-y-4">
            
            {/* Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  Browse Demonstration Videos by Topic:
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedTopicFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedTopicFilter === 'ALL'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({collectionVideos.length})
                </button>
                {LESSONS_DATA.map((lesson) => {
                  const count = collectionVideos.filter(v => Number(v.topicNumber) === lesson.topicNumber).length;
                  return (
                    <button
                      key={lesson.topicNumber}
                      onClick={() => setSelectedTopicFilter(lesson.topicNumber)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedTopicFilter === lesson.topicNumber
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      T{lesson.topicNumber} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Videos Grid */}
            {filteredCollection.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-3">
                <FileVideo className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-600">No practicum demonstration videos recorded for this filter.</p>
                <p className="text-xs text-gray-400">Use the form above to upload an MP4 recording or paste a streaming link.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCollection.map((vid) => {
                  const isMp4 = vid.isUploadedMp4 || vid.url?.endsWith('.mp4') || vid.url?.startsWith('/uploads/');
                  const currentCustomForTopic = customVideos[`lesson-${vid.topicNumber}`];
                  const isCurrentlyActiveOnWatchButton = currentCustomForTopic?.url === vid.url;

                  return (
                    <div
                      key={vid.id}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail or Video Badge Header */}
                        <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                          {isMp4 ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-indigo-950 text-white p-4">
                              <FileVideo className="w-10 h-10 text-indigo-400 mb-2" />
                              <span className="text-xs font-bold text-gray-200 truncate max-w-[90%] text-center">
                                {vid.fileName || vid.title}
                              </span>
                              <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-mono mt-1">
                                MP4 Laboratory Video File
                              </span>
                            </div>
                          ) : (
                            <img
                              src={vid.thumbnail || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                            />
                          )}

                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white rounded text-[10px] font-mono font-bold">
                              Topic 0{vid.topicNumber}
                            </span>
                            {isMp4 ? (
                              <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">
                                MP4 Video
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                                Web Stream
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white rounded text-[10px] font-mono">
                            {vid.duration || '10:00'}
                          </div>

                          {isCurrentlyActiveOnWatchButton && (
                            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold shadow-xs flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Live on [WATCH]</span>
                            </div>
                          )}
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
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
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

                        {/* Set as Watch Button Video for this Topic */}
                        {!isCurrentlyActiveOnWatchButton ? (
                          <button
                            onClick={() => handleApplyToWatchButton(vid)}
                            className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-indigo-900" />
                            <span>Set as Topic 0{vid.topicNumber} [WATCH] Button Video</span>
                          </button>
                        ) : (
                          <div className="w-full py-1 px-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold text-center flex items-center justify-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Currently Active on Lesson [WATCH] Button</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
