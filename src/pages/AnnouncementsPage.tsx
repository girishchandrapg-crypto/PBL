import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Announcement } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { role, isAdmin, isTeacher, isStudent, user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Create Announcement Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Academic' as Announcement['category'],
    targetAudience: 'All' as Announcement['targetAudience'],
    priority: 'Normal' as Announcement['priority'],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createAnnouncement({
        ...form,
        authorName: user?.name || 'Administration Office',
        publishedDate: new Date().toISOString().split('T')[0],
      });
      setShowCreateModal(false);
      setForm({
        title: '',
        content: '',
        category: 'Academic',
        targetAudience: 'All',
        priority: 'Normal',
      });
      await loadAnnouncements();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = announcements.filter((a) => {
    if (!categoryFilter) return true;
    return a.category === categoryFilter;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Notices & Circulars</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official bulletins, academic updates, examination schedules, and campus events.
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Publish Announcement
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['', 'Academic', 'Exam', 'Fees', 'Event', 'General'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat || 'All Categories'}
          </button>
        ))}
      </div>

      {/* Announcements Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No notices found in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3 relative group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.priority === 'High'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400">• Audience: {item.targetAudience}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {item.publishedDate}
                  </span>
                  {!isStudent && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-all"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.content}</p>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Published by: <strong>{item.authorName}</strong></span>
                {item.priority === 'High' && (
                  <span className="text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> High Priority Notice
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Publish University Notice"
          maxWidth="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Fall Term Mid-Semester Examination Timetable"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Message *</label>
              <textarea
                rows={4}
                required
                placeholder="Detailed announcement circular..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Academic">Academic</option>
                  <option value="Exam">Exam</option>
                  <option value="Fees">Fees</option>
                  <option value="Event">Event</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="All">All University</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Faculty Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Notice'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
