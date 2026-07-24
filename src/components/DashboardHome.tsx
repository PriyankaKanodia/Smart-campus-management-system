import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  Bell, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

interface DashboardHomeProps {
  studentsCount: number;
  facultyCount: number;
  coursesCount: number;
  notices: any[];
  fees: any[];
  onAddNoticeClick?: () => void;
  user: any;
}

export default function DashboardHome({
  studentsCount,
  facultyCount,
  coursesCount,
  notices,
  fees,
  onAddNoticeClick,
  user
}: DashboardHomeProps) {
  // Mock data for charts
  const enrollmentTrend = [
    { year: '2021', CSE: 120, ECE: 90, ME: 60 },
    { year: '2022', CSE: 150, ECE: 100, ME: 75 },
    { year: '2023', CSE: 180, ECE: 110, ME: 80 },
    { year: '2024', CSE: 240, ECE: 130, ME: 90 },
    { year: '2025', CSE: 310, ECE: 150, ME: 110 },
    { year: '2026', CSE: 380, ECE: 170, ME: 120 }
  ];

  const totalFeesRequired = fees.reduce((sum, f) => sum + (f.amount || 0), 0) || 450000;
  const totalFeesPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0) || 310000;
  const totalFeesPending = fees.filter(f => f.status === 'unpaid' || f.status === 'pending').reduce((sum, f) => sum + (f.amount || 0), 0) || 140000;

  const financialDistribution = [
    { name: 'Paid Tuition', value: totalFeesPaid, color: '#10b981' },
    { name: 'Unpaid Tuition', value: totalFeesPending, color: '#ef4444' }
  ];

  const departmentRatios = [
    { dept: 'CSE', Faculty: 18, Students: 380 },
    { dept: 'ECE', Faculty: 12, Students: 170 },
    { dept: 'Mechanical', Faculty: 9, Students: 120 },
    { dept: 'Civil', Faculty: 6, Students: 85 },
    { dept: 'Biotech', Faculty: 5, Students: 60 }
  ];

  const recentActivities = [
    { id: 1, action: 'Registered Student', desc: 'Alice Vance was admitted to CSE batch 2026', time: '10 mins ago', type: 'student' },
    { id: 2, action: 'Course Approved', desc: 'New advanced curriculum "Artificial Intelligence" finalized', time: '1 hour ago', type: 'course' },
    { id: 3, action: 'Notice Board Update', desc: 'Published details for Midterm Examination July 2026', time: '3 hours ago', type: 'notice' },
    { id: 4, action: 'Fee Allocation', desc: 'Hostel charges generated for block-B residents', time: '1 day ago', type: 'finance' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Overview Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time indicators, operational stats, and security logs for current term.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">SYS-GATEWAY: 10.0.3000.1</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Database Sync Live"></span>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap size={22} />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} />
              +12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Total Enrolled Students</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1 font-mono">{studentsCount || 650}</h3>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex justify-between">
            <span>Regular: {Math.round(studentsCount * 0.85) || 550}</span>
            <span>Scholarship: {Math.round(studentsCount * 0.15) || 100}</span>
          </div>
        </div>

        {/* Card 2: Faculty */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Users size={22} />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-mono font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Stable
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Active Faculty Staff</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1 font-mono">{facultyCount || 50}</h3>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex justify-between">
            <span>Doctors: {Math.round(facultyCount * 0.6) || 30}</span>
            <span>Adjunct: {Math.round(facultyCount * 0.4) || 20}</span>
          </div>
        </div>

        {/* Card 3: Courses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <BookOpen size={22} />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +4 New
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Academic Programs</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1 font-mono">{coursesCount || 12}</h3>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex justify-between">
            <span>Core: {coursesCount} programs</span>
            <span>Accredited: Tier-1</span>
          </div>
        </div>

        {/* Card 4: Finance / Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard size={22} />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((totalFeesPaid / totalFeesRequired) * 100) || 68}% Paid
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Fee Collection</p>
            <h3 className="text-3xl font-display font-bold text-slate-900 mt-1 font-mono">
              ${(totalFeesPaid / 1000).toFixed(1)}k
            </h3>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex justify-between">
            <span>Collected: ${(totalFeesPaid / 1000).toFixed(1)}k</span>
            <span>Pending: ${(totalFeesPending / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Enrollment Growth Area Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-base">Student Growth Rate</h3>
              <p className="text-xs text-slate-500">Academic enrollment metrics mapped over CSE, ECE and ME blocks.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-indigo-500"><span className="h-2 w-2 rounded-full bg-indigo-500"></span>CSE</span>
              <span className="flex items-center gap-1 text-emerald-500"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>ECE</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCSE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorECE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="CSE" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCSE)" />
                <Area type="monotone" dataKey="ECE" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorECE)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fee Collection Status Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-base">Fee Invoice Status</h3>
            <p className="text-xs text-slate-500 mb-4">Paid vs Outstanding billing status for current term.</p>
          </div>
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {financialDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs text-slate-400 font-mono">Collected</span>
              <span className="text-lg font-bold text-slate-800 font-mono">
                {Math.round((totalFeesPaid / totalFeesRequired) * 100) || 68}%
              </span>
            </div>
          </div>
          <div className="space-y-2.5 mt-2">
            {financialDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5 last:border-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800 font-mono">${(item.value / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Notice Bulletin & System Audit Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">Campus Notice Bulletin</h3>
                <p className="text-xs text-slate-500">Latest announcements disseminated to the smart campus node.</p>
              </div>
              {onAddNoticeClick && (user?.role === 'admin' || user?.role === 'faculty') && (
                <button 
                  onClick={onAddNoticeClick}
                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition text-xs flex items-center gap-1 font-medium"
                >
                  <Plus size={14} /> New Notice
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {notices.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <Bell size={24} className="mx-auto mb-2 text-slate-300" />
                  No notices published yet.
                </div>
              ) : (
                notices.slice(0, 3).map((notice, idx) => (
                  <div key={notice._id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100/80 hover:border-slate-200 transition">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                        notice.audience === 'all' 
                          ? 'bg-blue-100 text-blue-700' 
                          : notice.audience === 'faculty'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        To: {notice.audience}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">By {notice.authorName || 'Admin'}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mt-1.5">{notice.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notice.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-4 text-center">
            <p className="text-[11px] text-indigo-600 hover:underline cursor-pointer">View all bulletin history →</p>
          </div>
        </div>

        {/* Recent Audit Action Logs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">System Access Audit Trail</h3>
                <p className="text-xs text-slate-500">Live immutable logs for record keeping and audit compliance.</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                <Clock size={12} strokeWidth={2.5} /> SECURE
              </span>
            </div>

            <div className="space-y-3.5">
              {recentActivities.map((log) => (
                <div key={log.id} className="flex items-start gap-3.5 text-xs">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${
                    log.type === 'student' ? 'bg-indigo-500' :
                    log.type === 'course' ? 'bg-teal-500' :
                    log.type === 'notice' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 leading-none">{log.action}</p>
                    <p className="text-slate-500 mt-1 leading-normal">{log.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-center flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>Audit Ref: SCMS-2026-X</span>
            <span className="text-indigo-600 hover:underline cursor-pointer">Export Security Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
