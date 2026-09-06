import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Clock,
  Film,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileVideo,
  ExternalLink,
  Settings
} from 'lucide-react';
import { LessonContent } from '../types';
import { api } from '../services/api';

interface VideoModalProps {
  lesson: LessonContent | null;
  isOpen: boolean;
  onClose: () => void;
  onVideoUpdated?: () => void;
}

// Default educational video sources for each topic
const CURATED_VIDEOS: Record<string, { embedUrl: string; title: string; duration: string }> = {
  'lesson-1': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/P65QO_jK7Wk',
    title: 'Occupational Health & Safety (OHS) and ESD Workshop Protocols',
    duration: '10:45'
  },
  'lesson-2': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/IhX0fOUYd8Q',
    title: 'PC Hardware Component Identification & Compatibility Verification',
    duration: '14:20'
  },
  'lesson-3': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/g6b4r6A1j90',
    title: 'Step-by-Step PC Assembly, Cable Management & Standoffs',
    duration: '18:15'
  },
  'lesson-4': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/MfaO56Vw8cM',
    title: 'UEFI/BIOS Configuration, Boot Priority & Secure Boot Setup',
    duration: '12:30'
  },
  'lesson-5': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/bkaa131-lXk',
    title: 'Clean OS Installation, Partitioning & Essential Driver Setup',
    duration: '15:10'
  },
  'lesson-6': {
    embedUrl: 'https://www.youtube-nocookie.com/embed/0X6vY1-8g68',
    title: 'System Diagnostics, POST Beep Codes & Hardware Burn-in Stress Testing',
    duration: '16:40'
  }
};

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

