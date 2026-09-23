import React, { useState, useEffect } from 'react';
import { Monitor, Download, Play, FileText, CheckCircle2, Film, Award, Printer, Plus, Upload, Trash2, ExternalLink, X, Video, GraduationCap, FileVideo, HardDrive, Sparkles, Link as LinkIcon, Info, FolderDown } from 'lucide-react';
import { LESSONS_DATA } from '../data/curriculum';
import { LessonContent, CollectionVideo, TeacherMaterial } from '../types';
import { LessonViewerModal } from './LessonViewerModal';
import { VideoModal } from './VideoModal';
import { AcademicPrintModal } from './AcademicPrintModal';
import { generateDocxBlob } from '../services/academicDocument';
import {
  downloadPowerPointPresentation,
  downloadPresentationDeck
} from '../services/presentationService';
import { api } from '../services/api';

interface CollectionViewProps {
  studentId: string;
  sessionId: string;
  studentName?: string;
  yearSection?: string;
  initialTopicId?: string | null;
  onClearInitialTopic?: () => void;
  onOpenTeacherCMS?: (tab?: 'ACTIVITIES' | 'MATERIALS') => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  studentId,
  sessionId,
  studentName = 'Registered Student',
  yearSection = 'General Section',
  initialTopicId,
  onClearInitialTopic,
  onOpenTeacherCMS
}) => {
  const [selectedLessonForPresentation, setSelectedLessonForPresentation] = useState<LessonContent | null>(null);
  const [selectedLessonForVideo, setSelectedLessonForVideo] = useState<LessonContent | null>(null);
  const [selectedLessonForPrint, setSelectedLessonForPrint] = useState<LessonContent | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Videos collection state
  const [videos, setVideos] = useState<CollectionVideo[]>([]);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videoModalTab, setVideoModalTab] = useState<'upload_mp4' | 'embed_url'>('upload_mp4');
  const [selectedMp4File, setSelectedMp4File] = useState<File | null>(null);
  const [selectedMp4Base64, setSelectedMp4Base64] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoModalError, setVideoModalError] = useState<string | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoTopic, setNewVideoTopic] = useState(1);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('10:00');
  const [newVideoInstructor, setNewVideoInstructor] = useState('CSSENTIAL Faculty Lead');
  const [newVideoDesc, setNewVideoDesc] = useState('');

  // Teacher authored materials state
  const [teacherMaterials, setTeacherMaterials] = useState<TeacherMaterial[]>([]);
  const [selectedMaterialForView, setSelectedMaterialForView] = useState<TeacherMaterial | null>(null);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatTopic, setNewMatTopic] = useState(1);
  const [newMatDesc, setNewMatDesc] = useState('');
  const [newMatContent, setNewMatContent] = useState('');
  const [newMatFileUrl, setNewMatFileUrl] = useState('');
  const [newMatInstructor, setNewMatInstructor] = useState('CSSENTIAL Faculty Lead');

  const loadVideos = async () => {
    try {
      const vids = await api.getCollectionVideos();
      const filtered = (vids || []).filter(v => 
        !['vid-1', 'vid-2', 'vid-3'].includes(v.id)
      );
      setVideos(filtered);
    } catch (err) {
      console.error('Failed to load collection videos:', err);
    }
  };

  const loadTeacherMaterials = async () => {
    try {
      const mats = await api.getTeacherMaterials();
      setTeacherMaterials(mats.filter(m => m.is_published));
    } catch (err) {
      console.error('Failed to load teacher materials:', err);
    }
  };

  useEffect(() => {
    loadVideos();
    loadTeacherMaterials();
  }, []);

  const handleMp4FileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
      setVideoModalError('Please choose a valid video file (.mp4 or .webm format).');
      return;
    }

    setVideoModalError(null);
    setSelectedMp4File(file);

    // Auto populate video title if empty
    if (!newVideoTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewVideoTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setSelectedMp4Base64(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoModalError(null);

    if (videoModalTab === 'upload_mp4') {
      if (!selectedMp4File || !selectedMp4Base64) {
        setVideoModalError('Please choose an MP4 video file to upload.');
        return;
      }
      if (!newVideoTitle.trim()) {
        setVideoModalError('Please provide a title for the video demonstration.');
        return;
      }

      setIsUploadingVideo(true);
      try {
        const saved = await api.uploadCollectionVideo({
          title: newVideoTitle.trim(),
          description: newVideoDesc.trim() || 'Laboratory practicum video demonstration.',
          fileName: selectedMp4File.name,
          fileData: selectedMp4Base64,
          topicNumber: Number(newVideoTopic),
          duration: newVideoDuration.trim() || '10:00',
          instructor: newVideoInstructor.trim() || 'CSSENTIAL Faculty Lead'
        });

        setVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
        setShowAddVideoModal(false);
        resetVideoForm();
        setDownloadNotice(`Successfully uploaded practicum MP4: "${saved.title}"`);
        setTimeout(() => setDownloadNotice(null), 4000);
      } catch (err) {
        console.error('Error uploading video:', err);
        setVideoModalError('Failed to upload video file. Please try again.');
      } finally {
        setIsUploadingVideo(false);
      }

    } else {
      // Embed URL Tab
      if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
        setVideoModalError('Please provide both video title and URL.');
        return;
      }

      let cleanUrl = newVideoUrl.trim();
      if (cleanUrl.includes('youtube.com/watch?v=')) {
        const vidId = cleanUrl.split('watch?v=')[1]?.split('&')[0];
        if (vidId) cleanUrl = `https://www.youtube-nocookie.com/embed/${vidId}`;
      } else if (cleanUrl.includes('youtu.be/')) {
        const vidId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
        if (vidId) cleanUrl = `https://www.youtube-nocookie.com/embed/${vidId}`;
      }

      try {
        const saved = await api.saveCollectionVideo({
          title: newVideoTitle.trim(),
          topicNumber: Number(newVideoTopic),
          url: cleanUrl,
          duration: newVideoDuration.trim() || '10:00',
          instructor: newVideoInstructor.trim() || 'CSSENTIAL Faculty Lead',
          description: newVideoDesc.trim() || 'Laboratory practicum video demonstration.',
          thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80',
          isUploadedMp4: cleanUrl.endsWith('.mp4') || cleanUrl.startsWith('/uploads/')
        });

        setVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)]);
        setShowAddVideoModal(false);
        resetVideoForm();
        setDownloadNotice(`Added video demonstration: "${saved.title}"`);
        setTimeout(() => setDownloadNotice(null), 3500);
      } catch (err) {
        console.error('Error saving video:', err);
        setVideoModalError('Failed to save video link.');
      }
    }
  };

  const resetVideoForm = () => {
    setSelectedMp4File(null);
    setSelectedMp4Base64(null);
    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDesc('');
    setVideoModalError(null);
    setIsUploadingVideo(false);
  };

  const handleDeleteVideo = async (vidId: string) => {
    if (!confirm('Are you sure you want to remove this video material?')) return;
    await api.deleteCollectionVideo(vidId);
    setVideos(prev => prev.filter(v => v.id !== vidId));
    setDownloadNotice('Video removed from collection.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleSaveNewMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;
    try {
      const saved = await api.saveTeacherMaterial({
        title: newMatTitle.trim(),
        topicNumber: Number(newMatTopic),
        description: newMatDesc.trim() || 'Curriculum handout and laboratory reference documentation.',
        content: newMatContent.trim(),
        file_url: newMatFileUrl.trim() || undefined,
        instructor: newMatInstructor.trim() || 'CSSENTIAL Faculty Lead',
        is_published: true
      });
      setTeacherMaterials(prev => [saved, ...prev]);
      setShowAddMaterialModal(false);
      setNewMatTitle('');
      setNewMatDesc('');
      setNewMatContent('');
      setNewMatFileUrl('');
      setDownloadNotice(`Published curriculum material: "${saved.title}"`);
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (err) {
      console.error('Error saving curriculum material:', err);
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!confirm('Are you sure you want to delete this curriculum handout?')) return;
    await api.deleteTeacherMaterial(matId);
    setTeacherMaterials(prev => prev.filter(m => m.id !== matId));
    setDownloadNotice('Curriculum handout removed.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  // Auto-open or focus topic when navigated with initialTopicId
  useEffect(() => {
    if (initialTopicId) {
      const match = LESSONS_DATA.find((l) => l.id === initialTopicId);
      if (match) {
        setSelectedLessonForPresentation(match);
      }
      onClearInitialTopic?.();
    }
  }, [initialTopicId, onClearInitialTopic]);

  const handleDownloadDocx = async (lesson: LessonContent) => {
    try {
      const blob = generateDocxBlob(lesson, studentName, studentId, yearSection);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CSSENTIAL_Topic_${lesson.topicNumber}_${lesson.title.replace(/\s+/g, '_')}_Manual.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record in research database
      await api.recordDownload({
        student_id: studentId,
        session_id: sessionId,
        resource_name: `${lesson.title} Formal Laboratory Manual (DOCX)`,
        file_type: 'DOCX'
      });

      setDownloadNotice(`Downloaded Academic DOCX Manual for Topic ${lesson.topicNumber}: "${lesson.title}"`);
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDownloadPptx = async (lesson: LessonContent) => {
    try {
      await downloadPowerPointPresentation(lesson, studentId, sessionId, studentName, yearSection);
      setDownloadNotice(`Downloaded PowerPoint (.pptx) Presentation for Topic 0${lesson.topicNumber}: "${lesson.title}"`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err) {
      console.error('PPTX download error:', err);
    }
  };

  const handleDownloadSlides = async (lesson: LessonContent) => {
    try {
      await downloadPowerPointPresentation(lesson, studentId, sessionId, studentName, yearSection);
      setDownloadNotice(`Downloaded PowerPoint (.pptx) Presentation for Topic 0${lesson.topicNumber}: "${lesson.title}"`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err) {
      console.error('Slide download error:', err);
    }
  };

  const handleRecordPdfDownload = async (format: 'PDF' | 'DOCX') => {
    if (selectedLessonForPrint) {
      await api.recordDownload({
        student_id: studentId,
        session_id: sessionId,
        resource_name: `${selectedLessonForPrint.title} Laboratory Practicum Manual (${format})`,
        file_type: format
      });
      setDownloadNotice(`Generated Academic ${format} for Topic ${selectedLessonForPrint.topicNumber}: "${selectedLessonForPrint.title}"`);
      setTimeout(() => setDownloadNotice(null), 3500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Figure 3 Title & Subheading */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest block">
          CURRICULUM COLLECTION
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
          Computer System Installation and Configuration
        </h2>
        <p className="text-xs text-gray-600">
          Comprehensive competency modules containing interactive lecture presentations, formal academic laboratory manuals in PDF/DOCX, and instructional video demonstrations.
        </p>
      </div>

      {/* Download Alert Banner */}
      {downloadNotice && (
        <div className="max-w-xl mx-auto p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Figure 3 Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">LESSON / TOPIC</th>
                <th className="py-4 px-4 text-center">PRESENTATION</th>
                <th className="py-4 px-4 text-center">ACADEMIC DOWNLOADS</th>
                <th className="py-4 px-4 text-center">VIDEOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {LESSONS_DATA.map((lesson, index) => (
                <tr
                  key={lesson.id}
                  id={`collection-row-${index + 1}`}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  {/* Topic Name and Description */}
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        0{lesson.topicNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-blue-700 uppercase">
                            Lesson {lesson.topicNumber}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            CSIC-30{lesson.topicNumber}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Presentation Button */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <button
                        id={`present-btn-${lesson.id}`}
                        onClick={() => setSelectedLessonForPresentation(lesson)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        title="Launch Interactive Slide Deck Presentation"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>PRESENT</span>
                      </button>
                      <button
                        id={`download-slides-${lesson.id}`}
                        onClick={() => handleDownloadPptx(lesson)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 text-[10px] font-black text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md transition-colors cursor-pointer"
                        title="Download official Microsoft PowerPoint (.pptx) presentation"
                      >
                        <Download className="w-3 h-3 text-amber-600" />
                        <span>PowerPoint (.pptx)</span>
                      </button>
                    </div>
                  </td>

                  {/* Download Options (PDF & DOCX) - Academically Engaging Design */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        id={`download-pdf-${lesson.id}`}
                        onClick={() => setSelectedLessonForPrint(lesson)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="View & Print Official Academic PDF Manual"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-600" />
                        <span>PDF Manual</span>
                      </button>
                      <button
                        id={`download-docx-${lesson.id}`}
                        onClick={() => handleDownloadDocx(lesson)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Download Academic Microsoft Word (.DOC) Manual"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Word DOCX</span>
                      </button>
                    </div>
                  </td>

                  {/* Watch Video Button */}
                  <td className="py-4 px-4 text-center">
                    <button
                      id={`watch-video-${lesson.id}`}
                      onClick={() => setSelectedLessonForVideo(lesson)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>WATCH</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: INSTRUCTOR-AUTHORED COURSE MATERIALS & HANDOUTS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200/80 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Faculty Published Handouts &amp; Curriculum Guides
            </span>
            <h3 className="text-lg sm:text-xl font-black text-indigo-950">
              Instructor Reference Materials &amp; Notes
            </h3>
            <p className="text-xs text-indigo-900/70">
              Supplementary study handouts, laboratory protocols, and safety checklists published by your professors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-black text-indigo-800 bg-white border border-indigo-200 px-3 py-1 rounded-full shadow-xs">
              {teacherMaterials.length} {teacherMaterials.length === 1 ? 'Handout' : 'Handouts'} Available
            </span>
          </div>
        </div>

        {teacherMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-indigo-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">No Supplementary Handouts Published Yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Supplementary study handouts, lesson notes, and laboratory protocols published by your instructors will be displayed here for download.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Topic {mat.topicNumber || 1}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 truncate max-w-[150px]">
                      By {mat.instructor || 'Faculty'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-gray-900 line-clamp-2">
                    {mat.title}
                  </h4>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {mat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">
                    {mat.created_at ? new Date(mat.created_at).toLocaleDateString() : 'Active'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteMaterial(mat.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedMaterialForView(mat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-700 text-indigo-700 hover:text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Handout</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: INSTRUCTIONAL VIDEO MATERIALS & LABORATORY RECORDINGS */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              Instructional Video Demonstrations
            </span>
            <h3 className="text-lg sm:text-xl font-black text-gray-950">
              Laboratory Practicum Video Collection
            </h3>
            <p className="text-xs text-gray-500">
              Technical demonstrations, hardware diagnostics, and step-by-step physical assembly videos.
            </p>
          </div>

          <button
            onClick={() => {
              resetVideoForm();
              setShowAddVideoModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload MP4 / Add Video</span>
          </button>
        </div>

        {/* Faculty & Researcher Dashboard Notice */}
        <div className="bg-linear-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
              <FileVideo className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <span>Practicum Video Demonstration Repository</span>
                <span className="px-1.5 py-0.5 bg-blue-500/30 text-[10px] rounded text-blue-200 font-mono">MP4 SUPPORT</span>
              </h4>
              <p className="text-[11px] text-gray-300">
                Upload local MP4 demonstration recordings or stream institutional videos. Authorized instructors and researchers can also audit, manage, and curate the full collection in the Researcher Telemetry Dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 sm:p-12 text-center shadow-xs">
            <Film className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">No videos in the practicum collection yet</p>
            <p className="text-xs text-gray-500 mt-1">Click "Upload MP4 / Add Video" above to upload an MP4 recording or embed a video demonstration.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((vid) => {
              const isMp4 = vid.isUploadedMp4 || vid.url?.endsWith('.mp4') || vid.url?.startsWith('/uploads/');
              return (
                <div
                  key={vid.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Thumbnail / Video Preview Header */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={vid.thumbnail || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80'}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-blue-600/90 text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                          Topic 0{vid.topicNumber}
                        </span>
                        {isMp4 && (
                          <span className="px-2 py-0.5 bg-purple-600/90 text-white rounded-md text-[10px] font-bold flex items-center gap-1">
                            <FileVideo className="w-3 h-3" />
                            MP4
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {vid.fileSize && (
                          <span className="px-1.5 py-0.5 bg-slate-800/90 text-gray-300 rounded text-[10px] font-mono">
                            {vid.fileSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 truncate max-w-[140px]" title={vid.instructor || 'Faculty Lead'}>
                        {vid.instructor || 'Faculty Lead'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isMp4 && vid.url && (
                          <a
                            href={vid.url}
                            download={vid.fileName || `${vid.title}.mp4`}
                            className="p-1.5 text-gray-500 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Download MP4 file"
                          >
                            <FolderDown className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const matchingLesson = LESSONS_DATA.find(l => l.topicNumber === vid.topicNumber) || LESSONS_DATA[0];
                            setSelectedLessonForVideo({
                              ...matchingLesson,
                              title: vid.title,
                              videoUrl: vid.url
                            });
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Watch</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload / Add Video Material Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-black flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>Laboratory Practicum Video Submission</span>
              </h3>
              <button
                onClick={() => {
                  resetVideoForm();
                  setShowAddVideoModal(false);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher: MP4 Upload vs URL Embed */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setVideoModalTab('upload_mp4');
                  setVideoModalError(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  videoModalTab === 'upload_mp4'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <FileVideo className="w-3.5 h-3.5" />
                <span>Upload MP4 Video File</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoModalTab('embed_url');
                  setVideoModalError(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  videoModalTab === 'embed_url'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Video Link / Embed URL</span>
              </button>
            </div>

            {videoModalError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold">
                {videoModalError}
              </div>
            )}

            <form onSubmit={handleSaveNewVideo} className="p-6 space-y-4">
              {videoModalTab === 'upload_mp4' ? (
                /* MP4 File Selector */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                    <span>Select MP4 Video File *</span>
                    {selectedMp4File && (
                      <span className="text-[11px] font-mono text-blue-600">
                        {(selectedMp4File.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </label>
                  <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                    <FileVideo className="w-8 h-8 text-blue-600" />
                    <div className="text-center">
                      <span className="text-xs font-bold text-gray-800">
                        {selectedMp4File ? selectedMp4File.name : 'Click to choose or drop MP4 video'}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Accepts MP4 and WebM video recordings from laboratory practicum sessions
                      </p>
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
                /* URL Input */
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Video Link / Embed URL *</label>
                  <input
                    type="url"
                    required
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-gray-500">
                    YouTube links, Vimeo, or web-hosted MP4 links.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Demonstration Title *</label>
                <input
                  type="text"
                  required
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="e.g., Motherboard Power Connections & Diagnostics"
                  className="w-full px-3.5 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Aligned Curriculum Topic</label>
                  <select
                    value={newVideoTopic}
                    onChange={(e) => setNewVideoTopic(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  >
                    <option value={1}>Lesson 1: Planning & Prep</option>
                    <option value={2}>Lesson 2: Hardware Assembly</option>
                    <option value={3}>Lesson 3: OS & Drivers</option>
                    <option value={4}>Lesson 4: Applications & Security</option>
                    <option value={5}>Lesson 5: System Testing</option>
                    <option value={6}>Lesson 6: Troubleshooting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Instructor / Author Name</label>
                  <input
                    type="text"
                    value={newVideoInstructor}
                    onChange={(e) => setNewVideoInstructor(e.target.value)}
                    placeholder="e.g. Lead Course Instructor"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Practicum Notes / Description</label>
                <textarea
                  rows={2}
                  value={newVideoDesc}
                  onChange={(e) => setNewVideoDesc(e.target.value)}
                  placeholder="Key concepts, lab safety guidelines, and equipment demonstrated in this video."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetVideoForm();
                    setShowAddVideoModal(false);
                  }}
                  disabled={isUploadingVideo}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingVideo}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isUploadingVideo ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading MP4...</span>
                    </>
                  ) : (
                    <span>{videoModalTab === 'upload_mp4' ? 'Upload MP4 Video' : 'Save & Embed Video'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <LessonViewerModal
        lesson={selectedLessonForPresentation}
        isOpen={!!selectedLessonForPresentation}
        onClose={() => setSelectedLessonForPresentation(null)}
        studentId={studentId}
        sessionId={sessionId}
        studentName={studentName}
        yearSection={yearSection}
      />

      <VideoModal
        lesson={selectedLessonForVideo}
        isOpen={!!selectedLessonForVideo}
        onClose={() => setSelectedLessonForVideo(null)}
      />

      <AcademicPrintModal
        isOpen={!!selectedLessonForPrint}
        lesson={selectedLessonForPrint}
        studentName={studentName}
        studentId={studentId}
        yearSection={yearSection}
        onClose={() => setSelectedLessonForPrint(null)}
        onRecordDownload={handleRecordPdfDownload}
      />

      {/* Instructor Material Viewer Modal */}
      {selectedMaterialForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                  Topic {selectedMaterialForView.topicNumber || 1} • Faculty Handout
                </span>
                <h3 className="text-base font-black">
                  {selectedMaterialForView.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMaterialForView(null)}
                className="text-indigo-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-gray-500 border-b pb-3">
                <span>Instructor: <strong className="text-gray-900">{selectedMaterialForView.instructor || 'Faculty'}</strong></span>
                <span>Published: {selectedMaterialForView.created_at ? new Date(selectedMaterialForView.created_at).toLocaleDateString() : 'Active'}</span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">Summary</h4>
                <p className="text-xs text-gray-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  {selectedMaterialForView.description}
                </p>
              </div>

              {selectedMaterialForView.content && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">Curriculum Handout Content</h4>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">
                    {selectedMaterialForView.content}
                  </div>
                </div>
              )}

              {selectedMaterialForView.file_url && (
                <div className="pt-2">
                  <a
                    href={selectedMaterialForView.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white font-bold text-xs rounded-xl hover:bg-indigo-800 transition-colors"
                  >
                    <span>Open Attached File / External Reference</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-gray-500" />
                <span>Print Handout</span>
              </button>
              <button
                onClick={() => setSelectedMaterialForView(null)}
                className="px-4 py-1.5 bg-gray-800 text-white hover:bg-gray-900 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author / Upload Curriculum Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-auto animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-800 rounded-lg text-indigo-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Author Curriculum Material</h3>
                  <p className="text-xs text-indigo-200">Publish supplementary handouts, notes, or laboratory protocols</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="p-1 text-indigo-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMaterial} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Handout / Document Title *</label>
                <input
                  type="text"
                  required
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="e.g., Laboratory Guide: Static Discharge & ESD Wrist Strap Protocol"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Target Curriculum Topic</label>
                  <select
                    value={newMatTopic}
                    onChange={(e) => setNewMatTopic(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {LESSONS_DATA.map((l) => (
                      <option key={l.topicNumber} value={l.topicNumber}>
                        Topic {l.topicNumber}: {l.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Instructor Attribution</label>
                  <input
                    type="text"
                    value={newMatInstructor}
                    onChange={(e) => setNewMatInstructor(e.target.value)}
                    placeholder="e.g. Faculty Course Instructor"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Summary / Learning Objectives *</label>
                <textarea
                  rows={2}
                  required
                  value={newMatDesc}
                  onChange={(e) => setNewMatDesc(e.target.value)}
                  placeholder="Brief overview of what students will learn from this supplementary material..."
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Handout / Document Full Text Content</label>
                <textarea
                  rows={6}
                  value={newMatContent}
                  onChange={(e) => setNewMatContent(e.target.value)}
                  placeholder="Paste or write detailed curriculum notes, step-by-step lab procedures, safety checklists, or study notes..."
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">External Document URL or PDF Link (Optional)</label>
                <input
                  type="url"
                  value={newMatFileUrl}
                  onChange={(e) => setNewMatFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://.../handout.pdf"
                  className="w-full px-3.5 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Publish Material to Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
