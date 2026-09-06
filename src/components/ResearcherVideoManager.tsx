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
  Sparkles
} from 'lucide-react';
import { LESSONS_DATA } from '../data/curriculum';
import { api } from '../services/api';

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
  const [customVideos, setCustomVideos] = useState<Record<string, { url: string; title?: string; type: 'video' | 'embed' }>>({});
  const [selectedTopicId, setSelectedTopicId] = useState<string>(LESSONS_DATA[0].id);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [statusNotice, setStatusNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  const refreshVideos = () => {
    const v = api.getCustomVideos();
    setCustomVideos(v);
  };

  useEffect(() => {
    refreshVideos();
  }, []);

  const handleUploadFile = (topicId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setStatusNotice({ text: 'Please select a valid video file (MP4, WebM, OGG).', isError: true });
      return;
    }

    try {
      const blobUrl = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^/.]+$/, '');
      const lesson = LESSONS_DATA.find(l => l.id === topicId);
      const title = `${lesson?.title || 'Topic'} - ${name} (Instructor Upload)`;

      api.saveCustomVideo(topicId, {
        url: blobUrl,
        title,
        type: 'video'
      });

      refreshVideos();
      setStatusNotice({ text: `Uploaded custom video for Topic ${lesson?.topicNumber || ''}: "${title}"` });
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err) {
      setStatusNotice({ text: 'Failed to process local video file.', isError: true });
    }
  };

  const handleSaveUrl = (topicId: string) => {
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

    refreshVideos();
    setUrlInput('');
    setTitleInput('');
    setStatusNotice({ text: `Custom video link saved for Topic ${lesson?.topicNumber}: "${title}"` });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleResetToDefault = (topicId: string) => {
    const lesson = LESSONS_DATA.find(l => l.id === topicId);
    api.deleteCustomVideo(topicId);
    refreshVideos();
    setStatusNotice({ text: `Reset Topic ${lesson?.topicNumber} to default curriculum demonstration video.` });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <Film className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Instructional Video Demonstration Management
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Manage curriculum videos across all 6 competencies. Upload your own MP4 demonstration recordings or embed institutional YouTube/Vimeo links.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[11px] font-bold self-start sm:self-auto">
            Live Collection Sync
          </span>
        </div>
      </div>

      {/* Notification */}
      {statusNotice && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="px-4 py-3 bg-slate-900 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-xs font-bold">{previewTitle}</span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1"
              >
                Close Preview
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {previewUrl.startsWith('blob:') || previewUrl.endsWith('.mp4') ? (
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

      {/* Topics Grid */}
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
                {/* Actions */}
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

                  <label className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload MP4</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={(e) => handleUploadFile(lesson.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* URL Input Form */}
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
                      onClick={() => handleSaveUrl(lesson.id)}
                      className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {hasCustom && (
                  <button
                    onClick={() => handleResetToDefault(lesson.id)}
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
  );
};