export const VideoModal: React.FC<VideoModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onVideoUpdated
}) => {
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string; isCustom: boolean; isDirectFile: boolean } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Direct video controls for uploaded MP4 files
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Load video source whenever lesson changes or opens
  useEffect(() => {
    if (!lesson) return;

    const customMap = api.getCustomVideos();
    const custom = customMap[lesson.id];

    if (custom && custom.url) {
      const isDirect = custom.url.startsWith('blob:') || custom.url.endsWith('.mp4') || custom.url.endsWith('.webm');
      setActiveVideo({
        url: isDirect ? custom.url : formatYouTubeEmbed(custom.url),
        title: custom.title || `${lesson.title} (Custom Upload)`,
        isCustom: true,
        isDirectFile: isDirect
      });
    } else {
      const curated = CURATED_VIDEOS[lesson.id] || {
        embedUrl: lesson.videoUrl || 'https://www.youtube-nocookie.com/embed/0X6vY1-8g68',
        title: `${lesson.title} Laboratory Video Demonstration`,
        duration: lesson.duration || '12:00'
      };
      setActiveVideo({
        url: formatYouTubeEmbed(curated.embedUrl),
        title: curated.title,
        isCustom: false,
        isDirectFile: false
      });
    }
    setShowUploadDrawer(false);
    setUploadSuccess(null);
    setUploadError(null);
  }, [lesson, isOpen]);

  if (!isOpen || !lesson || !activeVideo) return null;

  // Handle local video file upload (MP4/WebM)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, etc.)');
      return;
    }

    try {
      const blobUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '');
      api.saveCustomVideo(lesson.id, {
        url: blobUrl,
        title: `${title} (Local Upload)`,
        type: 'video'
      });

      setActiveVideo({
        url: blobUrl,
        title: `${title} (Local Upload)`,
        isCustom: true,
        isDirectFile: true
      });

      setUploadSuccess(`Uploaded and loaded: ${file.name}`);
      setTimeout(() => setUploadSuccess(null), 3500);
      setShowUploadDrawer(false);
      onVideoUpdated?.();
    } catch (err) {
      setUploadError('Failed to process video file.');
    }
  };

  // Handle URL save (YouTube, Vimeo, MP4 link)
  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = customUrlInput.trim();
    if (!cleanUrl) {
      setUploadError('Please enter a valid video URL or embed link.');
      return;
    }

    const isDirect = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm');
    const embed = isDirect ? cleanUrl : formatYouTubeEmbed(cleanUrl);
    const title = customTitleInput.trim() || `${lesson.title} Custom Video`;

    api.saveCustomVideo(lesson.id, {
      url: embed,
      title,
      type: isDirect ? 'video' : 'embed'
    });

    setActiveVideo({
      url: embed,
      title,
      isCustom: true,
      isDirectFile: isDirect
    });

    setUploadSuccess('Custom video link saved and loaded successfully!');
    setCustomUrlInput('');
    setCustomTitleInput('');
    setTimeout(() => setUploadSuccess(null), 3500);
    setShowUploadDrawer(false);
    onVideoUpdated?.();
  };

  // Reset to default curated curriculum video
  const handleResetDefault = () => {
    api.deleteCustomVideo(lesson.id);
    const curated = CURATED_VIDEOS[lesson.id] || {
      embedUrl: lesson.videoUrl,
      title: `${lesson.title} Laboratory Video Demonstration`,
      duration: '12:00'
    };
    setActiveVideo({
      url: formatYouTubeEmbed(curated.embedUrl),
      title: curated.title,
      isCustom: false,
      isDirectFile: false
    });
    setUploadSuccess('Reset to default curated curriculum video.');
    setTimeout(() => setUploadSuccess(null), 3500);
    setShowUploadDrawer(false);
    onVideoUpdated?.();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-slate-950 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center border border-blue-500/40">
              <Film className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  Topic {lesson.topicNumber} Laboratory Demonstration
                </span>
                {activeVideo.isCustom && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    Custom Video
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {activeVideo.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadDrawer(!showUploadDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer border border-white/10"
              title="Upload your own video or change the video link"
            >
              <Upload className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Upload / Change Video</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload / Video Configuration Drawer */}
        {showUploadDrawer && (
          <div className="bg-slate-900 border-b border-slate-800 p-4 text-white animate-in slide-in-from-top-2 duration-200 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-200">
                  Video Demonstration Management for Topic {lesson.topicNumber}
                </h4>
              </div>
              <button
                onClick={() => setShowUploadDrawer(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option A: Upload Local File */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <FileVideo className="w-3.5 h-3.5" />
                  Option 1: Upload Personal Video File (MP4, WebM)
                </span>
                <p className="text-[11px] text-gray-400">
                  Select a video recorded in your laboratory or demonstration bench to play directly in this lesson viewer.
                </p>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-blue-700 hover:bg-blue-600 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Choose Video File</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Custom Web URL */}
              <form onSubmit={handleSaveUrl} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Option 2: Embed Video Link (YouTube, Vimeo, MP4 URL)
                </span>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:border-blue-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Custom Video Title (optional)"
                    value={customTitleInput}
                    onChange={(e) => setCustomTitleInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Save Link
                  </button>
                </div>
              </form>

            </div>

            {/* Reset / Status Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-400">
                Current: {activeVideo.isCustom ? 'Custom Video Active' : 'Default Curated Video Active'}
              </span>
              {activeVideo.isCustom && (
                <button
                  onClick={handleResetDefault}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Default Curriculum Video</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* Alert Notifications */}
        {uploadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
        {uploadError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs font-bold text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* REAL WATCHABLE VIDEO PLAYER CANVAS */}
        <div className="bg-black aspect-video w-full flex items-center justify-center relative group overflow-hidden">
          {activeVideo.isDirectFile ? (
            <div className="w-full h-full flex flex-col justify-center items-center relative">
              <video
                ref={videoRef}
                src={activeVideo.url}
                controls
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          ) : (
            <iframe
              src={`${activeVideo.url}?autoplay=1&rel=0&modestbranding=1`}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Overview & Educational Milestones */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h4 className="text-base font-bold text-gray-900">
                {lesson.title} - Laboratory Demonstration
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Competency Lesson #{lesson.topicNumber} • Estimated Demonstration: {lesson.duration}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-bold border border-blue-200">
                1080p HD Ready
              </span>
              <button
                onClick={() => setShowUploadDrawer(true)}
                className="px-3 py-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Change Video
              </button>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider mb-1.5">
              Demonstration Learning Focus
            </h5>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              This instructional video guides you through the practical competencies for{' '}
              <strong>{lesson.title.toLowerCase()}</strong>. Pay close attention to tool safety, component orientation markers, thermal paste application benchmarks, and diagnostic verification LED sequences.
            </p>
          </div>

          {/* Key Milestones */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
            <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Curriculum Video Milestones:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>00:00 - Tool Preparation &amp; Workspace Safety</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>02:15 - Physical Component Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>05:30 - Configuration &amp; Diagnostic Hookup</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>08:45 - POST Testing &amp; Final Checklist</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 font-medium">
              Need custom departmental footage? Use the "Upload / Change Video" button above.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              CLOSE VIEWER
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
