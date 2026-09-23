import React, { useState, useEffect } from 'react';
import {
  Layers,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';
import { HardwareOverviewSlide } from '../types';
import { api } from '../services/api';

export const ResearcherHardwareSlideManager: React.FC = () => {
  const [slides, setSlides] = useState<HardwareOverviewSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubtitle, setUploadSubtitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Motherboard');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Edit Slide State
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Preview / Lightbox
  const [previewSlide, setPreviewSlide] = useState<HardwareOverviewSlide | null>(null);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const data = await api.getHardwareSlides();
      setSlides(data || []);
    } catch (err) {
      console.error('Failed to load slides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    setSelectedFile(file);
    if (!uploadTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !previewDataUrl) {
      alert('Please select an image file.');
      return;
    }
    if (!uploadTitle.trim()) {
      alert('Please enter a title for the slide.');
      return;
    }

    setIsUploading(true);
    try {
      const newSlide = await api.uploadHardwareSlide({
        title: uploadTitle.trim(),
        subtitle: uploadSubtitle.trim() || 'Laboratory Technical Demonstration',
        description: uploadDesc.trim() || 'Custom technical demonstration image.',
        category: uploadCategory.trim() || 'Custom Hardware',
        fileName: selectedFile.name,
        fileData: previewDataUrl
      });

      setSlides((prev) => [newSlide, ...prev.filter((s) => s.id !== newSlide.id)]);
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewDataUrl(null);
      setUploadTitle('');
      setUploadSubtitle('');
      setUploadDesc('');
      setToastMessage(`Hardware slide "${newSlide.title}" uploaded successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload slide image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the slide "${title}"?`)) {
      await api.deleteHardwareSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      setToastMessage('Slide removed successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleStartEdit = (slide: HardwareOverviewSlide) => {
    setEditingSlideId(slide.id);
    setEditTitle(slide.title);
    setEditSubtitle(slide.subtitle || '');
    setEditCategory(slide.category || 'Custom Hardware');
    setEditDesc(slide.description || '');
  };

  const handleSaveEdit = async (slide: HardwareOverviewSlide) => {
    try {
      const updated = await api.saveHardwareSlide({
        ...slide,
        title: editTitle.trim() || slide.title,
        subtitle: editSubtitle.trim(),
        category: editCategory.trim(),
        description: editDesc.trim()
      });

      setSlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSlideId(null);
      setToastMessage('Slide details updated successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update slide:', err);
      alert('Failed to save changes.');
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Reset all hardware slides to default standard component images? Your custom uploads will be replaced.')) {
      const restored = await api.resetHardwareSlides();
      setSlides(restored);
      setToastMessage('Hardware slides reset to default curriculum configuration.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full">
              FACULTY HARDWARE EXHIBIT &amp; SLIDER MANAGEMENT
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
              {slides.length} Total Slides
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1 tracking-tight">
            Interactive Hardware Overview Slides
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Upload custom bench imagery, schematic diagrams, and motherboard breakdowns displayed in the Interactive Hardware Overview on the main portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Hardware Slide</span>
          </button>

          <button
            onClick={handleResetToDefault}
            title="Reset to default slides"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Slides Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 font-bold text-sm bg-white rounded-2xl border border-gray-200">
          Loading hardware slides...
        </div>
      ) : slides.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-700">No hardware overview slides currently configured.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
          >
            Upload First Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, index) => {
            const isEditing = editingSlideId === slide.id;

            return (
              <div
                key={slide.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                {/* Image Viewport */}
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20"></div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-700 text-white rounded-md shadow-xs">
                      #{index + 1} • {slide.category || 'Hardware'}
                    </span>
                    {slide.isCustom ? (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-amber-950 rounded-md shadow-xs flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Custom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-800/80 text-gray-300 rounded-md backdrop-blur-xs">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Zoom Action on Hover */}
                  <button
                    onClick={() => setPreviewSlide(slide)}
                    className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg backdrop-blur-xs text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Zoom in"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500">Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-bold border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500">Category</label>
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500">Subtitle</label>
                        <input
                          type="text"
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500">Description</label>
                        <textarea
                          rows={2}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-black text-gray-900 line-clamp-1">
                        {slide.title}
                      </h4>
                      {slide.subtitle && (
                        <p className="text-[11px] text-blue-700 font-bold mt-0.5 line-clamp-1">
                          {slide.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {slide.description}
                      </p>
                      {slide.fileName && (
                        <div className="mt-2 text-[10px] text-gray-400 font-mono">
                          File: {slide.fileName} {slide.fileSize ? `(${slide.fileSize})` : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-full justify-end">
                        <button
                          onClick={() => setEditingSlideId(null)}
                          className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(slide)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <button
                          onClick={() => handleStartEdit(slide)}
                          className="text-xs font-bold text-gray-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-gray-100"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(slide.id, slide.title)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-red-50"
                          title="Delete slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  {previewSlide.category || 'Hardware Slide'}
                </span>
                <h4 className="text-sm font-black truncate">{previewSlide.title}</h4>
              </div>
              <button
                onClick={() => setPreviewSlide(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center">
              <img
                src={previewSlide.imageUrl}
                alt={previewSlide.title}
                className="max-h-[60vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 bg-slate-900 text-gray-300 text-xs">
              <p className="font-semibold text-white">{previewSlide.subtitle}</p>
              <p className="mt-1 leading-relaxed">{previewSlide.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD NEW HARDWARE SLIDE MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Upload New Hardware Overview Slide</h3>
                  <p className="text-[11px] text-gray-300">Custom laboratory photo, motherboard breakdown or bench setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Select Image File *</label>
                <label className="border-2 border-dashed border-gray-300 hover:border-blue-600 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                  {previewDataUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewDataUrl}
                        alt="Preview"
                        className="h-32 w-auto object-contain mx-auto rounded-lg border border-gray-200"
                      />
                      <span className="text-[11px] font-bold text-blue-700 block">
                        Change image: {selectedFile?.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-blue-600 mb-1.5" />
                      <span className="text-xs font-bold text-gray-800">Click to Browse or Drag Image</span>
                      <span className="text-[11px] text-gray-500 mt-0.5">PNG, JPG, JPEG, WebP</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Slide Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Front Panel I/O Connectors"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl font-semibold text-gray-700"
                  >
                    <option value="Motherboard">Motherboard</option>
                    <option value="Processor">Processor & Socket</option>
                    <option value="Storage">Storage & M.2 NVMe</option>
                    <option value="Chassis & Airflow">Chassis & Thermal</option>
                    <option value="Safety & ESD">Safety & ESD Workstation</option>
                    <option value="Power Supply">Power Supply & Cables</option>
                    <option value="Custom Hardware">Custom Laboratory Hardware</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Subtitle / Component Specs</label>
                <input
                  type="text"
                  placeholder="e.g. Power SW, Reset SW, HDD LED & Power LED Pinout"
                  value={uploadSubtitle}
                  onChange={(e) => setUploadSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Technical Description / Assembly Notes</label>
                <textarea
                  rows={2}
                  placeholder="Installation procedures, key alignment notches, polarity considerations..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading Slide...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload to Slider</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
