import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Monitor,
  Sparkles,
  Users,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { BrandingSettings, ResearcherProfile } from '../types';
import { api, DEFAULT_BRANDING, DEFAULT_RESEARCHERS } from '../services/api';

export const ResearcherBrandingManager: React.FC = () => {
  // --- BRANDING STATE ---
  const [branding, setBranding] = useState<BrandingSettings>(() => api.getBranding());
  const [logoPreview, setLogoPreview] = useState<string | null>(branding.logoUrl || null);
  const [siteTitle, setSiteTitle] = useState(branding.siteTitle || 'CSSENTIAL');
  const [siteSubtitle, setSiteSubtitle] = useState(
    branding.siteSubtitle || 'A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration'
  );
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- RESEARCHERS STATE ---
  const [researchers, setResearchers] = useState<ResearcherProfile[]>(() => api.getResearchers());
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  
  // Researcher Form
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formAvatarPreview, setFormAvatarPreview] = useState<string | null>(null);
  const researcherAvatarInputRef = useRef<HTMLInputElement>(null);

  // Notification status
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Sync latest from server
    api.fetchRemoteBranding().then(b => {
      setBranding(b);
      setLogoPreview(b.logoUrl || null);
      if (b.siteTitle) setSiteTitle(b.siteTitle);
      if (b.siteSubtitle) setSiteSubtitle(b.siteSubtitle);
    });

    api.fetchRemoteResearchers().then(r => setResearchers(r));
  }, []);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --- LOGO HANDLERS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Please select a valid image file (PNG, JPG, SVG, WEBP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notify('Logo image is too large. Please upload an image under 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      notify('Logo loaded into preview! Click "Save Branding & Logo" below to apply it across the website.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BrandingSettings = {
      logoUrl: logoPreview || undefined,
      siteTitle: siteTitle.trim() || 'CSSENTIAL',
      siteSubtitle: siteSubtitle.trim()
    };
    api.saveBranding(updated);
    setBranding(updated);
    notify('Website logo and branding updated successfully! Header is now updated in real-time.', 'success');
  };

  const handleResetBranding = () => {
    if (confirm('Reset logo and site branding back to default CSSENTIAL system branding?')) {
      const def = api.resetBrandingToDefault();
      setBranding(def);
      setLogoPreview(null);
      setSiteTitle(def.siteTitle || 'CSSENTIAL');
      setSiteSubtitle(def.siteSubtitle || '');
      if (logoInputRef.current) logoInputRef.current.value = '';
      notify('Branding reset to system default.', 'success');
    }
  };

  // --- RESEARCHER PROFILE HANDLERS ---
  const handleStartEditResearcher = (person: ResearcherProfile) => {
    setEditingPersonId(person.id);
    setFormName(person.name);
    setFormRole(person.role);
    setFormTag(person.tag);
    setFormBio(person.bio);
    setFormAvatarUrl(person.avatarUrl || '');
    setFormAvatarPreview(person.avatarUrl || null);
    if (researcherAvatarInputRef.current) researcherAvatarInputRef.current.value = '';
  };

  const handleCancelEditResearcher = () => {
    setEditingPersonId(null);
    setFormName('');
    setFormRole('');
    setFormTag('');
    setFormBio('');
    setFormAvatarUrl('');
    setFormAvatarPreview(null);
    if (researcherAvatarInputRef.current) researcherAvatarInputRef.current.value = '';
  };

  const handleResearcherAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Please select an image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notify('Photo is too large. Please choose an image under 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormAvatarUrl(base64);
      setFormAvatarPreview(base64);
      notify('Photo loaded into preview. Click "Save Researcher Details" to apply.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResearcherAvatar = () => {
    setFormAvatarUrl('');
    setFormAvatarPreview(null);
    if (researcherAvatarInputRef.current) researcherAvatarInputRef.current.value = '';
  };

  const handleSaveResearcher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPersonId) return;

    if (!formName.trim()) {
      notify('Researcher name cannot be empty.', 'error');
      return;
    }

    const updatedList = api.updateResearcher(editingPersonId, {
      name: formName.trim(),
      role: formRole.trim(),
      tag: formTag.trim(),
      bio: formBio.trim(),
      avatarUrl: formAvatarPreview || undefined
    });

    setResearchers(updatedList);
    handleCancelEditResearcher();
    notify('Researcher profile updated successfully! The "About Us" page is now updated.', 'success');
  };

  const handleResetResearchers = () => {
    if (confirm('Reset all 4 researcher cards, descriptions, and photos to original defaults?')) {
      const def = api.resetResearchersToDefault();
      setResearchers(def);
      handleCancelEditResearcher();
      notify('All researcher profiles reset to original defaults.', 'success');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Toast notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-md text-sm font-semibold transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs px-2 py-1 rounded-md bg-white/70 hover:bg-white text-gray-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: WEBSITE LOGO & BRANDING */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Website Logo &amp; Header Branding
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload your custom school, laboratory, or research project logo anytime. It will replace the default monitor icon in the top header.
            </p>
          </div>

          <button
            onClick={handleResetBranding}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors self-start sm:self-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Logo</span>
          </button>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Logo Preview and Upload Box */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Current / New Logo
              </label>

              <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center gap-3 min-h-[190px]">
                {logoPreview ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-xl border border-gray-300 bg-white shadow-sm flex items-center justify-center p-1 overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-xs">
                      <Monitor className="w-9 h-9" />
                    </div>
                    <div className="text-xs font-semibold text-gray-600">Default Monitor Icon Active</div>
                    <p className="text-[11px] text-gray-400 max-w-[200px]">
                      Upload your project logo in PNG, JPG, or SVG format (transparent backgrounds look best)
                    </p>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo File</span>
                    </button>
                  </div>
                )}

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Recommended: Square or horizontal badge (PNG with transparent background, under 2MB).
              </p>
            </div>

            {/* Title & Subtitle settings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Website Platform Title
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="e.g. CSSENTIAL"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Platform Tagline / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={siteSubtitle}
                  onChange={(e) => setSiteSubtitle(e.target.value)}
                  placeholder="e.g. A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Live Live Header Preview */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Live Header Preview
                </span>
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs flex items-center gap-3">
                  {logoPreview ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-blue-200 bg-white shrink-0 flex items-center justify-center p-0.5">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white shrink-0">
                      <Monitor className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-black text-blue-900 leading-tight truncate">
                        {siteTitle || 'CSSENTIAL'}
                      </div>
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                        Learning Platform
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {siteSubtitle || 'A One-Click Multi-Intervention Platform for Troubleshooting Computer System Installation and Configuration'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Branding &amp; Logo</span>
                </button>
              </div>

            </div>

          </div>
        </form>
      </div>

      {/* SECTION 2: RESEARCHERS PROFILE, PHOTOS & DESCRIPTIONS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Manage Researchers (Photos &amp; Descriptions)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Update researcher portraits/pictures, bios, and specializations shown in the public <strong>ABOUT US</strong> section whenever you want.
            </p>
          </div>

          <button
            onClick={handleResetResearchers}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors self-start sm:self-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Researchers</span>
          </button>
        </div>

        {/* Edit Modal / Form if an author is selected */}
        {editingPersonId && (
          <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-blue-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-700" />
                <span>Editing Profile: {formName}</span>
              </h4>
              <button
                type="button"
                onClick={handleCancelEditResearcher}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 px-2 py-1 rounded-md bg-white border border-gray-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveResearcher} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Photo Upload for this researcher */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Researcher Photo
                  </label>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col items-center text-center gap-3">
                    {formAvatarPreview ? (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-300 shadow-sm bg-gray-100 flex items-center justify-center">
                        <img
                          src={formAvatarPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-sm">
                        {formName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'RES'}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => researcherAvatarInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 rounded-lg cursor-pointer transition-colors"
                      >
                        {formAvatarPreview ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {formAvatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveResearcherAvatar}
                          className="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={researcherAvatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleResearcherAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    Square portrait recommended (under 2MB).
                  </p>
                </div>

                {/* Form fields */}
                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        placeholder="e.g. Jhon Wesly T. Buban"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase">
                        Role
                      </label>
                      <input
                        type="text"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        placeholder="e.g. Developer / Researcher"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase">
                      Specialization / Responsibility Tag
                    </label>
                    <input
                      type="text"
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g. Full-Stack Development & AI Integration"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase">
                      Biography / Research Contribution Description
                    </label>
                    <textarea
                      rows={3}
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      placeholder="Describe this researcher's contribution to CSSENTIAL..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEditResearcher}
                      className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Researcher Details</span>
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* 4 Researcher Cards Display with Edit Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {researchers.map((person) => (
            <div
              key={person.id}
              className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start relative hover:border-blue-300 transition-colors"
            >
              {/* Photo or Initials */}
              {person.avatarUrl ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-blue-200 shadow-xs shrink-0 bg-white flex items-center justify-center">
                  <img
                    src={person.avatarUrl}
                    alt={person.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div
                  className={`w-16 h-16 rounded-xl ${person.color || 'bg-blue-600'} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {person.initials || person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      {person.role}
                    </span>
                    <h4 className="text-sm font-black text-gray-900 leading-tight truncate">
                      {person.name}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartEditResearcher(person)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Profile &amp; Photo</span>
                  </button>
                </div>

                <div className="text-[11px] font-bold text-blue-950 bg-blue-100/60 px-2 py-0.5 rounded-md inline-block">
                  {person.tag}
                </div>

                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                  {person.bio}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
