import React, { useState } from 'react';
import { 
  Plus, 
  Bell, 
  Megaphone, 
  Trash2, 
  X, 
  Users, 
  GraduationCap,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Notice } from '../types';
import { apiClient } from '../utils/apiClient';

interface NoticeBoardProps {
  notices: Notice[];
  onAdd: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  user: any;
}

export default function NoticeBoard({
  notices,
  onAdd,
  onDelete,
  user
}: NoticeBoardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [summarizedNoticeId, setSummarizedNoticeId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'all' as const
  });

  const handleSummarizeNotice = async (notice: Notice) => {
    setSummarizedNoticeId(notice._id);
    setIsSummarizing(true);
    setSummaryResult(null);
    try {
      const res = await apiClient.post('/ai/summarize-notice', {
        noticeTitle: notice.title,
        noticeContent: notice.content
      });
      setSummaryResult(res);
    } catch (err: any) {
      alert(`AI Notice Summarizer failed: ${err.message}`);
      setSummarizedNoticeId(null);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAdd({
        ...formData,
        authorId: user?.id || 'admin',
        authorName: user?.name || 'System Admin'
      });
      setIsAddModalOpen(false);
      setFormData({ title: '', content: '', audience: 'all' });
    } catch (err: any) {
      alert(`Notice publishing failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (confirm('Are you sure you want to permanently delete this announcement? It will disappear from all student and faculty bulletins.')) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const isPublisher = user?.role === 'admin' || user?.role === 'faculty';

  // Sort notices so newest appear first
  const sortedNotices = [...notices].reverse();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Campus Notice Bulletin</h2>
          <p className="text-xs text-slate-500 mt-1">Disseminate important curriculum announcements, examination schedules, or event invites.</p>
        </div>
        {isPublisher && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Megaphone size={16} /> Publish Notice
          </button>
        )}
      </div>

      {/* Bulletins List */}
      <div className="space-y-4">
        {sortedNotices.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
            <Bell size={36} className="mx-auto mb-2 text-slate-300" />
            No campus announcements published yet.
          </div>
        ) : (
          sortedNotices.map((notice) => (
            <div 
              key={notice._id} 
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      notice.audience === 'all' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : notice.audience === 'faculty'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      Target: {notice.audience}
                    </span>
                    <span className="text-slate-300 text-xs font-mono">•</span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Calendar size={12} />
                      <span>{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Today'}</span>
                    </div>
                  </div>

                  {isPublisher && onDelete && (
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete notice"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="mt-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-slate-900 text-base font-display">{notice.title}</h4>
                    <button
                      onClick={() => handleSummarizeNotice(notice)}
                      disabled={isSummarizing && summarizedNoticeId === notice._id}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles size={12} className="text-indigo-600" />
                      {isSummarizing && summarizedNoticeId === notice._id ? 'Summarizing...' : 'Summarize with AI'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{notice.content}</p>

                  {/* AI Summary Banner */}
                  {summarizedNoticeId === notice._id && summaryResult && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl text-xs space-y-2.5 animate-fade-in shadow-xs">
                      <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2">
                        <span className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
                          <Sparkles size={14} className="text-indigo-600" /> AI Executive Summary
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          summaryResult.urgencyLevel === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          Urgency: {summaryResult.urgencyLevel}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">{summaryResult.summary}</p>

                      {summaryResult.keyTakeaways && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">Key Bullet Takeaways:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                            {summaryResult.keyTakeaways.map((takeaway: string, idx: number) => (
                              <li key={idx}>{takeaway}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {summaryResult.targetAction && (
                        <div className="p-2.5 bg-white border border-indigo-100 rounded-xl text-indigo-900 font-semibold">
                          Action Required: <span className="font-normal text-indigo-800">{summaryResult.targetAction}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100/60 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Node node ID: REF-NOT-{notice._id.slice(-4).toUpperCase()}</span>
                <span>By: <strong className="text-slate-600">{notice.authorName || 'Campus Admin'}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Notice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 bg-slate-900 px-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-display font-semibold text-base">Broadcast Campus Announcement</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Target Audience</label>
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="all">Everyone (All Nodes)</option>
                  <option value="students">Students Only</option>
                  <option value="faculty">Faculty Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Announcement Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Midterm Exam Schedule Release"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Detailed Content</label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="Write clear instructions regarding deadlines, locations, etc..."
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-600/10"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
