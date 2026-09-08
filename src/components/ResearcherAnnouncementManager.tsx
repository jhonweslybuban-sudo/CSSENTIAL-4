import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Cpu,
  Info,
  Layers,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
  ExternalLink
} from 'lucide-react';
import { AnnouncementItem } from '../types';
import { api, DEFAULT_ANNOUNCEMENTS } from '../services/api';

export const ResearcherAnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'general' | 'exam' | 'safety' | 'game'>('general');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [date, setDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAnnouncements = () => {
    const list = api.getAnnouncements();
    setAnnouncements(list);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('general');
    setImageUrl('');
    setLink('');
    setDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Start Editing an existing announcement
  const handleStartEdit = (item: AnnouncementItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setImageUrl(item.imageUrl || '');
    setLink(item.link || '');
    setDate(item.date);
    setImagePreview(item.imageUrl || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Image File Upload (Convert to Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Limit file size to 2MB to keep localStorage snappy
    if (file.size > 2 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save (Create or Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please enter both a title and type-written content for the announcement.');
      return;
    }

    const itemDate = date.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (editingId) {
      api.updateAnnouncement(editingId, {
        title: title.trim(),
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
        link: link.trim() || undefined,
        date: itemDate
      });
      setStatusMessage('Announcement successfully updated!');
    } else {
      api.addAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
        link: link.trim() || undefined,
        date: itemDate
      });
      setStatusMessage('New announcement successfully published to Home page!');
    }

    loadAnnouncements();
    resetForm();

    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Delete
  const handleDelete = (id: string, itemTitle: string) => {
    if (confirm(`Are you sure you want to delete "${itemTitle}"? It will no longer appear on the Home page.`)) {
      api.deleteAnnouncement(id);
      loadAnnouncements();
      if (editingId === id) resetForm();
      setStatusMessage('Announcement deleted.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Move announcement up/down in carousel order
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= announcements.length) return;

    const updated = [...announcements];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    api.saveAnnouncements(updated);
    setAnnouncements(updated);
  };

  // Reset to default sample announcements
  const handleResetDefaults = () => {
    if (confirm('Reset announcements to the default laboratory announcements? This will replace custom ones.')) {
      api.saveAnnouncements(DEFAULT_ANNOUNCEMENTS);
      loadAnnouncements();
      resetForm();
      setStatusMessage('Reset to default announcements.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 shrink-0">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">
              Home Page Announcement &amp; Laboratory Notice Manager
            </h2>
            <p className="text-xs text-gray-500">
              Manage the 3-second auto-rotating announcements on the student Home web wall. Add type-written notices or uploadable visual banners.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
          <span>Reset Sample Notices</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CREATE / EDIT FORM (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
              <span>{editingId ? 'Edit Announcement' : 'Post New Announcement'}</span>
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-left">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Announcement Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Physical PC Assembly Practical Exam Schedule"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium"
                required
              />
            </div>

            {/* Category & Date in grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category Badge
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-medium bg-white"
                >
                  <option value="general">Course Notice (General)</option>
                  <option value="safety">Safety Directive (ESD / OHS)</option>
                  <option value="exam">Lab Practical / Assessment</option>
                  <option value="game">Gamified Learning &amp; Drills</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Display Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g., Oct 24, 2026"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Type-written Content */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Type-Written Announcement Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Type your official announcement, technician instructions, lab room schedule, or instructions here..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-medium resize-y"
                required
              />
            </div>

            {/* Uploadable Image Banner Section */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-gray-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Uploadable Image Banner (Optional)</span>
                </span>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </label>

              {imagePreview ? (
                <div className="relative h-28 rounded-lg overflow-hidden border border-gray-300 bg-slate-900">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                    Visual Attached
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="announcement-file-upload"
                  />
                  <label
                    htmlFor="announcement-file-upload"
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer text-center"
                  >
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs font-bold text-blue-700">
                      Click to upload image file from device
                    </span>
                    <span className="text-[10px] text-gray-400">
                      PNG, JPG, WEBP, or GIF (Max 2MB)
                    </span>
                  </label>

                  <div className="text-center text-[10px] text-gray-400 font-bold">
                    — OR PASTE IMAGE URL —
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value.trim() || null);
                    }}
                    placeholder="https://example.com/announcement-banner.jpg"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Optional Resource Link */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Optional Resource Link / Website URL
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {editingId ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'Save Changes' : 'Publish Announcement Now'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE ANNOUNCEMENTS LIST (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-black text-gray-900">
                Active Announcements Carousel ({announcements.length})
              </h3>
              <p className="text-[11px] text-gray-500">
                These notices cycle on the Home page every 3 seconds in this exact order.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              3s Interval
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-xs font-bold">No announcements published yet.</p>
              <p className="text-[11px]">Use the form on the left to add your first notice!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {announcements.map((item, index) => {
                const isItemEditing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isItemEditing
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* Thumbnail if present */}
                      {item.imageUrl && (
                        <div className="w-16 h-14 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-gray-200">
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            #{index + 1}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full ${
                            item.category === 'exam'
                              ? 'bg-rose-100 text-rose-800'
                              : item.category === 'safety'
                              ? 'bg-amber-100 text-amber-800'
                              : item.category === 'game'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {item.date}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-gray-900 truncate">
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                          {item.content}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Order Reorder */}
                        <div className="flex flex-col gap-0.5 mr-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMove(index, 'up')}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move slide earlier in rotation"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === announcements.length - 1}
                            onClick={() => handleMove(index, 'down')}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move slide later in rotation"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                          title="Edit announcement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
